import { useNavigate } from "react-router-dom";
import { FaTasks, FaPlus, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import "../../styles/reports.css";
import "../../styles/student.css";
import "../../styles/cases.css";

export default function SupervisorCasesManagement() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "إضافة حالة",
      description: "إضافة حالة إلزامية جديدة لجميع الطلاب",
      path: "/supervisor/cases/add",
      icon: <FaPlus />,
    },
    {
      title: "تعديل حالة",
      description: "تعديل بيانات حالة موجودة",
      path: "/supervisor/cases/edit",
      icon: <FaEdit />,
    },
    {
      title: "حذف حالة",
      description: "حذف حالة إلزامية من القائمة",
      path: "/supervisor/cases/delete",
      icon: <FiTrash2 />,
    },
  ];

  return (
    <div className="reports-page">
      <div className="top-reports-section">
        <div className="reports-header">
          <div className="reports-title">
            <div className="page-icon"><FaTasks /></div>
            <div>
              <h1>إدارة الحالات الإلزامية</h1>
              <p>اختر الإجراء المطلوب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="student-cards-grid" style={{ padding: "24px" }}>
        {cards.map((card) => (
          <button
            key={card.path}
            className="student-main-card"
            onClick={() => navigate(card.path)}
          >
            <span className="student-card-arrow">›</span>
            <div className="student-card-content">
              <div className="student-card-icon-wrap">
                <span className="student-card-icon">{card.icon}</span>
              </div>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
