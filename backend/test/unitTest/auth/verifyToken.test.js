import { jest } from "@jest/globals";

process.env.JWT_SECRET = "testsecret";

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
    decode: jest.fn()
  },
  decode: jest.fn()
}));

const jwtModule = await import("jsonwebtoken");
const jwt = jwtModule.default;
const { verifyToken } = await import("../../../src/middlewares/atuhMiddleware.js");

describe("verifyToken", () => {

  test("no token", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: " no token provided" });
  });

  test("invalid token", () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error("invalid"), null);
    });

    const req = { headers: { authorization: "Bearer wrongtoken" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "unauthorized access" });
    expect(next).not.toHaveBeenCalled();
  });

  test("valid token", () => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { id: 1, role: "Student" });
    });

    const req = { headers: { authorization: "Bearer validtoken" } };
    const res = {};
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(req.user).toEqual({ id: 1, role: "Student" });
    expect(next).toHaveBeenCalled();
  });

});