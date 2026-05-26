import { jest } from "@jest/globals";

const mockExecute = jest.fn();

jest.unstable_mockModule("../../../src/config/dbConnect.js", () => ({
  default: {
    promise: () => ({
      execute: mockExecute
    }),
    getConnection: jest.fn()
  }
}));

const dbConnect = (await import("../../src/config/dbConnect.js")).default;
const { FindUserByEmail } = await import("../../src/models/userModel.js");

describe("FindUserByEmail", () => {

  test("user found", async () => {
    mockExecute.mockResolvedValue([[{ id: 1, email: "S444500123@uqu.edu.sa" }]]);

    const result = await FindUserByEmail("S444500123@uqu.edu.sa");

    expect(result).toEqual({ id: 1, email: "S444500123@uqu.edu.sa" });
  });

  test("user not found", async () => {
    mockExecute.mockResolvedValue([[]]);

    const result = await FindUserByEmail("S4445001@uqu.edu.sa");

    expect(result).toBeUndefined();
  });

});