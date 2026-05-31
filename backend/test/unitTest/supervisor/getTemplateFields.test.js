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

const { getTemplateFieldsController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("get template fields", () => {
  test("The template fields have been successfully fetched", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);

    templateModel.getTemplateFields.mockResolvedValue([
      { fieldID: 1, fieldLabel: "Tasks", fieldType: "textarea" },
    ]);

    const req = {
      user: { id: 111222333 },
      params: { templateID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTemplateFieldsController(req, res);

    expect(templateModel.getTemplateById).toHaveBeenCalledWith(
      "1",
      111222333
    );

    expect(templateModel.getTemplateFields).toHaveBeenCalledWith("1");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      templateID: "1",
      fields: [
        { fieldID: 1, fieldLabel: "Tasks", fieldType: "textarea" },
      ],
    });
  });

  test("The template fields were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
      params: { templateID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTemplateFieldsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The template fields were not fetched because templateID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTemplateFieldsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "templateID is required",
    });
  });

  test("The template fields were not fetched because template was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([]);

    const req = {
      user: { id: 111222333 },
      params: { templateID: "99" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTemplateFieldsController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template not found",
    });
  });

  test("The template fields were not successfully fetched", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.getTemplateFields.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
      params: { templateID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTemplateFieldsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching fields",
      error: "DB failed",
    });
  });
});