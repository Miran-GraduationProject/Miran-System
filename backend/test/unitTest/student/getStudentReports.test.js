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

const { getStudentReportsController } = await import(
  "../../../src/controllers/studentControllers/reportController.js"
);

describe("get student reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The student reports have been successfully fetched", async () => {
    reportModel.getStudentReports.mockResolvedValue([
      {
        reportID: 1,
        reportTitle: "Weekly Report",
        studentReportState: "NOT_SUBMITTED",
      },
    ]);

    const req = {
      user: { id: 444500456 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getStudentReportsController(req, res);

    expect(reportModel.getStudentReports).toHaveBeenCalledWith(444500456);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      reports: [
        {
          reportID: 1,
          reportTitle: "Weekly Report",
          studentReportState: "NOT_SUBMITTED",
        },
      ],
    });
  });

  test("The student reports were not fetched because student ID is missing", async () => {
    const req = {
      user: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getStudentReportsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student ID not found in token",
    });
  });

  test("The student reports were not successfully fetched", async () => {
    reportModel.getStudentReports.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 444500456 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getStudentReportsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error fetching student reports",
      error: "DB failed",
    });
  });
});