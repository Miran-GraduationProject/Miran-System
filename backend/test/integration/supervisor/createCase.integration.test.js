import request from "supertest";
import app from "../../../src/app.js";
import db from "../../../src/config/dbConnect.js";

const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3Nzk5NDkxNDEsImV4cCI6MTc3OTk1Mjc0MX0.eV9VVW9l5Lt-P7_-O_azzzLzjwsp-8bzu1N2zCCPa-A";

describe("createCase (Integration)", () => {

    test("TC1: should create a case successfully", async () => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({
            caseName: "Integration case",
            description_text: "Test desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            message: "Case created successfully",
            caseID: expect.any(Number)
        });
    });

    test("TC2: should return 400 if case name is missing", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({message: "case name is required"});
    });

    test("TC3: should return 400 if case name is not string", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName:123,
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("case name must be a non-empty string");
    });

    test("TC4: should return 400 if description is missing", async () => {

         const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("description text is required");
    });

    test("TC5: should return 400 if description is not string", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: true,
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("description text must be a non-empty string");
    });

    test("TC6: should return 400 if notes not string", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: 123,
           description_text: "desc",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("notes must be a string");
    });

    test("TC7: should return 400 if report title is missing", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("report title is required");
    });

    
    test("TC8: should return 400 if report title is not string", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: 123,
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("report title must be a non-empty string");
    });

    
    test("TC9: should return 400 if report title is not found", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "unknown",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Template not found");
    });

    
    test("TC10: should return 400 if start date is missing", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "Template A",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date is required");
    });

    
    test("TC11: should return 400 if end date is missing", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: "2026-12-25",
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("end date is required");
    });

    
    test("TC12: should return 400 if start date or end date is not a valid date string", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: 123,
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date and end date must be valid date strings");
    });

    
    test("TC13: should return 400 if start date is after end date", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: "2028-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date must be before end date");
    });

        test("TC14: should return 400 if no open period found", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            notes: "note",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: "1990-01-01",
            endDate: "1990-02-01"
        });
        
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("No OPEN training period found for the given dates");
    });

        test("TC15: should return 201 if case is created successfully without notes", async() => {

        const res = await request(app)
        .post("/api/supervisor/cases")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ 
            caseName: "case",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
        });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Case created successfully");
    });


    afterAll(async () => {
        await db.end();
    });

});

