import request from "supertest";
import app from "../../../src/app.js";
import db from "../../../src/config/dbConnect.js";


const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3ODAxMDI0MTQsImV4cCI6MTc4MDEwNjAxNH0.Bk3WTojU4avyO-HB90jI8Pcf7oVlPjxOICJD3-36V80  ";

describe("updateCase (Integration)", () => {

test("TC1: should update case successfully with all fields", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "Update case",
            description_text: "Test desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Case updated successfully");
});

test("TC2: should return 400 if case name is not a string", async () => {
 
    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: 123,
            description_text: "Test desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe( "case name must be a non-empty string");
});

test("TC3: should return 400 if description_text is not a string", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: true,
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("description text must be a non-empty string");
});

test("TC4: should return 400 if notes is not a string", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: 123,
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("notes must be a string");
});

test("TC5: should return 400 if report title is not a string", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: 123,
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("report title must be a non-empty string");
});

test("TC6: should return 400 if report title not found", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "csee",
            description_text: "desc",
            notes: "note",
            reportTitle: "unknown",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Template not found");
});

test("TC7: should return 400 if start Date is missing", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date is required");
});

test("TC8: should return 400 if end Date is missing", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("end date is required");
});

test("TC9: should return 400 if start Date or end Date is not a valid date string", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-0w-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date and end date must be valid date strings");
});

test("TC10: should return 400 if start Date is after end Date", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2027-02-21",
            endDate: "2026-12-25"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("start date must be before end date");
});

test("TC11: should return 400 if no open period is found", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "1990-01-01",
            endDate: "1990-02-01"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("No OPEN training period found for the given dates");
});

test("TC12: should return 200 if case is updated successfully without notes", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Case updated successfully");
});

test("TC13: should return 400 if no data provided", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/32")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({});

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("No data provided to update");
});

test("TC14: should return 404 if case not found", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/99999")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Case not found");
});

test("TC15: should return 400 if caseID invalid", async () => {

    const res = await request(app)
    .put("/api/supervisor/cases/abc")
    .set("Authorization", `Bearer ${supervisorToken}`)
    .send({
            caseName: "case",
            description_text: "desc",
            notes: "note",
            reportTitle: "Template A",
            startDate: "2026-12-25",
            endDate: "2027-02-21"
    });

     expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid case ID");
});

afterAll(async () => {   
    await db.end();
    });

});
