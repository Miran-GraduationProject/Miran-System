import { useNavigate } from "react-router-dom";

export default function ErrorDownload() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h2>حدثت مشكلة أثناء تحميل الملف</h2>
      <p>يرجى المحاولة لاحقًا أو التأكد من الاتصال بالخادم.</p>
      <button className="back-btn" onClick={() => navigate("/supervisor")}>
        الرجوع إلى الصفحة السابقة
      </button>
    </div>
  );
}
