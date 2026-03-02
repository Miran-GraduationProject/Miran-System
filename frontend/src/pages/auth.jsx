import "../styles/auth.css";
import { FaRegUser } from "react-icons/fa";
import { CiLock } from "react-icons/ci";
import logo from "../assets/logo3.png";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Log() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password },
        { withCredentials: true },
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);
      const user = decodedToken;

      if (user.role === "Administrator") {
        navigate("/admin");
      } else if (user.role === "Student") {
        navigate("/student");
      } else if (user.role === "AcademicSupervisor") {
        navigate("/academicSupervisor");
      } else if (user.role === "UniversityCoordinator") {
        navigate("/coordintator");
      } else if (user.role === "HospitalSupervisor") {
        navigate("/hospitalSupervisor");
      } else if (user.role === "HospitalSecretary") {
        navigate("/hospitalSecretary");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="loginContainer">
    <div className="loginForm">
      <form>
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        <div className="box">
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaRegUser className="user-icon" />
        </div>
        <div className="box">
          <input
            type="password"
            placeholder="كلمة المرور"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <CiLock className="lock-icon" />
        </div>
        <div className="remember-forgot">
          <label>
            <input type="checkbox" /> تذكرني
          </label>
          <a href="#">نسيت كلمة المرور؟</a>
        </div>
        <button type="submit" onClick={handleLogin}>
          تسجيل الدخول
        </button>
      </form>
    </div>
    </div>
  );
}

export default Log;
