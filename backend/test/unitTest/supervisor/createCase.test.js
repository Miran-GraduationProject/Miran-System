import request from "supertest";
import app from "../../../src/app.js";
import db from "../../../src/config/dbConnect.js";

describe("POST /api/supervisor/cases", () => {
    const supervisorToken  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3NzkyNTc4NTksImV4cCI6MTc3OTI2MTQ1OX0.XnRImaTKzHWY0WuvoQauUKd_OVF3gbtOzNYxig52l4I"; // تأكد من وضع توكن المشرف الصحيح هنا
    const studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ0NTAwNDU2LCJyb2xlIjoiU3R1ZGVudCIsImZpcnN0TmFtZSI6IkZhaXNhbCIsInNlY29uZE5hbWUiOiJOYXNzZXIiLCJsYXN0TmFtZSI6IkFsLU90YWliaSIsImVtYWlsIjoiUzQ0NDUwMDQ1NkB1cXUuZWR1LnNhIiwiaWF0IjoxNzc5MjU3ODA3LCJleHAiOjE3NzkyNjE0MDd9.w5puUV_gaTzfRzNo_xXhjBo1skaVV1KRP9tcDvG7Z0k";
    
    test("TC1: Should create a new case and return 200", async () => { 
        const res = await request(app) 
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                
                caseName: "test test ",
                description_text: "abcde",
                notes: "Test notes"

            });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Case created successfully");

    expect(res.body.case).toEqual(
        expect.objectContaining({
            caseID: expect.any(Number),
            caseName: expect.any(String),
            description_text: expect.any(String),
            notes: expect.any(String),
            templateID: expect.any(Number),
            periodID: expect.any(Number),
            createdBy: expect.any(Number),
        })
    );

    expect(typeof res.body.case.caseID).toBe("number");
    expect(typeof res.body.case.caseName).toBe("string");
    expect(typeof res.body.case.description_text).toBe("string");
     });

    test("TC2: Should return 400 if case name is missing", async () => {
        const res = await request(app)
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "",
                description_text: "Test description"
            });

        expect(res.statusCode).toBe(400);    
        expect(res.body).toHaveProperty("message", "Case Name is required");
     });
 
 test("TC3: Should return 400 if description_text is missing", async () => {

        const res = await request(app)
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Test Case"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "description_text is required");
     });

     test("TC4: Should return 403 if user is not a supervisor", async () => { 
        const res = await request(app)
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${studentToken}`)
            .send({
                caseName: "Test Case",
                description_text: "Test description"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty("message", "you don't have permission");

     });

        test("TC5: should return 403 if token is missing", async () => {
        const res = await request(app)
            .post("/api/supervisor/cases")
            .send({
                caseName: "Test Case",
                description_text: "Test description"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty("message", " no token provided");
     });

 test("TC6: Should return 400 for invalid data types", async () => {
        const res = await request(app)
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: 123,
                description_text: true,
                notes: ["Invalid", "notes"]
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("message", "invalid data types for case name, description_text, or notes");
     });
 
//  test("TC7: Should return error if template not found", async () => {
//         const res = await request(app)
//             .post("/api/supervisor/cases")
//             .set("Authorization", `Bearer ${supervisorToken}`)
//             .send({
//                 caseName: "Test Case",
//                 description_text: "Test description"
//             });

//         expect(res.statusCode).toBeGreaterThanOrEqual(400);
//         expect(res.body).toHaveProperty("message", "Invalid templateID");
//      });
 
//  test("TC8: Should return error if period not found", async () => {
//         const res = await request(app)
//             .post("/api/supervisor/cases")
//             .set("Authorization", `Bearer ${supervisorToken}`)
//             .send({
//                 caseName: "Test Case",
//                 description_text: "Test description"
//             });

//         expect(res.statusCode).toBeGreaterThanOrEqual(400);
//         expect(res.body).toHaveProperty("message", "Invalid periodID");
//      });

test("TC9: Should create case without notes", async () => {
        const res = await request(app)
            .post("/api/supervisor/cases")
            .set("Authorization", `Bearer ${supervisorToken}`)
            .send({
                caseName: "Test Case",
                description_text: "Test description"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Case created successfully");
     });

});

// بعد الانتهاء من جميع الاختبارات، قم بإغلاق اتصال قاعدة البيانات
afterAll(async () => {
  await db.end();
});
