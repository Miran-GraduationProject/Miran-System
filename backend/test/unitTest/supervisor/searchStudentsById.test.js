import request from "supertest";
import app from "../../../src/app.js";

describe("search students by ID test", () => {
    let token;
    beforeAll(async () => {
        const login = await request(app)
        .post("/api/auth/login")
        .send({
            email: "C111222333@uqu.edu.sa",
            password: "Ahmed123",
            role: "AcademicSupervisor"
        });

        token = login.body.token;
    });

    test("valid student ID (belonging to the supervisor)", async () => {
        const validID = "445112222";
        const response = await request(app)
            .get(`/api/supervisor/students/search/${validID}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.studentID == validID).toBe(true);
    });

    test("Valid student ID (not belonging to the supervisor)", async () => {
    const notOwnedID = "444500456";
    const response = await request(app)
      .get(`/api/supervisor/students/search/${notOwnedID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message");
  });

    test("Invalid student ID format", async () => {
        const invalidFormat = "abc123";
        const response = await request(app)
            .get(`/api/supervisor/students/search/${invalidFormat}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid student ID format");
  });
});