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

const { deleteFieldController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("delete field", () => {
  test("The field has been successfully deleted", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.deleteReportField.mockResolvedValue({ affectedRows: 1 });

    const req = {
      user: { id: 111222333 },
      params: { fieldID: "7" },
      body: { templateID: 1 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(templateModel.getTemplateById).toHaveBeenCalledWith(1, 111222333);
    expect(templateModel.deleteReportField).toHaveBeenCalledWith("7");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Field deleted successfully",
    });
  });

  test("The field was not deleted because supervisor ID is missing", async () => {
    const req = {
      user: {},
      params: { fieldID: "7" },
      body: { templateID: 1 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The field was not deleted because templateID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: { fieldID: "7" },
      body: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "templateID is required",
    });
  });

  test("The field was not deleted because fieldID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: {},
      body: { templateID: 1 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldID is required",
    });
  });

  test("The field was not deleted because template was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([]);

    const req = {
      user: { id: 111222333 },
      params: { fieldID: "7" },
      body: { templateID: 99 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template not found",
    });
  });

  test("The field was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.deleteReportField.mockResolvedValue({ affectedRows: 0 });

    const req = {
      user: { id: 111222333 },
      params: { fieldID: "99" },
      body: { templateID: 1 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Field not found",
    });
  });

  test("The field was not successfully deleted", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.deleteReportField.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
      params: { fieldID: "7" },
      body: { templateID: 1 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error deleting field",
      error: "DB failed",
    });
  });
});