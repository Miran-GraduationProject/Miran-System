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

const { getSubmissionAnswersController } = await import(
  "../../../src/controllers/SupervisorControllers/reportViewController.js"
);

describe("get submission answers", () => {
  test("The submission answers have been successfully fetched", async () => {
    reportViewModel.getSubmissionAnswersForSupervisor.mockResolvedValue({
      submissionID: 1,
      studentID: 444500456,
      answers: [
        {
          fieldLabel: "Tasks",
          answer: "Completed tasks",
        },
      ],
    });

    const req = {
      user: { id: 111222333 },
      params: { submissionID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getSubmissionAnswersController(req, res);

    expect(
      reportViewModel.getSubmissionAnswersForSupervisor
    ).toHaveBeenCalledWith("1", 111222333);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      submission: {
        submissionID: 1,
        studentID: 444500456,
        answers: [
          {
            fieldLabel: "Tasks",
            answer: "Completed tasks",
          },
        ],
      },
    });
  });

  test("The submission answers were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
      params: { submissionID: "1" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getSubmissionAnswersController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The submission answers were not fetched because submissionID is missing", async () => {
    const req = {
      user: { id: 111222333 },
      params: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getSubmissionAnswersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "submissionID is required",
    });
  });

  test("The submission was not found", async () => {
    reportViewModel.getSubmissionAnswersForSupervisor.mockResolvedValue(null);

    const req = {
      user: { id: 111222333 },
      params: { submissionID: "99" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getSubmissionAnswersController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Submission not found",
    });
  });

  test("The submission answers were not successfully fetched", async () => {
    reportViewModel.getSubmissionAnswersForSupervisor.mockRejectedValue(
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

    await getSubmissionAnswersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching submission answers",
      error: "DB failed",
    });
  });
});