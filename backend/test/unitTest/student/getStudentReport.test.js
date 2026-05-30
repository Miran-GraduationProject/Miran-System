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

const { getReportController } = await import(
  "../../../src/controllers/studentControllers/reportController.js"
);

describe("get student report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The report has been successfully fetched for the student", async () => {
    reportModel.getReport.mockResolvedValue([
      {
        reportID: 1,
        templateID: 10,
        reportTitle: "Weekly Report",
        submissionID: 5,
        studentReportState: "SUBMITTED",
        approvalStatus: "PENDING",
      },
    ]);

    reportModel.getReportFields.mockResolvedValue([
      {
        fieldID: 1,
        fieldLabel: "Tasks",
        fieldType: "textarea",
      },
    ]);

    reportModel.getReportAnswers.mockResolvedValue([
      {
        fieldID: 1,
        answer: "Completed tasks",
      },
    ]);

    const req = {
      user: { id: 444500456 },
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportController(req, res);

    expect(reportModel.getReport).toHaveBeenCalledWith("1", 444500456);
    expect(reportModel.getReportFields).toHaveBeenCalledWith(10);
    expect(reportModel.getReportAnswers).toHaveBeenCalledWith(5);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      report: {
        reportID: 1,
        templateID: 10,
        reportTitle: "Weekly Report",
        submissionID: 5,
        studentReportState: "SUBMITTED",
        approvalStatus: "PENDING",
      },
      fields: [
        {
          fieldID: 1,
          fieldLabel: "Tasks",
          fieldType: "textarea",
        },
      ],
      answers: [
        {
          fieldID: 1,
          answer: "Completed tasks",
        },
      ],
    });
  });

  test("The report was not fetched because student ID is missing", async () => {
    const req = {
      user: {},
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student ID not found in token",
    });
  });

  test("The report was not fetched because reportID is missing", async () => {
    const req = {
      user: { id: 444500456 },
      params: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "reportID is required",
    });
  });

  test("The report was not found or not available for this student", async () => {
    reportModel.getReport.mockResolvedValue([]);

    const req = {
      user: { id: 444500456 },
      params: { reportID: "99" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Report not found or not available for this student",
    });
  });

  test("The report was not successfully fetched", async () => {
    reportModel.getReport.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 444500456 },
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching report",
      error: "DB failed",
    });
  });
});