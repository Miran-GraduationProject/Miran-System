import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/models/coordinatorModel/openTrainingPeriod.js', () => ({
    openTrainingPeriod: jest.fn(),
    checkOpenPeriodByLevel: jest.fn(),
    getAllPeriods: jest.fn(),
    getPeriodByID: jest.fn(),
    updateTrainingPeriod: jest.fn(),
    addHospitalToPeriod: jest.fn(),
    removeHospitalFromPeriod: jest.fn(),
    getRegistrationStats: jest.fn(),
    deleteTrainingPeriod: jest.fn(),
    syncStatuses: jest.fn()
}));

const { openPeriod, editPeriod, addHospital, removeHospital } =
    await import('../../src/controllers/coordinatorControllers/openPeriodController.js');

const { getPeriodByID, removeHospitalFromPeriod } =
    await import('../../src/models/coordinatorModel/openTrainingPeriod.js');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Unit Test — Req 1: openPeriodController", () => {

    beforeEach(() => jest.clearAllMocks());


    // ─── openPeriod ─────────────────────────────────────────────────────────────

    describe("openPeriod — validation (no DB)", () => {

        test("missing required fields → 400", async () => {
            const req = { body: {} };
            const res = mockRes();
            await openPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "All fields are required" });
        });

        test("endDate before startDate → 400", async () => {
            const req = {
                body: {
                    name: "Test", level: "4",
                    startDate: "2027-09-01", endDate: "2027-08-01",
                    registrationOpen: "2027-07-01", registrationClose: "2027-07-30",
                    activatedBy: 1,
                    hospitals: [{ hospitalID: 1, maleCapacity: 5, femaleCapacity: 5 }]
                }
            };
            const res = mockRes();
            await openPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "End date must be after start date" });
        });

        test("registrationClose before registrationOpen → 400", async () => {
            const req = {
                body: {
                    name: "Test", level: "4",
                    startDate: "2027-09-01", endDate: "2027-12-01",
                    registrationOpen: "2027-07-30", registrationClose: "2027-07-01",
                    activatedBy: 1,
                    hospitals: [{ hospitalID: 1, maleCapacity: 5, femaleCapacity: 5 }]
                }
            };
            const res = mockRes();
            await openPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Registration close date must be after open date" });
        });

        test("negative hospital capacity → 400", async () => {
            const req = {
                body: {
                    name: "Test", level: "4",
                    startDate: "2027-09-01", endDate: "2027-12-01",
                    registrationOpen: "2027-07-01", registrationClose: "2027-07-30",
                    activatedBy: 1,
                    hospitals: [{ hospitalID: 1, maleCapacity: -1, femaleCapacity: 5 }]
                }
            };
            const res = mockRes();
            await openPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid hospital data, please check and try again" });
        });

        test("duplicate hospitals → 400", async () => {
            const req = {
                body: {
                    name: "Test", level: "4",
                    startDate: "2027-09-01", endDate: "2027-12-01",
                    registrationOpen: "2027-07-01", registrationClose: "2027-07-30",
                    activatedBy: 1,
                    hospitals: [
                        { hospitalID: 1, maleCapacity: 5, femaleCapacity: 5 },
                        { hospitalID: 1, maleCapacity: 3, femaleCapacity: 3 }
                    ]
                }
            };
            const res = mockRes();
            await openPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Duplicate hospitals are not allowed" });
        });

    });


    // ─── editPeriod ─────────────────────────────────────────────────────────────

    describe("editPeriod — validation (with mock)", () => {

        test("period not found → 404", async () => {
            getPeriodByID.mockResolvedValue(null);
            const req = { params: { periodID: 999 }, body: {} };
            const res = mockRes();
            await editPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Training period not found" });
        });

        test("registration already opened → 400", async () => {
            getPeriodByID.mockResolvedValue({ registrationOpen: "2020-01-01" });
            const req = {
                params: { periodID: 1 },
                body: {
                    name: "Test", level: "4",
                    startDate: "2027-09-01", endDate: "2027-12-01",
                    registrationOpen: "2027-07-01", registrationClose: "2027-07-30"
                }
            };
            const res = mockRes();
            await editPeriod(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Cannot modify period after registration has opened" });
        });

    });


    // ─── removeHospital ─────────────────────────────────────────────────────────

    describe("removeHospital — with mock", () => {

        test("hospital not found in period → 404", async () => {
            getPeriodByID.mockResolvedValue({ registrationOpen: "2099-01-01" });
            removeHospitalFromPeriod.mockResolvedValue(false);
            const req = { params: { periodID: 1, hospitalID: 99 } };
            const res = mockRes();
            await removeHospital(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Hospital not found in this period" });
        });

    });

});
