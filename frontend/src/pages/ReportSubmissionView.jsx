
//  supervisor هادي الصفحه من اجل عرض التقرير عند الضغط على الزر 
//  الجزء الأول: جلب البيانات


import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/ReportView.css";

function ReportSubmissionView() {
  const { id } = useParams(); // ← رقم التقرير من الرابط

  const [report, setReport] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
       const token = localStorage.getItem("token");

      const res = await fetch(
         ` http://localhost:3000/api/supervisor/submission/${id}/answers`,
            {
              headers: {
                Authorization:`Bearer ${token}` ,
              },
            }
          );

        const data = await res.json();
        console.log("DATA : ",data)
        console.log("ANSWERS: ",data.submission.answers)

        // فحص البيانات
        
        setReport(data.submission || null);
        setFields([]);
        setAnswers(data.submission?.answers || []);

      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);


//   الجزء الثاني: معالجة البيانات

// دمج الحقول مع الإجابات في شكل واحد جاهز للعرض
const mergedDetails = answers.map((answer) => ({
  label: answer.fieldLabel || "حقل",
  answer: answer.answer || "—",
}));


//   الجزء الثالث: عرض الصفحة


  if (loading) {
    return <h2>جاري تحميل التقرير...</h2>;
  }

  if (!report) {
    return <h2>لم يتم العثور على التقرير</h2>;
  }

  return (
    <div className="report-container">

      {/* عنوان الصفحة */}
      <h1>تفاصيل التقرير</h1>

      {/* معلومات التقرير الأساسية */}
      <div className="report-info">
        <p><strong>عنوان التقرير:</strong> {report.reportTitle}</p>
        <p><strong>حالة التقرير:</strong> {report.reportStatus}</p>
        <p><strong>تاريخ النشر:</strong> {report.approvedAt}</p>
        <p><strong>تاريخ التسليم:</strong> {report.submissionDate}</p>
        <p><strong>وقت التسليم:</strong> {report.submissionTime}</p>
        <p><strong>حالة الموافقة:</strong> {report.approvalStatus}</p>
      </div>

      <hr />

      {/* عرض الحقول والإجابات */}
      <h2>تفاصيل الحقول</h2>

      <div className="fields-container">
        {mergedDetails.length === 0 ? (
          <p>لا توجد بيانات لعرضها.</p>
        ) : (
          mergedDetails.map((item, index) => (
            <div key={index} className="field-box">
              <p className="field-label"><strong>{item.label}</strong></p>
              <p className="field-answer">{item.answer}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default ReportSubmissionView;

