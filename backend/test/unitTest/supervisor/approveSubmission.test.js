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

const { approveSubmissionController } = await import(
  "../../../src/controllers/SupervisorControllers/reportViewController.js"
);

describe("approve submission", () => {
  test("The submission has been successfully approved", async () => {
    reportViewModel.approveSubmission.mockResolvedValue({
      affectedRows: 1,
    });

    const req = {
      user: { id: 111222333 },
      params: { submissionID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveSubmissionController(req, res);

    expect(reportViewModel.approveSubmission).toHaveBeenCalledWith(
      "1",
      111222333
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Submission approved successfully",
    });
  });

  test("The submission was not approved because supervisor ID is missing", async () => {
    const req = {
      user: {},
      params: { submissionID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveSubmissionController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The submission was not approved because submissionID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveSubmissionController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "submissionID is required",
    });
  });

  test("The submission was not found or not related to this supervisor", async () => {
    reportViewModel.approveSubmission.mockResolvedValue({
      affectedRows: 0,
    });

    const req = {
      user: { id: 111222333 },
      params: { submissionID: "99" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveSubmissionController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Submission not found or not related to this supervisor",
    });
  });

  test("The submission was not successfully approved", async () => {
    reportViewModel.approveSubmission.mockRejectedValue(
      new Error("DB failed")
    );

    const req = {
      user: { id: 111222333 },
      params: { submissionID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await approveSubmissionController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error approving submission",
      error: "DB failed",
    });
  });
});