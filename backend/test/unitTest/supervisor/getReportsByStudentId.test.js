import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/reviewCase.js", () => ({
  getReportsByStudentIdModel: jest.fn(),
  getReportByIdModel: jest.fn()
}));

const model = await import("../../src/models/reviewCase.js");
const { getReportsByStudentId } = await import("../../src/controllers/reviewCase.controller.js");

describe("getReportsByStudentId", () => {

  test("reports exist", async () => {
    model.getReportsByStudentIdModel.mockResolvedValue([
      { reportID: 1, studentID: 10 }
    ]);

    const req = { params: { studentId: "10" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportsByStudentId(req, res);

    expect(model.getReportsByStudentIdModel).toHaveBeenCalledWith("10");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Student reports retrieved successfully",
      data: [{ reportID: 1, studentID: 10 }]
    });
  });

  test("reports not found", async () => {
    model.getReportsByStudentIdModel.mockResolvedValue([]);

    const req = { params: { studentId: "10" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportsByStudentId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No reports found for this student"
    });
  });

  test("throws error", async () => {
    model.getReportsByStudentIdModel.mockRejectedValue(new Error("DB error"));

    const req = { params: { studentId: "10" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportsByStudentId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error while fetching student reports"
    });
  });

});