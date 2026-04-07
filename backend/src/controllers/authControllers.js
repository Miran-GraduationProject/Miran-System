import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {FindUserByEmail} from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.JWT_Secret)
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await FindUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const isMatchPassord = await password === user.password;

    //password === user.password;
    
    if (!isMatchPassord) {
      return res.status(404).json({ message: "Invalid email or password /Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.userID, role: user.role ,firstName:user.firstName ,secondName:user.secondName , lastName:user.lastName ,email:user.email },
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
