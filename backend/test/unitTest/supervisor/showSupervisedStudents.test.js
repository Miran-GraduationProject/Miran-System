import request from "supertest";
import app from "../../../src/app.js";

describe("Show supervised students test", () => {
    test("Does it return the students list?", async () => {

        // ياخذ التوكن حق المشرف
        const login = await request(app)
        .post("/api/auth/login")
        .send({
            email: "C111222333@uqu.edu.sa",
            password: "Ahmed123",
            role: "AcademicSupervisor"
        });

        const token = login.body.token;

        const response = await request(app)
        .get("/api/supervisor/students")
        .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("students");
        expect(Array.isArray(response.body.students)).toBe(true);
    });

});