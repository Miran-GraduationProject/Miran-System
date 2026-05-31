import { jest } from "@jest/globals";

/* Mock createReportModel */
jest.unstable_mockModule(
  "../../../src/models/supervisorModel/createReportModel.js",
  () => ({
    createTrainingReport: jest.fn(),
    getTrainingPeriods: jest.fn(),
  })
);

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

const { getTrainingPeriodsController } = await import(
  "../../../src/controllers/SupervisorControllers/createTrainingReport.js"
);

describe("get training periods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("The training periods have been successfully fetched", async () => {
    createReportModel.getTrainingPeriods.mockResolvedValue([
      {
        periodID: 1,
        name: "Summer Training",
        status: "OPEN",
      },
    ]);

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTrainingPeriodsController(req, res);

    expect(createReportModel.getTrainingPeriods).toHaveBeenCalledWith(
      111222333
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      periods: [
        {
          periodID: 1,
          name: "Summer Training",
          status: "OPEN",
        },
      ],
    });
  });

  test("The training periods were not fetched because supervisor ID is missing", async () => {
    const req = {
      user: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTrainingPeriodsController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Academic supervisor ID not found in token",
    });
  });

  test("The training periods were not successfully fetched", async () => {
    createReportModel.getTrainingPeriods.mockRejectedValue(
      new Error("DB failed")
    );

    const req = {
      user: { id: 111222333 },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getTrainingPeriodsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Error fetching training periods",
      error: "DB failed",
    });
  });
});