import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/userModel.js", () => ({
  FindUserByEmail: jest.fn()
}));

const { FindUserByEmail } = await import("../../../src/models/userModel.js");
const authController = await import("../../../src/controllers/authControllers.js");
const login = authController.default; 

describe("login controller unit test", () => {

  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test("valid email and password", async () => {
    req.body = {
      email: "S444500123@uqu.edu.sa",
      password: "Layan123",
      role: "Student"
    };

    FindUserByEmail.mockResolvedValue({
      email: "S444500123@uqu.edu.sa",
      password: "Layan123",
      role: "Student"
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String)
    }));
  });

  test("valid email and invalid password", async () => {
    req.body = {
      email: "S444500123@uqu.edu.sa",
      password: "WrongPass",
      role: "Student"
    };

    FindUserByEmail.mockResolvedValue({
      email: "S444500123@uqu.edu.sa",
      password: "Layan123",
      role: "Student"
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("invalid email", async () => {
    req.body = {
      email: "wrong@uqu.edu.sa",
      password: "pass",
      role: "Student"
    };

    FindUserByEmail.mockResolvedValue(undefined);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("fields empty", async () => {
    req.body = { email: "", password: "", role: "" };

    FindUserByEmail.mockResolvedValue(undefined);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

});