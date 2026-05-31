import request from "supertest";
import app from "../../../src/app.js";

describe("Integration — Review Case", () => {

  //  الحالة: لا توجد تقارير للطالب
  test("GET /api/reviewCase/:studentId → 404 when no reports found", async () => {
    const res = await request(app).get("/api/reviewCase/999999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No reports found for this student");
  });

  //  الحالة: تقرير واحد موجود
  test("GET /api/reviewCase/report/:reportId → 200 and returns single report", async () => {
    const reportId = 47;
    const res = await request(app).get(`/api/reviewCase/report/${reportId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Case report retrieved successfully");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("reportID");
  });

  //  الحالة: التقرير غير موجود
  test("GET /api/reviewCase/report/:reportId → 404 when report not found", async () => {
    const res = await request(app).get("/api/reviewCase/report/999999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Report not found");
  });

});
