import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../src/models/studentModel/reportModel.js",
  () => ({
    getStudentReports: jest.fn(),
    getReport: jest.fn(),
    getReportFields: jest.fn(),
    getReportAnswers: jest.fn(),
    submitReportAnswers: jest.fn(),
  })
);

const reportModel = await import(
  "../../../src/models/studentModel/reportModel.js"
);

const { submitReportController } = await import(
  "../../../src/controllers/studentControllers/reportController.js"
);

describe("submit report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The report has been successfully submitted", async () => {
    reportModel.submitReportAnswers.mockResolvedValue({
      success: true,
      statusCode: 201,
      submissionID: 20,
      reportID: 1,
      totalAnswers: 2,
    });

    const req = {
      user: { id: 444500456 },
      body: {
        reportID: 1,
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
          {
            fieldID: 2,
            answer: "2026-05-29",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(reportModel.submitReportAnswers).toHaveBeenCalledWith(
      1,
      444500456,
      [
        {
          fieldID: 1,
          answer: "Completed tasks",
        },
        {
          fieldID: 2,
          answer: "2026-05-29",
        },
      ]
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Report submitted successfully",
      submissionID: 20,
      reportID: 1,
      totalAnswers: 2,
    });
  });

  test("The report was not submitted because student ID is missing", async () => {
    const req = {
      user: {},
      body: {
        reportID: 1,
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student ID not found in token",
    });
  });

  test("The report was not submitted because reportID is missing", async () => {
    const req = {
      user: { id: 444500456 },
      body: {
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "reportID and answers are required",
    });
  });

  test("The report was not submitted because answers are missing", async () => {
    const req = {
      user: { id: 444500456 },
      body: {
        reportID: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "reportID and answers are required",
    });
  });

  test("The report was not submitted because answers array is empty", async () => {
    const req = {
      user: { id: 444500456 },
      body: {
        reportID: 1,
        answers: [],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "answers are required",
    });
  });

  test("The report was not submitted because model returned failure", async () => {
    reportModel.submitReportAnswers.mockResolvedValue({
      success: false,
      statusCode: 409,
      message: "Report already submitted",
    });

    const req = {
      user: { id: 444500456 },
      body: {
        reportID: 1,
        answers: [
          {
            fieldID: 1,
            answer: "Updated answer",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 409,
      message: "Report already submitted",
    });
  });

  test("The report was not successfully submitted", async () => {
    reportModel.submitReportAnswers.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 444500456 },
      body: {
        reportID: 1,
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
        ],
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await submitReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error submitting report",
      error: "DB failed",
    });
  });
});