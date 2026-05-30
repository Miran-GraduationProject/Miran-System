import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../src/models/supervisorModel/reportTemplateModel.js",
  () => ({
    addReportField: jest.fn(),
    getTemplateById: jest.fn(),
    createTemplate: jest.fn(),
    getTemplateFields: jest.fn(),
    updateReportField: jest.fn(),
    deleteReportField: jest.fn(),
    getAllTemplates: jest.fn(),
    deleteTemplateAndFields: jest.fn(),
  })
);

const templateModel = await import(
  "../../../src/models/supervisorModel/reportTemplateModel.js"
);

const { createTemplateController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("create template", () => {
  test("The template has been successfully created", async () => {
    templateModel.createTemplate.mockResolvedValue({ insertId: 10 });

    const req = {
      user: { id: 111222333 },
      body: { reportTitle: "Weekly Report" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTemplateController(req, res);

    expect(templateModel.createTemplate).toHaveBeenCalledWith(
      111222333,
      "Weekly Report"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template created successfully",
      templateID: 10,
    });
  });

  test("The template was not created because reportTitle is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: { reportTitle: "" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTemplateController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "reportTitle is required",
    });
  });

  test("The template was not created because database failed", async () => {
    templateModel.createTemplate.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
      body: { reportTitle: "Weekly Report" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTemplateController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error creating template",
      error: "DB failed",
    });
  });
});