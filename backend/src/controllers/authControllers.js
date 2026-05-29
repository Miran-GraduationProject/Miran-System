import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { FindUserByEmail } from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * user login function
 *
 * This function takes the email, password, and role from the request body, 
 * checks if the user exists, and if the password is correct
 *  If everything is valid, it generates a JWT token and sends it back to the client
 * 
 * @constant {Function} login - Login controller function
 * @requires jsonwebtoken
 * @requires FindUserByEmail
 * @env process.env.JWT_Secret
 * 
 * @param {Object} req - Express reques
 * @param {Object} res - Express response
 * @returns  {Object} Returns JWT token or error message
 */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await FindUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatchPassord = (await password) === user.password;

    //password === user.password;

    if (!isMatchPassord) {
      return res
        .status(404)
        .json({ message: "Invalid email or password /Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user.userID,
        role: user.role,
        firstName: user.firstName,
        secondName: user.secondName,
        lastName: user.lastName,
        email: user.email,
      },
      process.env.JWT_Secret,
      { expiresIn: "1h" },
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export default login;
