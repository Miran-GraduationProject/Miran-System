import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../src/models/supervisorModel/reportTemplateModel.js",
  () => ({
    getAllTemplates: jest.fn(),
    getTemplateById: jest.fn(),
    createTemplate: jest.fn(),
    getTemplateFields: jest.fn(),
    addReportField: jest.fn(),
    updateReportField: jest.fn(),
    deleteReportField: jest.fn(),
    deleteTemplateAndFields: jest.fn(),
  })
);

const templateModel = await import(
  "../../../src/models/supervisorModel/reportTemplateModel.js"
);

const { getAllTemplatesController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("get all templates", () => {
  test("The templates have been successfully fetched", async () => {
    templateModel.getAllTemplates.mockResolvedValue([
      { templateID: 1, reportTitle: "Weekly Report" },
    ]);

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllTemplatesController(req, res);

    expect(templateModel.getAllTemplates).toHaveBeenCalledWith(111222333);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { templateID: 1, reportTitle: "Weekly Report" },
    ]);
  });

  test("The templates were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllTemplatesController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The templates were not successfully fetched", async () => {
    templateModel.getAllTemplates.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getAllTemplatesController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching templates",
      error: "DB failed",
    });
  });
});