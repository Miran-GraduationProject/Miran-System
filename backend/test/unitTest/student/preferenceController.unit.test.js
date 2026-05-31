import { jest } from '@jest/globals';
// علشان ما نحتاج نعدل الكود الأصلي، بنستخدم الموكات عشان نتحكم بالردود ونختبر السيناريوهات المختلفة بدون ما نعتمد على قاعدة بيانات حقيقية.
// احنا نعطيه البيانات 
jest.unstable_mockModule('../../../src/models/studentModel/studentPreference.js', () => ({
    getAvailableHospitals: jest.fn(),
    getStudentPreferences: jest.fn(),
    savePreferences: jest.fn(),
    getStudentLevel: jest.fn(),
    getPeriodByLevelOpenOrClosed: jest.fn()
}));

jest.unstable_mockModule('../../../src/models/coordinatorModel/openTrainingPeriod.js', () => ({
    checkOpenPeriodByLevel: jest.fn(),
    syncStatuses: jest.fn()
}));

const { submitPreferences } =
    await import('../../../src/controllers/studentControllers/preferenceController.js');

const { getStudentLevel, getAvailableHospitals, savePreferences } =
    await import('../../../src/models/studentModel/studentPreference.js');

const { checkOpenPeriodByLevel, syncStatuses } =
    await import('../../../src/models/coordinatorModel/openTrainingPeriod.js');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Unit Test — Req 2: preferenceController", () => {

    beforeEach(() => jest.clearAllMocks());


    // ─── validation before DB ────────────────────────────────────────────────────

    describe("submitPreferences — validation (no DB)", () => {

        test("missing preferences field → 400", async () => {
            const req = { user: { id: 1 }, body: {} };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Preferences list is required" });
        });

        test("empty preferences array → 400", async () => {
            const req = { user: { id: 1 }, body: { preferences: [] } };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Preferences list is required" });
        });

        test("missing opportunityID → 400", async () => {
            const req = {
                user: { id: 1 },
                body: { preferences: [{ preferenceRank: 1 }] }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid preference data" });
        });

        test("rank less than 1 → 400", async () => {
            const req = {
                user: { id: 1 },
                body: { preferences: [{ opportunityID: 1, preferenceRank: 0 }] }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid preference data" });
        });

    });


    // ─── validation with mock DB ─────────────────────────────────────────────────

    describe("submitPreferences — validation (with mock)", () => {

        test("no open period for student level → 404", async () => {
            syncStatuses.mockResolvedValue();
            getStudentLevel.mockResolvedValue("4");
            checkOpenPeriodByLevel.mockResolvedValue(null);

            const req = {
                user: { id: 1 },
                body: { preferences: [{ opportunityID: 10, preferenceRank: 1 }] }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "No open training period found for your level" });
        });

        test("registration not open yet → 400", async () => {
            syncStatuses.mockResolvedValue();
            getStudentLevel.mockResolvedValue("4");
            checkOpenPeriodByLevel.mockResolvedValue({
                periodID: 1,
                name: "Test Period",
                registrationOpen: "2099-01-01",
                registrationClose: "2099-06-01"
            });

            const req = {
                user: { id: 1 },
                body: { preferences: [{ opportunityID: 10, preferenceRank: 1 }] }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Registration is not open yet" });
        });

        test("registration already closed → 400", async () => {
            syncStatuses.mockResolvedValue();
            getStudentLevel.mockResolvedValue("4");
            checkOpenPeriodByLevel.mockResolvedValue({
                periodID: 1,
                name: "Test Period",
                registrationOpen: "2020-01-01",
                registrationClose: "2020-06-01"
            });

            const req = {
                user: { id: 1 },
                body: { preferences: [{ opportunityID: 10, preferenceRank: 1 }] }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Registration is closed" });
        });

        test("valid preferences → 201", async () => {
            syncStatuses.mockResolvedValue();
            getStudentLevel.mockResolvedValue("4");
            checkOpenPeriodByLevel.mockResolvedValue({
                periodID: 1,
                name: "Test Period",
                registrationOpen: "2020-01-01",
                registrationClose: "2099-06-01"
            });
            getAvailableHospitals.mockResolvedValue([
                { opportunityID: 10 },
                { opportunityID: 11 }
            ]);
            savePreferences.mockResolvedValue({ totalPreferences: 2 });

            const req = {
                user: { id: 1 },
                body: {
                    preferences: [
                        { opportunityID: 10, preferenceRank: 1 },
                        { opportunityID: 11, preferenceRank: 2 }
                    ]
                }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Preferences saved successfully",
                totalPreferences: 2
            });
        });

        test("duplicate preference ranks → 400", async () => {
            syncStatuses.mockResolvedValue();
            getStudentLevel.mockResolvedValue("4");
            checkOpenPeriodByLevel.mockResolvedValue({
                periodID: 1,
                name: "Test Period",
                registrationOpen: "2020-01-01",
                registrationClose: "2099-06-01"
            });
            getAvailableHospitals.mockResolvedValue([
                { opportunityID: 10 },
                { opportunityID: 11 }
            ]);

            const req = {
                user: { id: 1 },
                body: {
                    preferences: [
                        { opportunityID: 10, preferenceRank: 1 },
                        { opportunityID: 11, preferenceRank: 1 }
                    ]
                }
            };
            const res = mockRes();
            await submitPreferences(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Preference ranks must be unique" });
        });

    });

});
