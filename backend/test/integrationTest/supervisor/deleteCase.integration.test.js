import request from "supertest";
import app from "../../../src/app.js";
import db from "../../../src/config/dbConnect.js";


const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3ODAxMTAyOTMsImV4cCI6MTc4MDExMzg5M30.RZ7b2So7_6sWq38j9IK9EGEzrV18V8bvhViFnbTwcCc";

describe("updateCase (Integration)", () => {

    test("TC1: should delete case successfully", async() => {

        const res = await request(app)
        .delete("/api/supervisor/cases/31")
        .set("Authorization", `Bearer ${supervisorToken}`)

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Case deleted successfully");

    });

    test("TC2: should return 400 if case ID invalid", async() => {

        const res = await request(app)
        .delete("/api/supervisor/cases/abc")
        .set("Authorization", `Bearer ${supervisorToken}`)

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid case ID");

    });

    test("TC3: should return 404 if case ID is missing", async() => {

        const res = await request(app)
        .delete("/api/supervisor/cases/")
        .set("Authorization", `Bearer ${supervisorToken}`)

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("case ID is required");

    });

    test("TC4: should return 404 if case not found", async() => {

        const res = await request(app)
        .delete("/api/supervisor/cases/1234567890")
        .set("Authorization", `Bearer ${supervisorToken}`)

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Case not found");

    });  
    

    afterAll(async () => {   
    await db.end();
    });
    

});
