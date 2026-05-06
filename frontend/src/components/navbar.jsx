import React, { useState } from "react";
import {Link,useNavigate} from "react-router-dom"
import "../styles/nav.css";
import logo from "../assets/logo3.png";
import { FaUserCircle } from "react-icons/fa";


function Navbar() {
  const [open, setOpen] = useState(false);  
  const navigate=useNavigate()
  const handleLogout=()=>{
    localStorage.clear()
    setOpen(false)
    navigate("/login")
  }

  const userRole=localStorage.getItem("role") || ""
  const userName=`${localStorage.getItem("firstName") || ""} ${localStorage.getItem("secondName") || ""} ${localStorage.getItem("lastName") || ""}`
  const userEmail=localStorage.getItem("email") || ""
  console.log(userRole,userName,userEmail)
  
  const navLink={
            AcademicSupervisor: [
        { name: "  الرئيسية للمشرف", path: "/supervisor" },
        { name: " الطلاب", path: "/students" },
        { name: "التقارير", path: "/" },
        ],
        Student: [
        { name: "الرئيسية للطالب", path: "/" },
        { name: "نتائجي", path: "/" },
        { name: "ملفي", path: "/" },
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
        
  }

  const currentLink=navLink[userRole] 

  return (
    <nav dir="rtl" className="nav">
      <div
        className="bg-emerald-700 shadow-emerald-200 fixed 
       top-0 left-0 w-full navbar  "
      >
        <Link to="/">
          <img src={logo} />
        </Link>

    <div className="link">
            {currentLink && currentLink.map((item, index) => (
                <Link key={index} to={item.path}>
                    {item.name}
                </Link>
            ))}
       </div>

        <div>
          <FaUserCircle
            size={30}
            color="white"
            className="icon"
            onClick={() => setOpen(!open)}
          />
          {open && (
            <div className="card">
              <div className="nameANDrolr">
                <div className="circle">{userName .trim().charAt(0)}</div>
                <div>
                  <p className="Name">{userName} </p>
                  <p className="Role">{userRole}</p>
                </div>
              </div>
              <hr className="line"></hr>
              <div className="details">
                  <div className="detailsItem">
                        <p className="detailsLabel">البريد الالكتروني</p>
                        <p className="detailsVales">{userEmail}</p>
                    </div>

                    <div className="detailsItem">
                        <p className="detailsLabel"> الدور</p>
                        <p className="detailsVales">{userRole}</p>
                    </div>

                    <div className="detailsItem">
                        <p className="detailsLabel"> الجهة</p>
                        <p className="detailsVales">ام القرى</p>
                    </div>
              </div>
              <hr className="line"></hr>
              <button className="logout" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
