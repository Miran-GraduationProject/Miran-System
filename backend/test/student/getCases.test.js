import { jest } from '@jest/globals';

const mockQuery = jest.fn();

jest.unstable_mockModule('../../src/config/dbConnect.js', () => ({
    default: {
        promise: () => ({
            query: mockQuery
        })
    }
}));

const {getStudentCases} = await import("../../src/controllers/studentControllers/studentCases.controller.js");
const db = await import('../../src/config/dbConnect.js');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("getStudentCases", () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    test ("TC1: should return cases with pending status when no reports exist", async () => {
        const mockCases = [
            { caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 }
        ];

        const mockReports = [];

mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query

        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "pending"})
            ]
        });
    });

    test("TC2: should return accepted status for accepted reports", async () => {
        const mockCases = [{ caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 }];
        const mockReports = [{ caseID: 1, reportID: 201, decision: "Accept", templateID: 101 }];
        
        mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query

        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "accepted"})
            ]
        });
    });

    test("TC3: should return rejected status for rejected reports", async () => {
        const mockCases = [{ caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 }];
        const mockReports = [{ caseID: 1, reportID: 201, decision: "Reject", templateID: 101 }];

        mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query

        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "rejected"})
            ]
        });
    });

    test("TC4: should return needs revision status for reports that need revision", async () => {
        const mockCases = [{ caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 }];
        const mockReports = [{ caseID: 1, reportID: 201, decision: "Needs Revision", templateID: 101 }];

        mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query
        
        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "needs revision"})
            ]
        });
    });

    test("TC5: should return pending status for reports with pending decision", async () => {
        const mockCases = [{ caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 }];
        const mockReports = [{ caseID: 1, reportID: 201, decision: "Pending", templateID: 101 }];

        mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query

        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "pending"})
            ]
        });
    });

    test("TC6: should map cases to reports correctly when multiple cases and reports exist", async () => {
        const mockCases = [
            { caseID: 1, caseName: "Case 1", notes: "Notes 1", templateID: 101 },
            { caseID: 2, caseName: "Case 2", notes: "Notes 2", templateID: 102 }
        ];
        const mockReports = [
            { caseID: 1, reportID: 201, decision: "Accept", templateID: 101 },
            { caseID: 2, reportID: 202, decision: "Reject", templateID: 102 }
        ];

        mockQuery
            .mockResolvedValueOnce([mockCases]) // Mock cases query
            .mockResolvedValueOnce([mockReports]); // Mock reports query

        const req = { user: { id: 1 } };
        const res = mockResponse();

        await getStudentCases(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Cases retrieved successfully",
            data: [
                expect.objectContaining({status: "accepted"}),
                expect.objectContaining({status: "rejected"})
            ]
        });
    });


test("TC7: should return 200 with empty cases array when no cases exist", async () => {
    mockQuery
        .mockResolvedValueOnce([[]]) // Mock cases query with empty result
        .mockResolvedValueOnce([[]]); // Mock reports query with empty result

    const req = { user: { id: 1 } };
    const res = mockResponse();

    await getStudentCases(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        message: "No cases found",
        data: []
    });
});

test("TC8: should return 500 if there is a database error", async () => {
    mockQuery.mockReset();
    mockQuery.mockRejectedValueOnce(() => {
        throw new Error("Database error");
     });

     console.log(mockQuery.mock.calls);
     
    const req = { user: { id: 1 } };
    const res = mockResponse();

    await getStudentCases(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching cases"
    });
});
});
