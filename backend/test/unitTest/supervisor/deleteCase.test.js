import request from "supertest";
import app from "../../src/app.js";
import db from "../../src/config/dbConnect.js";

const studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ0NTAwNDU2LCJyb2xlIjoiU3R1ZGVudCIsImZpcnN0TmFtZSI6IkZhaXNhbCIsInNlY29uZE5hbWUiOiJOYXNzZXIiLCJsYXN0TmFtZSI6IkFsLU90YWliaSIsImVtYWlsIjoiUzQ0NDUwMDQ1NkB1cXUuZWR1LnNhIiwiaWF0IjoxNzc5Mzc0ODY1LCJleHAiOjE3NzkzNzg0NjV9.y-f0mRBsREg0HVV64ELz3oJ-hdl1HGK1h---LjyUK2Q"; // تأكد من وضع توكن الطالب الصحيح هنا
const supervisorToken  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3NzkzNzQ5NTQsImV4cCI6MTc3OTM3ODU1NH0.0KIYt4nVVfhYzQipGGrhxpmE0X8mALQmWDz3AvyJfDo"; // تأكد من وضع توكن المشرف الصحيح هنا

describe("DELETE /api/supervisor/cases/:caseID", () => {

    test("TC1: Should delete the case and return 200", async () => {
        const res = await request(app)
            .delete("/api/supervisor/cases/15") // تأكد من وجود caseID 1 في قاعدة البيانات
            .set("Authorization", `Bearer ${supervisorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Case deleted successfully");
    });

    test("TC2: should return 404 if casenot found", async () => {
        const res = await request(app)
            .delete("/api/supervisor/cases/9999") // تأكد من أن caseID 9999 غير موجود في قاعدة البيانات     
            .set("Authorization", `Bearer ${supervisorToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Case not found");
    });

    test("TC3: should return 403 if no token is provided", async () => {
        const res = await request(app)
            .delete("/api/supervisor/cases/15"); // تأكد من وجود caseID 15 في قاعدة البيانات    
        expect(res.status).toBe(403);
        expect(res.body.message).toBe(" no token provided");
     });
   

    test("TC4: Should return 403 if user is not a supervisor", async () => {
        const res = await request(app)
            .delete("/api/supervisor/cases/15")
            .set("Authorization", `Bearer ${studentToken}`);
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("you don't have permission");
    });
});
    
afterAll(async () => {
  await db.end();
});
