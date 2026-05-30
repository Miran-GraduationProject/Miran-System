// Integration Test — Student Reports
import request from "supertest";
import app from "../../../src/app.js";

let studentToken;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "S444500123@uqu.edu.sa",
      password: "Layan123",
    });

  studentToken = res.body.token;
});

describe("Integration — Student Reports", () => {
  // ─── 1.  قائمة تقارير الطالب ─────────────────────────────

  test("GET /api/student/reports — returns student reports → 200", async () => {
    const res = await request(app)
      .get("/api/student/reports")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reports");
    expect(Array.isArray(res.body.reports)).toBe(true);
  });

  // ─── 2.  تقرير واحد للطالب ─────────────────────────────

  test("GET /api/student/report/:reportID — returns report details → 200 or 404", async () => {
    const reportsRes = await request(app)
      .get("/api/student/reports")
      .set("Authorization", `Bearer ${studentToken}`);

    if (
      reportsRes.statusCode !== 200 ||
      !reportsRes.body.reports ||
      reportsRes.body.reports.length === 0
    ) {
      console.warn("No reports found for this student — skipping get report test");
      return;
    }

    const reportID = reportsRes.body.reports[0].reportID;

    const res = await request(app)
      .get(`/api/student/report/${reportID}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect([200, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("report");
      expect(res.body).toHaveProperty("fields");
      expect(res.body).toHaveProperty("answers");

      expect(Array.isArray(res.body.fields)).toBe(true);
      expect(Array.isArray(res.body.answers)).toBe(true);
    }
  });

  // ─── 3. تسليم تقرير بإجابات فاضية ─────────────────────────────

  test("POST /api/student/report/submit — empty answers → 400", async () => {
    const res = await request(app)
      .post("/api/student/report/submit")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        reportID: 1,
        answers: [],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "answers are required");
  });

  // ─── 4. تسليم تقرير بدون reportID ─────────────────────────────

  test("POST /api/student/report/submit — missing reportID → 400", async () => {
    const res = await request(app)
      .post("/api/student/report/submit")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
        ],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "reportID and answers are required"
    );
  });

  // ─── 5. التقارير بدون توكن ─────────────────────────────

  test("GET /api/student/reports — no token → 403", async () => {
    const res = await request(app).get("/api/student/reports");

    expect(res.statusCode).toBe(403);
  });

  // ─── 6. تسليم التقرير بدون توكن ─────────────────────────────

  test("POST /api/student/report/submit — no token → 403", async () => {
    const res = await request(app)
      .post("/api/student/report/submit")
      .send({
        reportID: 1,
        answers: [
          {
            fieldID: 1,
            answer: "Completed tasks",
          },
        ],
      });

    expect(res.statusCode).toBe(403);
  });
});