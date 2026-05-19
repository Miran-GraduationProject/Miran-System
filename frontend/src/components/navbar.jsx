import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/nav.css";
import logo from "../assets/logo.png";
import { FaUserCircle } from "react-icons/fa";
import menu from "../assets/menu.png";
import cancel from "../assets/cancel.png";
import { NavLink } from "react-router-dom";
import user from "../assets/user.png";
import { FaChevronDown, FaChevronUp,FaUserCog } from "react-icons/fa";
import background from "../assets/background.jpg";
import userNameIcon from "../assets/userName.png";
import email from "../assets/email.png";
import {MdManageAccounts} from "react-icons/md";
import logout from "../assets/logout.png";
function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    setOpen(false);
    navigate("/login");
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userRole = localStorage.getItem("role") || "";

  const userName = `${localStorage.getItem("firstName") || ""} ${
    localStorage.getItem("secondName") || ""
  } ${localStorage.getItem("lastName") || ""}`;

  const userEmail = localStorage.getItem("email") || "";
  console.log(userRole, userName, userEmail);

  const navLink = {
    AcademicSupervisor: [
      { name: "  الرئيسية للمشرف", path: "/supervisor" },
      { name: " الطلاب", path: "/students" },
      { name: "التقارير", path: "/" },
    ],
    Student: [
      { name: "الرئيسية للطالب", path: "/student" },
      { name: "نتائجي", path: "/results" },
      { name: "ملفي", path: "/profile" },
    ],
    UniversityCoordinator: [
      { name: "الرئيسية للمنسقة", path: "/" },
      { name: "إدارة المستخدمين", path: "/" },
      { name: "الطلبات", path: "/" },
    ],
    Administrator: [
      { name: "الرئيسية للادمن", path: "/" },
      { name: "إدارة المستخدمين", path: "/" },
      { name: "الطلبات", path: "/" },
    ],
  };

  const currentLink = navLink[userRole];
  const [menOpen, setMenOpen] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pillStyle, setPillStyle] = useState({});
  const navRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleMouseEnter = (e, index) => {
    setHoveredIndex(index);
    const itemRect = e.currentTarget.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    setPillStyle({
      width: itemRect.width + 20 + "px",
      left: itemRect.left - navRect.left - 10 + "px",
    });
  };

  {
    hoveredIndex !== null && <span className="nav-pill" style={pillStyle} />;
  }

  return (
    <>
      <nav dir="rtl" className="nav">
        <div className="nav-right">
          <div
            className="nav-links"
            ref={navRef}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex !== null && (
              <span className="nav-pill" style={pillStyle} />
            )}
            {currentLink &&
              currentLink.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "nav-link-item active" : "nav-link"
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, index)}
                >
                  {item.name}
                </NavLink>
              ))}
          </div>
        </div>

        <button className="menu-toggle" onClick={() => setMenOpen(!menOpen)}>
          <img src={menu} alt="Menu" className="menu-icon" />
        </button>

        {menOpen && (
          <div className="mobile-overlay" onClick={() => setMenOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <button
                className="mobile-menu-close"
                onClick={() => setMenOpen(false)}
              >
                <img src={cancel} alt="Cancel" className="close-icon" />
              </button>
              {currentLink &&
                currentLink.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="mobile-menu-item"
                    onClick={() => setMenOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </div>
        )}

        <div className="nav-line"></div>
        <div className="nav-logo">
          <img src={logo} alt="Logo" className="nav-logo-Miran" />
        </div>

        <div className="nav-left">
          <div className="user-badge" onClick={(e) => {e.stopPropagation() ;setProfileOpen(!profileOpen)}}>
            <img src={user} alt="User" className="user-icon-card" />
            <div className="user-text">
              <span className="welcom-word">مرحباً </span>
              <span className="user-name">
                {localStorage.getItem("firstName")}{" "}
                {localStorage.getItem("lastName")}
              </span>
              {profileOpen ? <FaChevronUp className="dropUp-icon" /> : <FaChevronDown className="dropdown-icon" />}
            </div>
          </div>
            {profileOpen && (
                <div className="card-profil">
            
                     <div className="card-header">
                          <img src={background} alt="Background" className="card-image-background" />
                         <div className="card-image-user">

                              <img src={user} alt="User" className="card-user-icon" />

                         </div>
                     </div>

                     <div className="card-info">
                          <div className="info-item">
                               <span className="info-value">{userName}</span>
                               <img src={userNameIcon} alt="User Name" className="card-img-info" />
                          </div>

                           <hr className="card-line" />

                          <div className="info-item">
                               <span className="info-value">{userEmail}</span>
                               <img src={email} alt="User Name" className="card-img-info" />
                          </div>
                           
                           <hr className="card-line" />

                          <div className="info-item">
                               <span className="info-value">{userRole}</span>
                               <FaUserCog className="card-img-info" />
                          </div>
                           
                           <hr className="card-line" />

                          <div className="info-item logout-mobile">
                               <span className="info-value">تسجيل الخروج</span>
                               <img src={logout}  alt="Logout" className="card-img-info" />
                          </div>

                     </div>


                </div>
            )}

            <img src={logout}  alt="Logout" className="logout" onClick={handleLogout} />
        </div>

        <div className="nav-line"></div>
      </nav>
    </>
  );
}

export default Navbar;
