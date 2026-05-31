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

const { updateFieldController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("update field", () => {
  test("The field has been successfully updated", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.updateReportField.mockResolvedValue({ affectedRows: 1 });

    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
        isRequired: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(templateModel.getTemplateById).toHaveBeenCalledWith(1, 111222333);

    expect(templateModel.updateReportField).toHaveBeenCalledWith(
      7,
      "Updated Tasks",
      "textarea",
      1
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Field updated successfully",
    });
  });

  test("The field was not updated because supervisor ID is missing", async () => {
    const req = {
      user: {},
      body: {
        fieldID: 7,
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The field was not updated because templateID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "templateID is required",
    });
  });

  test("The field was not updated because fieldID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldID is required",
    });
  });

  test("The field was not updated because fieldLabel is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        templateID: 1,
        fieldLabel: "",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldLabel is required",
    });
  });

  test("The field was not updated because fieldType is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldType is required",
    });
  });

  test("The field was not updated because template was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([]);

    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        templateID: 99,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template not found",
    });
  });

  test("The field was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.updateReportField.mockResolvedValue({ affectedRows: 0 });

    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 99,
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Field not found",
    });
  });

  test("The field was not successfully updated", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.updateReportField.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
      body: {
        fieldID: 7,
        templateID: 1,
        fieldLabel: "Updated Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await updateFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error updating field",
      error: "DB failed",
    });
  });
});