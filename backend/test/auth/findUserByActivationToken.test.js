import { jest } from "@jest/globals";

const mockExecute = jest.fn();

jest.unstable_mockModule("../../src/config/dbConnect.js", () => ({
  default: {
    promise: () => ({
      execute: mockExecute
    }),
    getConnection: jest.fn()
  }
}));

const { findUserByActivationToken } = await import("../../src/models/userModel.js");

describe("findUserByActivationToken", () => {

  test("valid token (user found)", async () => {
    mockExecute.mockResolvedValue([[{ id: 10, activationToken: "ABC123" }]]);

    const result = await findUserByActivationToken("ABC123");

    expect(result).toEqual({ id: 10, activationToken: "ABC123" });
  });

  test("invalid token (user not found)", async () => {
    mockExecute.mockResolvedValue([[]]);

    const result = await findUserByActivationToken("INVALID");

    expect(result).toBeUndefined();
  });

});