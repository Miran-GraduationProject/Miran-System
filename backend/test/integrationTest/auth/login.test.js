import request from "supertest";
import app from "../../src/app.js";


describe("login test",()=>{

    test("valid email and password", async () => {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "S444500123@uqu.edu.sa",
            password: "Layan123",
            role: "Student"
          });
          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("token");
})

    test("valid email and Invalid password", async () => {
          const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "S444500123@uqu.edu.sa",
            password: "Layan12",
            role: "Student"
          });
          expect(response.statusCode).toBe(404);
          
  
})

    test("Invalid email and password", async () => {
          const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "S444500123@uqu.edu",
            password: "Layan12",
            role: "Student"
          });
          expect(response.statusCode).toBe(404);
          
})

   test("fields empty", async () => {
          const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "",
            password: "",
            role: ""
          });
          expect(response.statusCode).toBe(404);
         
})






})