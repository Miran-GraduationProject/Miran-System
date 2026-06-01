import request from "supertest";
import app from "../../../src/app.js";

describe("getSupervisedStudents — Integration Test", () => {
  let token;
  let supervisorID;

  beforeAll(async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: "C111222333@uqu.edu.sa",
        password: "Ahmed123",
        role: "AcademicSupervisor"
      });

    token = login.body.token;
    supervisorID = login.body.user?.id;
  });

  test("Returns a valid student list", async () => {
    const response = await request(app)
      .get("/api/supervisor/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const students = response.body.students;


    expect(Array.isArray(students)).toBe(true);
    if (students.length > 0) { // اذا ما كانت فاضية تحقق من الحقول
      const student = students[0];
      expect(student).toHaveProperty("firstName");
      expect(student).toHaveProperty("lastName");
      expect(student).toHaveProperty("gender");
      expect(student).toHaveProperty("email");
      expect(student).toHaveProperty("studentID");
      expect(student).toHaveProperty("periodID");
      expect(student).toHaveProperty("level");
      expect(student).toHaveProperty("reports");
      expect(student).toHaveProperty("periodName");
      expect(typeof student.firstName).toBe("string");
    }
  });

  test("A correct reports count", async () => {
    const response = await request(app)
      .get("/api/supervisor/students")
      .set("Authorization", `Bearer ${token}`);

    const students = response.body.students;

    if (students.length > 0) {
      const student = students[0];
      expect(typeof student.reports).toBe("number");
    }
  });
});

//---------------------------------------------------------------------
// test("An Empty students list for a supervisor with no students", async () => {
//     // تغيير المشرف
//     const login2 = await request(app)
//       .post("/api/auth/login")
//       .send({
//         email: "C445005493@uqu.edu.sa",
//         password: "Sara123",
//         role: "AcademicSupervisor"
//       });

//     const token2 = login2.body.token;

//     const response = await request(app)
//       .get("/api/supervisor/students")
//       .set("Authorization", `Bearer ${token2}`);

//     expect(response.statusCode).toBe(200);

//     expect(response.body.students).toEqual([
//       "No students assigned on your hospital"
//     ]);
//   });
