//  بصفحة المنسق فيه خانة اسمها ادارة قوائم الطلاب هذي هي
// شغلتها ان بعد مايقفل التسجيل هنا يبدا التوزيع الطلاب اولا الي ثم يدوي ثم ياكد 



import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/studentList.css';

const BASE = 'http://localhost:3000/api/coordinator/training-period';

function StudentListPage() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodID, setSelectedPeriodID] = useState(null);
  const [period, setPeriod] = useState(null);
  const [preview, setPreview] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [rowEdits, setRowEdits] = useState({});
  const [savingRow, setSavingRow] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // فلاتر
  const [filterHospital, setFilterHospital] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodID) fetchPeriodDetail(selectedPeriodID);
  }, [selectedPeriodID]);

  const fetchPeriods = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${BASE}/all-periods`, { headers });
      const list = res.data.periods || [];
      setPeriods(list);
      if (list.length > 0) setSelectedPeriodID(list[0].periodID);
    } catch {
      setError('تعذر تحميل الفترات التدريبية');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodDetail = async (periodID) => {
    setDetailLoading(true);
    setError('');
    setPreview([]);
    setRowEdits({});
    try {
      const periodRes = await axios.get(`${BASE}/all-periods`, { headers });
      const found = (periodRes.data.periods || []).find(p => p.periodID === periodID);
      if (found) {
        setPeriod(found);
        setOpportunities(found.hospitals || []);
      }
      const previewRes = await axios.get(`${BASE}/${periodID}/allocation-preview`, { headers });
      setPreview(previewRes.data.preview || []);
    } catch (err) {
      if (err.response?.status !== 404) setError('تعذر تحميل بيانات الفترة');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setSuccessMsg('');
    try {
      await axios.post(`${BASE}/${period.periodID}/generate-allocation`, {}, { headers });
      const res = await axios.get(`${BASE}/${period.periodID}/allocation-preview`, { headers });
      setPreview(res.data.preview || []);
      setRowEdits({});
      setSuccessMsg('تم توليد التوزيع التلقائي بنجاح');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل توليد التوزيع');
    } finally {
      setGenerating(false);
    }
  };

  const handleRowChange = (previewID, field, value) => {
    setRowEdits(prev => {
      const current = prev[previewID] || {};
      const updated = { ...current, [field]: value };
      if (field === 'opportunityID') {
        updated.status = value ? 'Assigned' : 'Unassigned';
      }
      return { ...prev, [previewID]: updated };
    });
  };

  const handleSaveRow = async (row) => {
    const edit = rowEdits[row.previewID];
    if (!edit) return;
    setSavingRow(row.previewID);
    setSuccessMsg('');
    try {
      await axios.put(
        `${BASE}/${period.periodID}/adjust-allocation/${row.previewID}`,
        { opportunityID: edit.opportunityID || null, status: edit.status },
        { headers }
      );
      setPreview(prev =>
        prev.map(r =>
          r.previewID === row.previewID
            ? { ...r, opportunityID: edit.opportunityID || null, status: edit.status,
                hospitalName: opportunities.find(o => o.opportunityID === Number(edit.opportunityID))?.name || null }
            : r
        )
      );
      setRowEdits(prev => {
        const next = { ...prev };
        delete next[row.previewID];
        return next;
      });
      setSuccessMsg('تم حفظ التعديل');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ التعديل');
    } finally {
      setSavingRow(null);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('هل تريد تأكيد التوزيع النهائي؟ لن يمكن التراجع بعد ذلك.')) return;
    setConfirming(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.post(`${BASE}/${period.periodID}/confirm-allocation`, {}, { headers });
      setSuccessMsg(`تم تأكيد التوزيع بنجاح — ${res.data.enrolledCount} طالب مسجّل`);
      setPeriod(prev => ({ ...prev, status: 'ALLOCATED' }));
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تأكيد التوزيع');
    } finally {
      setConfirming(false);
    }
  };

  const assignedCount = preview.filter(r => r.status === 'Assigned').length;
  const unassignedCount = preview.filter(r => r.status === 'Unassigned').length;
  const registrationClosed = period ? new Date() > new Date(period.registrationClose) : false;
  const isAllocated = period?.status === 'ALLOCATED';

  const filteredPreview = preview.filter(row => {
    if (filterHospital && String(row.opportunityID) !== filterHospital) return false;
    if (filterGender && row.gender !== filterGender) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      const name = `${row.firstName} ${row.lastName}`.toLowerCase();
      if (!name.includes(s) && !String(row.studentID).includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="sl-page" dir="rtl">

      {/* Header */}
      <div className="sl-header">
        <div>
          <h1>إدارة قوائم الطلاب</h1>
          <p>توليد التوزيع ومراجعته وتعديله واعتماده بعد إغلاق التسجيل</p>
        </div>
      </div>

      {/* Period Selector */}
      {loading ? (
        <p className="sl-empty">جاري التحميل...</p>
      ) : periods.length === 0 ? (
        <div className="sl-notice">لا توجد فترات تدريبية مفتوحة حالياً</div>
      ) : (
        <>
          <div className="sl-period-selector">
            <label>الفترة التدريبية:</label>
            <select
              value={selectedPeriodID || ''}
              onChange={e => setSelectedPeriodID(Number(e.target.value))}
              className="sl-select"
            >
              {periods.map(p => (
                <option key={p.periodID} value={p.periodID}>
                  {p.name} — {p.level}
                </option>
              ))}
            </select>
          </div>

          {successMsg && <div className="sl-success">{successMsg}</div>}
          {error && <div className="sl-error">{error}</div>}

          {detailLoading ? (
            <p className="sl-empty">جاري تحميل البيانات...</p>
          ) : period && (
            <>
              {/* Summary Cards */}
              <div className="sl-summary-cards">
                <div className="sl-card">
                  <span className="sl-card-num">{preview.length}</span>
                  <span className="sl-card-lbl">إجمالي الطلاب</span>
                </div>
                <div className="sl-card sl-card-green">
                  <span className="sl-card-num">{assignedCount}</span>
                  <span className="sl-card-lbl">تم تعيينهم</span>
                </div>
                <div className="sl-card sl-card-red">
                  <span className="sl-card-num">{unassignedCount}</span>
                  <span className="sl-card-lbl">غير معيّنين</span>
                </div>
                <div className="sl-card sl-card-blue">
                  <span className="sl-card-num">{opportunities.length}</span>
                  <span className="sl-card-lbl">المستشفيات</span>
                </div>
                <div className="sl-card">
                  <span className={`sl-allocation-status ${isAllocated ? 'status-confirmed' : preview.length > 0 ? 'status-draft' : 'status-none'}`}>
                    {isAllocated ? 'مؤكد' : preview.length > 0 ? 'مسودة' : 'لم يُولَّد'}
                  </span>
                  <span className="sl-card-lbl">حالة التوزيع</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isAllocated && (
                <div className="sl-actions-box">
                  {registrationClosed && (
                    <button className="sl-btn sl-btn-generate" onClick={handleGenerate} disabled={generating}>
                      {generating ? 'جاري التوزيع...' : 'توليد التوزيع التلقائي'}
                    </button>
                  )}
                  {preview.length > 0 && (
                    <button className="sl-btn sl-btn-confirm" onClick={handleConfirm} disabled={confirming}>
                      {confirming ? 'جاري التأكيد...' : 'اعتماد التوزيع النهائي'}
                    </button>
                  )}
                  {!registrationClosed && (
                    <p className="sl-actions-note">لا يمكن توليد التوزيع قبل إغلاق التسجيل</p>
                  )}
                </div>
              )}

              {isAllocated && (
                <div className="sl-notice sl-notice-done">
                  تم اعتماد التوزيع النهائي لهذه الفترة
                </div>
              )}

              {/* Filters */}
              {preview.length > 0 && (
                <div className="sl-filters">
                  <input
                    type="text"
                    className="sl-search"
                    placeholder="بحث باسم الطالب أو رقمه..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <select className="sl-select" value={filterHospital} onChange={e => setFilterHospital(e.target.value)}>
                    <option value="">كل المستشفيات</option>
                    {opportunities.map(o => (
                      <option key={o.opportunityID} value={o.opportunityID}>{o.name}</option>
                    ))}
                  </select>
                  <select className="sl-select" value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                    <option value="">كلا الجنسين</option>
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                  <select className="sl-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">كل الحالات</option>
                    <option value="Assigned">معيّن</option>
                    <option value="Unassigned">غير معيّن</option>
                  </select>
                </div>
              )}

              {/* Table */}
              {preview.length === 0 ? (
                <div className="sl-notice">
                  {registrationClosed
                    ? 'اضغط "توليد التوزيع التلقائي" لبدء توزيع الطلاب'
                    : 'باب التسجيل لم يُغلق بعد'}
                </div>
              ) : (
                <div className="sl-table-box">
                  <table className="sl-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>اسم الطالب</th>
                        <th>المعدل</th>
                        <th>الجنس</th>
                        <th>المستشفى المخصص</th>
                        <th>الحالة</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPreview.map((row, i) => {
                        const edit = rowEdits[row.previewID];
                        const currentOppID = edit ? edit.opportunityID : (row.opportunityID ?? '');
                        const currentStatus = edit ? edit.status : row.status;
                        const isDirty = !!edit;

                        return (
                          <tr key={row.previewID} className={isDirty ? 'row-dirty' : ''}>
                            <td>{i + 1}</td>
                            <td>{row.firstName} {row.lastName}</td>
                            <td>{row.universityGPA}</td>
                            <td>
                              <span className={`gender-badge ${row.gender === 'Male' ? 'badge-male' : 'badge-female'}`}>
                                {row.gender === 'Male' ? 'ذكر' : 'أنثى'}
                              </span>
                            </td>
                            <td>
                              {isAllocated ? (
                                row.hospitalName || '—'
                              ) : (
                                <select
                                  className="sl-select"
                                  value={currentOppID}
                                  onChange={e => handleRowChange(row.previewID, 'opportunityID', e.target.value)}
                                >
                                  <option value="">— غير معيّن —</option>
                                  {opportunities.map(o => (
                                    <option key={o.opportunityID} value={o.opportunityID}>{o.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${currentStatus === 'Assigned' ? 'badge-assigned' : 'badge-unassigned'}`}>
                                {currentStatus === 'Assigned' ? 'معيّن' : 'غير معيّن'}
                              </span>
                            </td>
                            <td>
                              {!isAllocated && isDirty && (
                                <button
                                  className="sl-btn-save-row"
                                  onClick={() => handleSaveRow(row)}
                                  disabled={savingRow === row.previewID}
                                >
                                  {savingRow === row.previewID ? '...' : 'حفظ'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default StudentListPage;
