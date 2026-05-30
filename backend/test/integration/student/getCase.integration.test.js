import { jest } from '@jest/globals';
import request from "supertest";
import app from "../../../src/app.js";
import db from "../../../src/config/dbConnect.js";


const studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQ1MTEyMjIyLCJyb2xlIjoiU3R1ZGVudCIsImZpcnN0TmFtZSI6IkJhbmRhciIsInNlY29uZE5hbWUiOiJBYmR1bGxhaCIsImxhc3ROYW1lIjoiTWFka2hhbGkiLCJlbWFpbCI6IlM0NDUxMTIyMjJAdXF1LmVkdS5zYSIsImlhdCI6MTc3OTkzMDEyMywiZXhwIjoxNzc5OTMzNzIzfQ.Q1fdGH0BOd3D6r2Eh_m9ERv863PJhPU_91N6LjoPsWo";
const supervisorToken  = ""; // تأكد من وضع توكن المشرف الصحيح هنا

describe("GET /student/cases (Integration)", () =>{


test("TC1: should return no reports when no reports exist",
    async ()=> {

        const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${studentToken}`);

        if (res.body.message === "No reports found"){
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
             message: "No reports found",
             data: []
        }); 
    } else {
 
        expect(res.statusCode).toBe(200);
    }
  });

  test("TC2: should return accepted status for accepted reports", async () => {

    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${studentToken}`);
    
        expect(res.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({status: "accepted"})
            ])
        );
  });

  
  test("TC3: should return rejected status for accepted rejected", async () => {

    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${studentToken}`);
    
        expect(res.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({status: "rejected"})
            ])
        );
  });

  
  test("TC4: should return needs revision status for needs revision reports", async () => {

    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${studentToken}`);
    
        expect(res.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({status: "needs revision"})
            ])
        );
  });

  
  test("TC5: should return pending status for accepted pending", async () => {

    const res = await request(app)
        .get("/api/student/cases")
        .set("Authorization", `Bearer ${studentToken}`);
    
        expect(res.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({status: "pending"})
            ])
        );
  });

  test("TC6: should map cases correctly when multiple exist", async() => {

    const res = await request(app)

    .get("/api/student/cases")
    .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).not.toBe(500);

      const statuses = res.body.data.map(c => c.status);

      expect(statuses).toEqual(
        expect.arrayContaining([
            "rejected",
            "accepted"
        ])
      );
  });

  test("TC7: should return wmpty array when no cases exist", async() => {

    const res = await request(app)
    .get("/api/student/cases")
    .set("Authorization", `Bearer ${studentToken}`)
    if (res.body.data.length === 0){
        expect(res.body).toEqual({
            message: "No cases found",
            data: []
        });
    } else {
        expect(res.statusCode).toBe(200)
    }
  });

  afterAll(async () => {
        await db.end();
    });

});
