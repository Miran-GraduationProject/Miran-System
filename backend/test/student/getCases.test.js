import request from "supertest";
import app from "../../src/app.js";
import db from "../../src/config/dbConnect.js";

describe("GET /api/student/cases", () => { 

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ0NTAwNDU2LCJyb2xlIjoiU3R1ZGVudCIsImZpcnN0TmFtZSI6IkZhaXNhbCIsInNlY29uZE5hbWUiOiJOYXNzZXIiLCJsYXN0TmFtZSI6IkFsLU90YWliaSIsImVtYWlsIjoiUzQ0NDUwMDQ1NkB1cXUuZWR1LnNhIiwiaWF0IjoxNzc5MDUwNTg2LCJleHAiOjE3NzkwNTQxODZ9.Y6tq2gmCo4SSFsRFNY-GWmCUGeX8CvEd5UunfHZIvqk"; // تأكد من وضع توكن الطالب الصحيح هنا  
    const supervisorToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTExMjIyMzMzLCJyb2xlIjoiQWNhZGVtaWNTdXBlcnZpc29yIiwiZmlyc3ROYW1lIjoiQWhtZWQiLCJzZWNvbmROYW1lIjoiQWxpIiwibGFzdE5hbWUiOiJNYW5zb3VyIiwiZW1haWwiOiJDMTExMjIyMzMzQHVxdS5lZHUuc2EiLCJpYXQiOjE3NzkwNTA0OTUsImV4cCI6MTc3OTA1NDA5NX0._j78iewTALh5G7nXyPsP0XPQANx6_6MbI08lKCKS_L0";
   
    test("TC1: Should return 200 and an list of student cases", async () => { 
        const res = await request(app)
            .get("/api/student/cases")
            .set("Authorization", `Bearer ${token}`); // تأكد من إرسال التوكن في الهيدر         
         
            expect(res.statusCode).toBe(200);

    expect(res.body.data.length).toBeGreaterThan(0); // تأكد من أن هناك حالات في الرد    
    expect(res.body.data[0]).toHaveProperty("caseID");
    expect(res.body.data[0]).toHaveProperty("caseName");
    expect(res.body.data[0]).toHaveProperty("notes");
    expect(res.body.data[0]).toHaveProperty("status");   
      
    });

test("TC2: should return 403 if no token is provided", async () => {
    const res = await request(app)
        .get("/api/student/cases");
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(" no token provided");
});

test ("TC3: should return 401 if token is invalid", async () => {
    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer invalidtoken123`);

         expect(res.statusCode).toBe(401);
         expect(res.body.message).toBe("unauthorized access");
});

test("TC4: should return 403 if wrong role", async () => {
    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${supervisorToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("you don't have permission");
});

test("TC5: should include pending cases for student", async () => {
    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const pendingCases = res.body.data.filter(c => c.status === "pending");
    expect(pendingCases.length).toBeGreaterThan(0); // تأكد من وجود حالات معلقة
});

test("TC6: should include accepted cases for student", async () => {
    const res = await request(app)
        .get("/api/student/cases") 
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const acceptedCases = res.body.data.filter(c => c.status === "accepted");
    expect(acceptedCases.length).toBeGreaterThan(0); // تأكد من وجود حالات مقبولة
});

test("TC7: should include rejected cases for student", async () => {
    const res = await request(app)
        .get("/api/student/cases") 
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const rejectedCases = res.body.data.filter(c => c.status === "rejected");
    expect(rejectedCases.length).toBeGreaterThan(0); // تأكد من وجود حالات مرفوضة
});


test("TC8: should include cases that need revision for student", async () => {
    const res = await request(app)
        .get("/api/student/cases") 
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const needsRevisionCases = res.body.data.filter(c => c.status === "needs revision");
    expect(needsRevisionCases.length).toBeGreaterThan(0); // تأكد من وجود حالات تحتاج إلى مراجعة
});

test("TC9: should return cases with different statuses", async () => {
    const res = await request(app)
        .get("/api/student/cases") 
        .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const statuses = res.body.data.map(c => c.status);
    expect(statuses).toEqual(
        expect.arrayContaining([
            "pending",
            "accepted", 
            "rejected", 
            "needs revision"
        ])
    ); // تأكد من أن الرد يحتوي على حالات بمختلف الحالات
});
    test("TC10: should return 401 if token is empty", async () => {
        const res = await request(app)
            .get("/api/student/cases") 
            .set("Authorization", `Bearer `);

        expect(res.statusCode).toBeGreaterThanOrEqual(401);
        expect(res.body.message).toBe("unauthorized access");
    });

    test("TC11: should return empty array if no cases exist", async () => {
        const res = await request(app)
            .get("/api/student/cases") 
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(0); // تأكد من أن الرد هو مصفوفة فارغة  
        expect(res.body.message).toBe("No cases found");
    });
});
// بعد الانتهاء من جميع الاختبارات، قم بإغلاق اتصال قاعدة البيانات
afterAll(async () => {
  await db.end();
});