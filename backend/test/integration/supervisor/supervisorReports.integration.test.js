// Integration Test — Supervisor Reports
import request from "supertest";
import app from "../../../src/app.js";

let supervisorToken;

// عدلي بيانات المشرف إذا كانت مختلفة عندك
beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "C111222333@uqu.edu.sa",
      password: "Ahmed123",
    });

  supervisorToken = res.body.token;
});

describe("Integration — Supervisor Reports", () => {
  // ─── 1.  كل تقارير المشرف ─────────────────────────────

  test("GET /api/supervisor/reports — returns supervisor reports → 200", async () => {
    const res = await request(app)
      .get("/api/supervisor/reports")
      .set("Authorization", `Bearer ${supervisorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("reports");
    expect(Array.isArray(res.body.reports)).toBe(true);
  });

  // ─── 2.  تقرير واحد للمشرف ─────────────────────────────

  test("GET /api/supervisor/report/view/:reportID — returns one report → 200 or 404", async () => {
    const reportsRes = await request(app)
      .get("/api/supervisor/reports")
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      reportsRes.statusCode !== 200 ||
      !reportsRes.body.reports ||
      reportsRes.body.reports.length === 0
    ) {
      console.warn("No supervisor reports found — skipping get report test");
      return;
    }

    const reportID = reportsRes.body.reports[0].reportID;

    const res = await request(app)
      .get(`/api/supervisor/report/view/${reportID}`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    expect([200, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("report");
    }
  });

  // ─── 3.  طلاب تقرير معين ─────────────────────────────

  test("GET /api/supervisor/report/:reportID/students — returns students → 200", async () => {
    const reportsRes = await request(app)
      .get("/api/supervisor/reports")
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      reportsRes.statusCode !== 200 ||
      !reportsRes.body.reports ||
      reportsRes.body.reports.length === 0
    ) {
      console.warn("No supervisor reports found — skipping students test");
      return;
    }

    const reportID = reportsRes.body.reports[0].reportID;

    const res = await request(app)
      .get(`/api/supervisor/report/${reportID}/students`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("students");
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  // ─── 4.  إجابات تسليم طالب ─────────────────────────────

  test("GET /api/supervisor/submission/:submissionID/answers — returns answers → 200 or 404", async () => {
    const reportsRes = await request(app)
      .get("/api/supervisor/reports")
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      reportsRes.statusCode !== 200 ||
      !reportsRes.body.reports ||
      reportsRes.body.reports.length === 0
    ) {
      console.warn("No supervisor reports found — skipping answers test");
      return;
    }

    const reportID = reportsRes.body.reports[0].reportID;

    const studentsRes = await request(app)
      .get(`/api/supervisor/report/${reportID}/students`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      studentsRes.statusCode !== 200 ||
      !studentsRes.body.students ||
      studentsRes.body.students.length === 0
    ) {
      console.warn("No students found — skipping answers test");
      return;
    }

    const submittedStudent = studentsRes.body.students.find(
      (student) => student.submissionID
    );

    if (!submittedStudent) {
      console.warn("No submitted student found — skipping answers test");
      return;
    }

    const submissionID = submittedStudent.submissionID;

    const res = await request(app)
      .get(`/api/supervisor/submission/${submissionID}/answers`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    expect([200, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("submission");
      expect(res.body.submission).toHaveProperty("answers");
      expect(Array.isArray(res.body.submission.answers)).toBe(true);
    }
  });

  // ─── 5. الموافقة على تسليم طالب ─────────────────────────────

  test("PUT /api/supervisor/submission/:submissionID/approve — approve submission → 200 or 404", async () => {
    const reportsRes = await request(app)
      .get("/api/supervisor/reports")
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      reportsRes.statusCode !== 200 ||
      !reportsRes.body.reports ||
      reportsRes.body.reports.length === 0
    ) {
      console.warn("No supervisor reports found — skipping approve test");
      return;
    }

    const reportID = reportsRes.body.reports[0].reportID;

    const studentsRes = await request(app)
      .get(`/api/supervisor/report/${reportID}/students`)
      .set("Authorization", `Bearer ${supervisorToken}`);

    if (
      studentsRes.statusCode !== 200 ||
      !studentsRes.body.students ||
      studentsRes.body.students.length === 0
    ) {
      console.warn("No students found — skipping approve test");
      return;
    }

    const submittedStudent = studentsRes.body.students.find(
      (student) => student.submissionID
    );

    if (!submittedStudent) {
      console.warn("No submitted student found — skipping approve test");
      return;
    }

    const submissionID = submittedStudent.submissionID;

    const res = await request(app)
      .put(`/api/supervisor/submission/${submissionID}/approve`)
      .set("Authorization", `Bearer ${supervisorToken}`);
console.log("Approve response:", res.statusCode, res.body);
    expect([200, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty(
        "message",
        "Submission approved successfully"
      );
    }
  });

  // ─── 6.  تقارير المشرف بدون توكن ───────────────────────

  test("GET /api/supervisor/reports — no token → 403", async () => {
    const res = await request(app).get("/api/supervisor/reports");

    expect(res.statusCode).toBe(403);
  });
});