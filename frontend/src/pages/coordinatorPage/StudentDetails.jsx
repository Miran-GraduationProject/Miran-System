// صفحة خاصة بالمشرف، لعرض تفاصيل احد الطلاب

import { Component, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Button.css';
import '../../styles/page.css';
import '../../styles/BackButton.css'
import { styled } from "styled-components";
import { FaArrowRight } from "react-icons/fa";


// تنسيق معلومات الطالب من مكتبة styled-components مباشرة
const Card = styled.div`
  background: #ffffff;
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 650px;
  margin-right: 0;
  margin-left: auto;
  direction: rtl;
  font-family: "Tajawal", sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 25px;

  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1f3728;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e6e6e6;

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: #333;
`;

const Value = styled.span`
  color: #555;
  font-weight: 500;
`;


function StudentDetails() {
    
    const { studentID } = useParams(); // خذ رقم الطالب
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:3000/api/supervisor/students/search/${studentID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error("Error:", data.message);
          setStudent(null);
        } else {
          setStudent(data); // يرجع طالب واحد
        }

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentID]);

  if (loading) return <p>جاري تحميل...</p>;
  if (!student) return <p>لم يتم العثور...</p>;

  return (
  <div className="container"> 
    <main className="main-content">
      
      <button className="backButton" onClick={() => navigate(`/supervisor`)}>
          <FaArrowRight />
          العودة إلى قائمة الطلاب
      </button>

      <header className="page-header">
        <h1>تفاصيل الطالب</h1>
        <p>عرض معلومات الطالب وتقاريره</p>
      </header>

      <Card>

    <Header>
      <h2>معلومات الطالب الشخصية</h2>
    </Header>

    <InfoSection>

      <Row>
        <Label>الاسم</Label>
        <Value>{student.firstName} {student.middleName} {student.lastName}</Value>
      </Row>

      <Row>
        <Label>الرقم الجامعي</Label>
        <Value>{student.studentID}</Value>
      </Row>

      <Row>
        <Label>البريد الجامعي</Label>
        <Value>{student.email}</Value>
      </Row>

      <Row>
        <Label>المستوى</Label>
        <Value>{student.level}</Value>
      </Row>

    </InfoSection>

  </Card>
    </main>
  </div>
  );
}
export default StudentDetails;