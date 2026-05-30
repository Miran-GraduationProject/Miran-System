import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../src/models/supervisorModel/reportViewModel.js",
  () => ({
    getReport: jest.fn(),
    getAllReports: jest.fn(),
    getReportsStats: jest.fn(),
    getReportStudentsForSupervisor: jest.fn(),
    getSubmissionAnswersForSupervisor: jest.fn(),
    approveSubmission: jest.fn(),
  })
);

const reportViewModel = await import(
  "../../../src/models/supervisorModel/reportViewModel.js"
);

const { getReportsController } = await import(
  "../../../src/controllers/SupervisorControllers/reportViewController.js"
);

describe("get reports", () => {
  test("The reports have been successfully fetched", async () => {
    reportViewModel.getAllReports.mockResolvedValue([
      { reportID: 1, reportTitle: "Weekly Report" },
    ]);

    reportViewModel.getReportsStats.mockResolvedValue({
      totalReports: 1,
      submittedReports: 0,
    });

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportsController(req, res);

    expect(reportViewModel.getAllReports).toHaveBeenCalledWith(111222333);
    expect(reportViewModel.getReportsStats).toHaveBeenCalledWith(111222333);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      stats: {
        totalReports: 1,
        submittedReports: 0,
      },
      reports: [
        { reportID: 1, reportTitle: "Weekly Report" },
      ],
    });
  });

  test("The reports were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The reports were not successfully fetched", async () => {
    reportViewModel.getAllReports.mockRejectedValue(new Error("DB failed"));

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching reports",
      error: "DB failed",
    });
  });
});