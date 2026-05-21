import request from "supertest";
import app from "../../src/app.js";
import db from "../../src/config/dbConnect.js";

describe("PUT /api/supervisor/cases/:caseID", () => {

    const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3NzkzNTMyNDQsImV4cCI6MTc3OTM1Njg0NH0.TcQI5piOX1MMIFVMzaUgdlFXsMi48j_t-CQYUdq_fIE";
    const studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ0NTAwNDU2LCJyb2xlIjoiU3R1ZGVudCIsImZpcnN0TmFtZSI6IkZhaXNhbCIsInNlY29uZE5hbWUiOiJOYXNzZXIiLCJsYXN0TmFtZSI6IkFsLU90YWliaSIsImVtYWlsIjoiUzQ0NDUwMDQ1NkB1cXUuZWR1LnNhIiwiaWF0IjoxNzc5MzUzMjgzLCJleHAiOjE3NzkzNTY4ODN9.2gQnhbRVoV9zNMI2OkdItcrsf4cRiNXcD4LcyuVSzt8";


    test("TC1: should update case successfully", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                description_text: "Updated description",
                notes: "Notes"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Case updated successfully");
    });



    test("TC2: should return 400 if caseName is missing", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                description_text: "Updated description",
                notes: "Notes"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("case name is required");
    });



    test("TC3: should return 400 if caseName type is invalid", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: 123,
                description_text: "Updated description",
                notes: "Notes"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("invalid data type for case name");
    });



    test("TC4: should return 400 if description_text is missing", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                notes: "Notes"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("description_text is required");
    });



    test("TC5: should return 400 if description_text type is invalid", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                description_text: true,
                notes: "Notes"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("invalid data type for description_text");
    });



    test("TC6: should return 400 if notes type is invalid", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                description_text: "Updated description",
                notes: 123
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("invalid data type for notes");
    });



    test("TC7: should update case without notes", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                description_text: "Updated description"
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Case updated successfully");
    });



    test("TC8: should return 403 if user is not supervisor", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                caseName: "Updated Case",
                description_text: "Updated description"
            });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("you don't have permission");
    });



    test("TC9: should return 403 if token is missing", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/18")
            .send({
                caseName: "Updated Case",
                description_text: "Updated description"
            });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe(" no token provided");
    });



    
    test("TC10: should return 404 if case not found", async () => {
        const res = await request(app)
            .put("/api/supervisor/cases/09876") // تأكد من أن caseID 09876 غير موجود في قاعدة البيانات      
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Updated Case",
                description_text: "Updated description"
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Case not found");
    });

});


afterAll(async () => {
    await db.end();
});
