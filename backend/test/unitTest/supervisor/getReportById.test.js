import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/models/reviewCase.js", () => ({
  getReportsByStudentIdModel: jest.fn(),
  getReportByIdModel: jest.fn()
}));

const model = await import("../../src/models/reviewCase.js");
const { getReportById } = await import("../../src/controllers/reviewCase.controller.js");

describe("getReportById", () => {

  test("report exists", async () => {
    model.getReportByIdModel.mockResolvedValue([
      { reportID: 5, studentID: 22 }
    ]);

    const req = { params: { reportId: "5" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportById(req, res);

    expect(model.getReportByIdModel).toHaveBeenCalledWith("5");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Case report retrieved successfully",
      data: { reportID: 5, studentID: 22 }
    });
  });

  test("report not found", async () => {
    model.getReportByIdModel.mockResolvedValue([]);

    const req = { params: { reportId: "5" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Report not found"
    });
  });

  test("throws error", async () => {
    model.getReportByIdModel.mockRejectedValue(new Error("DB error"));

    const req = { params: { reportId: "5" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getReportById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error while fetching case report"
    });
  });

});