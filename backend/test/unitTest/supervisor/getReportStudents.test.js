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

const { getReportStudentsController } = await import(
  "../../../src/controllers/SupervisorControllers/reportViewController.js"
);

describe("get report students", () => {
  test("The report students have been successfully fetched", async () => {
    reportViewModel.getReportStudentsForSupervisor.mockResolvedValue([
      {
        studentID: 444500456,
        studentName: "Faisal",
        submissionStatus: "Submitted",
      },
    ]);

    const req = {
      user: { id: 111222333 },
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportStudentsController(req, res);

    expect(
      reportViewModel.getReportStudentsForSupervisor
    ).toHaveBeenCalledWith("1", 111222333);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      students: [
        {
          studentID: 444500456,
          studentName: "Faisal",
          submissionStatus: "Submitted",
        },
      ],
    });
  });

  test("The report students were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The report students were not fetched because reportID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "reportID is required",
    });
  });

  test("The report students were not successfully fetched", async () => {
    reportViewModel.getReportStudentsForSupervisor.mockRejectedValue(
      new Error("DB failed")
    );

    const req = {
      user: { id: 111222333 },
      params: { reportID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getReportStudentsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching report students",
      error: "DB failed",
    });
  });
});