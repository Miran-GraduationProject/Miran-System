
import { expect, jest, test } from "@jest/globals";
const mockQuery = jest.fn();

jest.unstable_mockModule('../../src/config/dbConnect.js', () => ({
    default: {
        promise: () => ({
            query: mockQuery
        })
    }
}));

const { updateCase } = await import("../../src/controllers/SupervisorControllers/cases.js");
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("updateCase", () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    test("TC1:should update case successfully with all fields", async () => {
        mockQuery
        .mockResolvedValueOnce([[{templateID: 1}]])
        .mockResolvedValueOnce([[{periodID: 5}]])
        .mockResolvedValueOnce([{affectedRows: 1}]);

        const req = {
            params: {caseID: 1},
            body: {
                caseName: "Updated",
                description_text: "desc",
                notes: "notes",
                reportTitle: "Report A",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();
        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Case updated successfully"
        });
    });

     test("TC2: should return 400 if case name is not a string", async () => {
        const req = {
            params:{caseID: 1},
            body: {
                caseName: 123,
                description_text: "This is also a test case",
                reportTitle: "Report B",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "case name must be a non-empty string" });
    });


    test("TC3: should return 400 if description_text is not a string", async () => {
        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: true,
                reportTitle: "Report D",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "description text must be a non-empty string" });
    });

    test("TC4: should return 400 if notes is not a string", async () => {
         mockQuery.mockResolvedValueOnce([[]]);// Mock template query with empty result

        const req = {
            params:{caseID: 1},
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
        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "notes must be a string" });
    });

     test("TC5: should return 400 if report title is not a string", async () => {
        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: 123,
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };  

        const res = mockResponse();

        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "report title must be a non-empty string" });
     });

     test("TC6: should return 400 if report title not found", async () => {

        mockQuery.mockResolvedValueOnce([[]]);// Mock template query with empty result

        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "unknown",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();
        await updateCase(req,res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Template not found" });
     });

     test("TC7: should return 400 if start Date is missing", async () => {
        
        
        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]]);
mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]]);

const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report F",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date is required" });
     });

       test("TC8: should return 400 if end Date is missing", async () => {
       
        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]]);
mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]]);


        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report F",
                startDate: "2024-01-01"
            }
        };

        const res = mockResponse();
        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "end date is required" });
     });

        test("TC9: should return 400 if start Date or end Date is not a valid date string", async () => {

            mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]]);
mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]]);

        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report G",
                startDate: "invalid date",
                endDate: "2024-02-01"
            }
        };  

        const res = mockResponse();
        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date and end date must be valid date strings" });
     });

     test("TC10: should return 400 if start Date is after end Date", async () => {
        
        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]]);
mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]]);

        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report H",
                startDate: "2024-03-01",
                endDate: "2024-02-01"
            }
        };

        const res = mockResponse();

        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "start date must be before end date" });
     });    

     test("TC11: should return 400 if no open period is found", async () => {

        mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]])// Mock template query with valid result
        mockQuery.mockResolvedValueOnce([[]]);

        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report I",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();

        await updateCase(req,res);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "No OPEN training period found for the given dates" });
     });


     test("TC12: should return 500 if there is a database error", async () => { 
        mockQuery.mockImplementationOnce(() => {
            throw new Error("Database error");
        });

        const req = {
            params:{caseID: 1},
            body: {
                caseName: "Test Case",
                description_text: "This is a test case",
                reportTitle: "Report J",
                startDate: "2024-01-01",
                endDate: "2024-02-01"
            }
        };
        const res = mockResponse();
        await updateCase(req,res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error while updating case" });
         });

         test("TC13: should return 200 if case is updated successfully without notes", async () => {
            mockQuery.mockResolvedValueOnce([[{ templateID: 1 }]])
            mockQuery.mockResolvedValueOnce([[{ periodID: 5 }]])
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

            const req = {
            params:{caseID: 101},
                body: {
                    caseName: "Test Case",
                    description_text: "This is a test case",
                    reportTitle: "Report K",
                    startDate: "2024-01-01",
                    endDate: "2024-02-01",
                    
                }
            };
            const res = mockResponse();
        await updateCase(req,res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Case updated successfully"
            });
         });


         test("TC14: should return 400 if no data provided", async () => {
            const req = {
                params: { caseID: 1 },
                body: {}
            };

            const res = mockResponse();

            await updateCase(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "No data provided to update"
            });
        });

        test("TC15: should return 404 if case not found", async () => {
  
            mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const req = {
                params: { caseID: 999 },
                body: { caseName: "test" }  
            };

            const res = mockResponse();  
            await updateCase(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Case not found"
            });
        });


        test("TC16: should return 400 if caseID invalid", async () => {

            const req = {
                params: { caseID: "abc" },
                body: { caseName: "test" }
            };

            const res = mockResponse();

            await updateCase(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Invalid case ID"
            });
        });

        
    });

