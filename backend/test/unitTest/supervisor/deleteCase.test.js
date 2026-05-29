import {expect, jest, test} from "@jest/globals";

const mockQuery = jest.fn();

jest.unstable_mockModule('../../src/config/dbConnect.js', () => ({
    default: {
        promise: () => ({
            query: mockQuery
        })
    }
}));

const { deleteCase } = await import("../../src/controllers/SupervisorControllers/cases.js");
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("deleteCase", () => {
    beforeEach(() => {
        mockQuery.mockReset();
    });

    test("TC1: Should delete the case successfully", async () => {
    
        mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
        const req = {
            params: {caseID: 1}
        };

        const res = mockResponse();

        await deleteCase(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Case deleted successfully"
        });
    });

    test("TC2: should return 400 if caseID invalid", async () => {
          
        const req = {
            params: {caseID: "abc"}
        };

        const res = mockResponse();

        await deleteCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid case ID"
        });
    });

    test("TC3: should return 400 if case ID is missing", async () => {
        const req = {
            params: {}
        };

        const res = mockResponse();

        await deleteCase(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "case ID is required"
        });
    });
   

    test("TC4: Should return 404 if case not found", async () => {
        
        mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }]);

        const req = {
            params: {caseID: 999}
        };

        const res = mockResponse();

        await deleteCase(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Case not found"
        });
    });

     test("TC5: Should return 500 if database error occurs", async () => {
       
         mockQuery.mockImplementationOnce(() => {
            throw new Error("Database error");
        });


        const req = {
            params: {caseID: 1}
        };

        const res = mockResponse();

        await deleteCase(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Internal server error while deleting case"
        });
    });
});
