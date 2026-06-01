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

const { addFieldController } = await import(
  "../../../src/controllers/SupervisorControllers/reportTemplate.js"
);

describe("add field", () => {
  test("The field has been successfully added", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.addReportField.mockResolvedValue({ insertId: 5 });

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 1,
        fieldLabel: "Student Tasks",
        fieldType: "textarea",
        isRequired: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(templateModel.getTemplateById).toHaveBeenCalledWith(1, 111222333);

    expect(templateModel.addReportField).toHaveBeenCalledWith(
      1,
      "Student Tasks",
      "textarea",
      1
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Field added successfully",
      fieldID: 5,
    });
  });

  test("The field was not added because supervisor ID is missing", async () => {
    const req = {
      user: {},
      body: {
        templateID: 1,
        fieldLabel: "Student Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The field was not added because templateID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        fieldLabel: "Student Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "templateID is required",
    });
  });

  test("The field was not added because fieldLabel is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 1,
        fieldLabel: "",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldLabel is required",
    });
  });

  test("The field was not added because fieldType is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 1,
        fieldLabel: "Student Tasks",
        fieldType: "",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "fieldType is required",
    });
  });

  test("The field was not added because template was not found", async () => {
    templateModel.getTemplateById.mockResolvedValue([]);

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 99,
        fieldLabel: "Student Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Template not found",
    });
  });

  test("The field was not successfully added", async () => {
    templateModel.getTemplateById.mockResolvedValue([{ templateID: 1 }]);
    templateModel.addReportField.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 1,
        fieldLabel: "Student Tasks",
        fieldType: "textarea",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await addFieldController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error adding field",
      error: "DB failed",
    });
  });
});