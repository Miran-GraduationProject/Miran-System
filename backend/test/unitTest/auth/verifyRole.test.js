import { jest } from "@jest/globals";

const { verifyRole } = await import("../../src/middlewares/atuhMiddleware.js");

describe("verifyRole", () => {

  test("role not allowed", () => {
    const req = { user: { role: "Student" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    const middleware = verifyRole("AcademicSupervisor");
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "you don't have permission" });
    expect(next).not.toHaveBeenCalled();
  });

  test("role allowed", () => {
    const req = { user: { role: "AcademicSupervisor" } };
    const res = {};
    const next = jest.fn();

    const middleware = verifyRole("AcademicSupervisor");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});