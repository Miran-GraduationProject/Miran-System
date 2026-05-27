import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../src/models/supervisorModel/reportTemplateModel.js",
  () => ({
    addReportField: jest.fn(),
    getTemplateById: jest.fn(),
    createTemplate: jest.fn(),
    getTemplateFields: jest.fn(),
    updateReportField: jest.fn(),
    deleteReportField: jest.fn(),
    getAllTemplates: jest.fn(),
    deleteTemplateAndFields: jest.fn()
  })
);

const templateModel = await import(
  "../../src/models/supervisorModel/reportTemplateModel.js"
);

const { deleteTemplateController } = await import(
  "../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("delete template", () => {
  test("The template has been successfully deleted", async () => {
    templateModel.deleteTemplateAndFields.mockResolvedValue();

    const req = { params: { templateID: "1" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteTemplateController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template and its fields deleted successfully",
    });
  });

  test("The template was not successfully deleted", async () => {
    const err = new Error("DB failed");
    templateModel.deleteTemplateAndFields.mockRejectedValue(err);

    const req = { params: { templateID: "68" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await deleteTemplateController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error deleting template",
      error: "DB failed",
    });
  });
});