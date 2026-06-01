import request from "supertest";
import app from "../../../src/app.js";



describe("Integration — Logbook Generation", () => {
  test("GET /api/logbook/:studentId → 200 and returns PDF", async () => {
    const studentId = 445112222;
    const res = await request(app).get(`/api/logbook/${studentId}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.body).toBeDefined();
  });

  test("GET /api/logbook/:studentId → 404 when student not found", async () => {
    const res = await request(app).get("/api/logbook/999999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Student not found");
  });
});
