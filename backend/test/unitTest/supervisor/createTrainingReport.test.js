import { jest } from "@jest/globals";

/* Mock createReportModel */
jest.unstable_mockModule(
  "../../../src/models/supervisorModel/createReportModel.js",
  () => ({
    createTrainingReport: jest.fn(),
    getTrainingPeriods: jest.fn(),
  })
);

/* Mock reportTemplateModel */
jest.unstable_mockModule(
  "../../../src/models/supervisorModel/reportTemplateModel.js",
  () => ({
    createTemplate: jest.fn(),
    createTemplateFields: jest.fn(),
  })
);

const createReportModel = await import(
  "../../../src/models/supervisorModel/createReportModel.js"
);

const reportTemplateModel = await import(
  "../../../src/models/supervisorModel/reportTemplateModel.js"
);

const { createTrainingReportController } = await import(
  "../../../src/controllers/SupervisorControllers/createTrainingReport.js"
);

describe("create training report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The training report has been successfully created using existing template", async () => {
    createReportModel.createTrainingReport.mockResolvedValue({
      success: true,
      statusCode: 201,
      message: "Training report created successfully",
      reportID: 1,
    });

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 5,
        periodID: 2,
        reportTitle: "Weekly Training Report",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(createReportModel.createTrainingReport).toHaveBeenCalledWith(
      5,
      2,
      111222333,
      "Weekly Training Report"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 201,
      message: "Training report created successfully",
      reportID: 1,
    });
  });

  test("The training report has been successfully created from scratch", async () => {
    reportTemplateModel.createTemplate.mockResolvedValue({
      insertId: 10,
    });

    reportTemplateModel.createTemplateFields.mockResolvedValue({
      success: true,
    });

    createReportModel.createTrainingReport.mockResolvedValue({
      success: true,
      statusCode: 201,
      message: "Training report created successfully",
      reportID: 3,
    });

    const req = {
      user: { id: 111222333 },
      body: {
        periodID: 2,
        reportTitle: "New Training Report",
        fields: [
          {
            fieldLabel: "Tasks",
            fieldType: "textarea",
            isRequired: 1,
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(reportTemplateModel.createTemplate).toHaveBeenCalledWith(
      111222333,
      "New Training Report"
    );

    expect(reportTemplateModel.createTemplateFields).toHaveBeenCalledWith(
      10,
      [
        {
          fieldLabel: "Tasks",
          fieldType: "textarea",
          isRequired: 1,
        },
      ]
    );

    expect(createReportModel.createTrainingReport).toHaveBeenCalledWith(
      10,
      2,
      111222333,
      "New Training Report"
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      statusCode: 201,
      message: "Training report created successfully",
      reportID: 3,
    });
  });

  test("The training report was not created because supervisor ID is missing", async () => {
    const req = {
      user: {},
      body: {
        templateID: 5,
        periodID: 2,
        reportTitle: "Weekly Training Report",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The training report was not created because periodID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 5,
        reportTitle: "Weekly Training Report",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Training period ID is required",
    });
  });

  test("The training report was not created because reportTitle is missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 5,
        periodID: 2,
        reportTitle: "",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Report title is required",
    });
  });

  test("The training report was not created from scratch because fields are missing", async () => {
    const req = {
      user: { id: 111222333 },
      body: {
        periodID: 2,
        reportTitle: "New Training Report",
        fields: [],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Fields are required when creating a report from scratch",
    });
  });

  test("The training report was not created because fields creation failed", async () => {
    reportTemplateModel.createTemplate.mockResolvedValue({
      insertId: 10,
    });

    reportTemplateModel.createTemplateFields.mockResolvedValue({
      success: false,
      statusCode: 400,
      message: "Invalid fields",
    });

    const req = {
      user: { id: 111222333 },
      body: {
        periodID: 2,
        reportTitle: "New Training Report",
        fields: [
          {
            fieldLabel: "Tasks",
            fieldType: "textarea",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 400,
      message: "Invalid fields",
    });
  });

  test("The training report was not created because createTrainingReport returned failure", async () => {
    createReportModel.createTrainingReport.mockResolvedValue({
      success: false,
      statusCode: 400,
      message: "Invalid templateID",
    });

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 99,
        periodID: 2,
        reportTitle: "Weekly Training Report",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 400,
      message: "Invalid templateID",
    });
  });

  test("The training report was not created because template title already exists", async () => {
    const err = new Error("Duplicate entry");
    err.code = "ER_DUP_ENTRY";

    reportTemplateModel.createTemplate.mockRejectedValue(err);

    const req = {
      user: { id: 111222333 },
      body: {
        periodID: 2,
        reportTitle: "Duplicate Report",
        fields: [
          {
            fieldLabel: "Tasks",
            fieldType: "textarea",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Template title already exists for this supervisor",
    });
  });

  test("The training report was not successfully created", async () => {
    createReportModel.createTrainingReport.mockRejectedValue(
      new Error("DB failed")
    );

    const req = {
      user: { id: 111222333 },
      body: {
        templateID: 5,
        periodID: 2,
        reportTitle: "Weekly Training Report",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await createTrainingReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error creating training report",
      error: "DB failed",
    });
  });
});