import { expect, jest, test } from "@jest/globals";
const mockQuery = jest.fn();

jest.unstable_mockModule('../../src/config/dbConnect.js', () => ({
    default: {
        promise: () => ({
            query: mockQuery
        })
    }
}));

const { createCase } = await import("../../src/controllers/SupervisorControllers/cases.js");
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("createCase", () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    test("TC1: should create a case successfully", async () => {
        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]])
        mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]])
        mockQuery.mockResolvedValueOnce([{ insertId: 100 }])

        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                notes: "Some notes",
                reportTitle: "Report A",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();
        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Case created successfully",
            caseID: 100
        });
    });

    test("TC2: should return 400 if case name is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {}
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "case name is required" });
    });

    test("TC3: should return 400 if case name is not a string", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: 123,
                description_text: "This is also a test case",
                reportTitle: "Report B",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "case name must be a non-empty string" });
    });

    test("TC4: shuld return 400 if description_text is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                reportTitle: "Report C",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "description text is required" });
    });

    test("TC5: should return 400 if description_text is not a string", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: true,
                reportTitle: "Report D",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "description text must be a non-empty string" });
    });

    test("TC6: should return 400 if notes is not a string", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                notes: 123,
                reportTitle: "Report E",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();
        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "notes must be a string" });
    });

    test("TC7: should return 400 if reportTitle is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "report title is required" });
     });

     test("TC8: should return 400 if reportTitle is not a string", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: 123,
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };  

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "report title must be a non-empty string" });
     });

     test("TC9: should return 400 if reportTitle not found ", async () => {

        mockQuery.mockResolvedValueOnce([[]]);// Mock template query with empty result

        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "unknown",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();
        await createCase(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Template not found" });
     });

     test("TC10: should return 400 if start Date is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report F",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date is required" });
     });

        test("TC11: should return 400 if end Date is missing", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report F",
                startDate: "2024-01-01"
            }
        };

        const res = mockResponse();
        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "end date is required" });
     });

        test("TC12: should return 400 if start Date or end Date is not a valid date string", async () => {

        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report G",
                startDate: "invalid date",
                endDate: "2024-02-01"
            }
        };  

        const res = mockResponse();
        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date and end date must be valid date strings" });
     });

     test("TC13: should return 400 if start Date is after end Date", async () => {
        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report H",
                startDate: "2024-03-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date must be before end date" });
     });    

     test("TC14: should return 400 if no open period is found", async () => {

        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]])// Mock template query with valid result
        mockQuery.mockResolvedValueOnce([[]]);

        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report I",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();

        await createCase(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "No OPEN training period found for the given dates" });
     });

     test("TC15: should return 500 if there is a database error", async () => { 
        mockQuery.mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const req = {
            user: { id: 1 },
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report J",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();
        await createCase(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error while creating case" });
         });

         test("TC16: should return 201 if case is created successfully without notes", async () => {
            mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]])
            mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]])
            mockQuery.mockResolvedValueOnce([{ insertId: 101 }])

            const req = {
                user: { id: 1 },
                body: {
                    caseName: "Test Case",
                    description_text: "This is a test case",
                    reportTitle: "Report K",
                    startDate: "2024-01-01",
                    endDate: "2024-02-01",
                    
                }
            };
            const res = mockResponse();
            await createCase(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Case created successfully",
                caseID: 101
            });
         });

});