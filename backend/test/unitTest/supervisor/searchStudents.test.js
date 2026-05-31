import request from "supertest";
import app from "../../../src/app.js";

describe("Search students test", () => {
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

    test("Valid student name (belonging to the supervisor)", async () => {
        const response = await request(app)
        .get("/api/supervisor/students/search?name=Abeer")
        .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("results");
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBeGreaterThan(0); // يتأكد ان اللستة مو فاضية
    });

    test("Valid student name (not belonging to the supervisor)", async () => {
        const response = await request(app)
            .get("/api/supervisor/students/search?name=Layan")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("results");
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBe(0); // يتأكد ان اللستة فاضية
    });

    test("One letter search", async () => {
        const response = await request(app)
            .get("/api/supervisor/students/search?name=a")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBeGreaterThan(0);
    });

    test("Search with special characters", async () => {
        const response = await request(app)
            .get("/api/supervisor/students/search?name=@")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results.length).toBe(0); // لستة فاضية
    });
});
