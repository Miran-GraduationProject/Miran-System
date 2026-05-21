import request from "supertest";
import app from "../../src/app.js";

describe("Logbook PDF test", () => {

  test("Generate logbook PDF successfully", async () => {
    const response = await request(app)
      .get("/api/logbook/download/444500456"); // studentId مثال
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("application/pdf");
  });

  test("Generate logbook PDF for non-existing student", async () => {
    const response = await request(app)
      .get("/api/logbook/download/999999999");
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Student not found");
  });

  test("Supervisor can access logbook PDF", async () => {
    const response = await request(app)
      .get("/api/logbook/download/444500456")
      .set("Authorization", "Bearer SUPERVISOR_TOKEN"); // لو عندك نظام توكن
    expect(response.statusCode).toBe(200);
  });

  test("Student cannot access another student's logbook", async () => {
    const response = await request(app)
      .get("/api/logbook/download/444500457")
      .set("Authorization", "Bearer STUDENT_TOKEN");
    expect(response.statusCode).toBe(403);
  });
});
