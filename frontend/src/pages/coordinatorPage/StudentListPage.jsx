// إدارة قوائم الطلاب — TailAdmin RTL style
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MdPeople, MdAutoFixHigh, MdCheckCircle, MdSearch, MdEdit, MdClose } from 'react-icons/md';
import PageHeader  from '../../components/common/PageHeader';
import StatCard    from '../../components/common/StatCard';
import AlertBox    from '../../components/common/AlertBox';
import FilterTabs  from '../../components/common/FilterTabs';

const API_BASE = 'http://localhost:3000/api/coordinator/training-period';
const P      = '#2d8a56';
const P_LT   = '#ecfdf5';
const P_MD   = '#d1fae5';

const selectStyle = {
  padding: '9px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
  fontSize: '14px', fontFamily: 'inherit', background: '#fff', color: '#111827', direction: 'rtl',
};

function StudentListPage() {
  const [periods, setPeriods]               = useState([]);
  const [pid, setPid]                       = useState('');
  const [preview, setPreview]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [prevLoad, setPrevLoad]             = useState(false);
  const [generating, setGenerating]         = useState(false);
  const [confirming, setConfirming]         = useState(false);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('ALL');
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [allocationStatus, setAllocationStatus] = useState('NONE');
  const [hospitals, setHospitals]           = useState([]);
  const [editRow, setEditRow]               = useState(null);
  const [editOpp, setEditOpp]               = useState('');
  const [editStatus, setEditStatus]         = useState('Assigned');
  const [editReason, setEditReason]         = useState('');
  const [saving, setSaving]                 = useState(false);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPeriods(); }, []);
  useEffect(() => { if (pid) fetchPreview(pid); }, [pid]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/all-periods`, { headers });
      const ps = res.data.periods || [];
      setPeriods(ps);
      const closed = ps.find(p => p.status === 'CLOSED') || ps.find(p => p.status === 'OPEN') || ps[0];
      if (closed) setPid(String(closed.periodID));
    } catch { setError('تعذر تحميل الفترات'); }
    finally { setLoading(false); }
  };

  const fetchPreview = async (id) => {
    setPrevLoad(true);
    try {
      const [prevRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/${id}/allocation-preview`, { headers }),
        axios.get(`http://localhost:3000/api/coordinator/training-period/registration-stats?periodID=${id}`, { headers }),
      ]);
      const rows = prevRes.data.preview || [];
      setPreview(rows);
      setHospitals(statsRes.data.hospitals || []);
      const periodStatus = statsRes.data.period?.status;
      const hasDraft     = rows.some(r => r.previewID);
      if (periodStatus === 'ALLOCATED') setAllocationStatus('CONFIRMED');
      else if (hasDraft && rows.length > 0) setAllocationStatus('DRAFT');
      else setAllocationStatus('NONE');
    } catch { setPreview([]); setAllocationStatus('NONE'); }
    finally { setPrevLoad(false); }
  };

  const generate = async () => {
    if (!pid) return;
    setGenerating(true); setError('');
    try {
      await axios.post(`${API_BASE}/${pid}/generate-allocation`, {}, { headers });
      setSuccess('تم توليد التوزيع بنجاح');
      fetchPreview(pid);
    } catch (err) { setError(err.response?.data?.message || 'تعذر توليد التوزيع'); }
    finally { setGenerating(false); }
  };

  const confirm = async () => {
    if (!pid || !window.confirm('هل تريد اعتماد التوزيع نهائياً؟ لن تتمكن من التعديل بعدها.')) return;
    setConfirming(true); setError('');
    try {
      await axios.post(`${API_BASE}/${pid}/confirm-allocation`, {}, { headers });
      setSuccess('تم اعتماد التوزيع النهائي بنجاح');
      fetchPreview(pid);
    } catch (err) { setError(err.response?.data?.message || 'تعذر اعتماد التوزيع'); }
    finally { setConfirming(false); }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditStatus(row.status || 'Assigned');
    setEditOpp(row.opportunityID ? String(row.opportunityID) : '');
    setEditReason('');
    setSaving(false);
  };

  const closeEdit = () => { setEditRow(null); setSaving(false); };

  const saveEdit = async () => {
    if (!editRow?.previewID) return;
    if (editStatus === 'Assigned' && !editOpp) return;
    setSaving(true);
    setError('');
    try {
      await axios.put(
        `${API_BASE}/${pid}/adjust-allocation/${editRow.previewID}`,
        { opportunityID: editStatus === 'Assigned' ? Number(editOpp) : null, status: editStatus },
        { headers }
      );
      setSuccess('تم تعديل التوزيع بنجاح');
      closeEdit();
      fetchPreview(pid);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر حفظ التعديل');
    } finally {
      setSaving(false);
    }
  };

  const filtered = preview.filter(r => {
    if (filterStatus === 'ASSIGNED'   && r.status !== 'Assigned')   return false;
    if (filterStatus === 'UNASSIGNED' && r.status !== 'Unassigned') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${r.firstName} ${r.lastName}`.toLowerCase().includes(q) && !(r.studentID || '').includes(q)) return false;
    }
    return true;
  });

  const assigned   = preview.filter(r => r.status === 'Assigned').length;
  const unassigned = preview.filter(r => r.status === 'Unassigned').length;

  const statusPill = {
    CONFIRMED: { bg: P_LT,      color: P,        label: 'معتمد'       },
    DRAFT:     { bg: '#fffbeb', color: '#d97706', label: 'مسودة'          },
    NONE:      { bg: '#f3f4f6', color: '#6b7280', label: 'لم يُولَّد بعد' },
  }[allocationStatus];

  const filterTabsList = [
    { key: 'ALL',        label: 'الكل',       count: preview.length },
    { key: 'ASSIGNED',   label: 'تم التعيين', count: assigned       },
    { key: 'UNASSIGNED', label: 'غير معيّن',  count: unassigned     },
  ];

  return (
    <div dir="rtl" style={{ padding: '32px', minHeight: '100vh', background: P_LT }}>

      <PageHeader icon={MdPeople} title="إدارة قوائم الطلاب" subtitle="توليد التوزيع التلقائي ومراجعته وتعديله واعتماده">
        {loading ? (
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>جاري التحميل...</span>
        ) : (
          <select value={pid} onChange={e => { setPid(e.target.value); setError(''); setSuccess(''); }} style={selectStyle}>
            <option value="">اختر فترة...</option>
            {periods.map(p => <option key={p.periodID} value={p.periodID}>{p.name} — {p.status}</option>)}
          </select>
        )}
        {pid && (
          <span style={{ background: statusPill.bg, color: statusPill.color, borderRadius: '20px', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
            {statusPill.label}
          </span>
        )}
      </PageHeader>

      {error   && <AlertBox type="error"   message={error}   />}
      {success && <AlertBox type="success" message={success} />}

      {/* Stat Cards */}
      {preview.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon={MdPeople}      label="إجمالي الطلاب" value={preview.length} color="#6366f1" bg="#eef2ff" />
          <StatCard icon={MdCheckCircle} label="تم تعيينهم"    value={assigned}       color={P}       bg={P_LT}   />
          <StatCard icon={MdClose}       label="غير معيّنين"   value={unassigned}     color="#dc2626" bg="#fef2f2" />
        </div>
      )}

      {/* Action Buttons */}
      {pid && (
        <div style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb',
          padding: '20px 24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <button
            onClick={generate}
            disabled={generating || allocationStatus === 'CONFIRMED'}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: allocationStatus === 'CONFIRMED' ? '#f3f4f6' : P,
              color: allocationStatus === 'CONFIRMED' ? '#9ca3af' : '#fff',
              border: 'none', borderRadius: '10px', padding: '10px 20px',
              cursor: allocationStatus === 'CONFIRMED' ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
            }}
          >
            <MdAutoFixHigh size={18} />
            {generating ? 'جارٍ التوليد...' : 'توليد التوزيع'}
          </button>

          {preview.length > 0 && allocationStatus !== 'CONFIRMED' && (
            <button
              onClick={confirm}
              disabled={confirming}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: P,
                border: `1.5px solid ${P}`, borderRadius: '10px', padding: '10px 20px',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
              }}
            >
              <MdCheckCircle size={18} />
              {confirming ? 'جارٍ الاعتماد...' : 'اعتماد التوزيع النهائي'}
            </button>
          )}

          {allocationStatus === 'CONFIRMED' && (
            <span style={{ fontSize: '14px', color: '#6b7280' }}>تم اعتماد التوزيع — لا يمكن التعديل</span>
          )}
        </div>
      )}

      {prevLoad && <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af' }}>جاري تحميل التوزيع...</div>}

      {/* Table */}
      {!prevLoad && preview.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
          {/* Filter Bar */}
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FilterTabs tabs={filterTabsList} active={filterStatus} onChange={setFilterStatus} />
            <div style={{ position: 'relative', flex: 1 }}>
              <MdSearch size={18} color="#9ca3af" style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو الرقم الجامعي..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '9px 38px 9px 14px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit',
                  background: '#fafafa', direction: 'rtl', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'الطالب', 'الرقم الجامعي', 'المعدل', 'المستشفى', 'الحالة', 'إجراء'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>لا توجد نتائج</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.previewID || i}
                  style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>{i + 1}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>{r.firstName} {r.lastName}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{r.studentID}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{Number(r.universityGPA || 0).toFixed(2)}</td>
                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{r.hospitalName || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: r.status === 'Assigned' ? P_LT : '#fef2f2',
                      color:      r.status === 'Assigned' ? P     : '#dc2626',
                      borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600,
                    }}>
                      {r.status === 'Assigned' ? 'تم التعيين' : 'غير معيّن'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {allocationStatus !== 'CONFIRMED' && (
                      <button onClick={() => openEdit(r)} style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
                        borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                      }}>
                        <MdEdit size={15} /> تعديل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editRow && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', width: 'min(440px, 95vw)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', direction: 'rtl' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827' }}>تعديل يدوي</h2>
            </div>

            <div style={{ background: P_LT, borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>{editRow.firstName} {editRow.lastName}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{editRow.studentID} — معدل {Number(editRow.universityGPA || 0).toFixed(2)}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>الحالة</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value="Assigned">تم التعيين</option>
                <option value="Unassigned">غير معيّن</option>
              </select>
            </div>

            {editStatus === 'Assigned' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>المستشفى</label>
                <select value={editOpp} onChange={e => setEditOpp(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                  <option value="">اختر مستشفى...</option>
                  {hospitals.map(h => (
                    <option key={h.opportunityID} value={h.opportunityID}>{h.hospitalName}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>السبب</label>
              <textarea
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="اكتب سبب التعديل..."
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  fontSize: '14px', fontFamily: 'inherit', direction: 'rtl', resize: 'none',
                  outline: 'none', boxSizing: 'border-box', color: '#111827',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeEdit} style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb',
                background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
              }}>إلغاء</button>
              <button onClick={saveEdit} disabled={saving || (editStatus === 'Assigned' && !editOpp)} style={{
                padding: '10px 20px', borderRadius: '10px', border: 'none',
                background: (saving || (editStatus === 'Assigned' && !editOpp)) ? '#d1d5db' : P,
                color: '#fff', cursor: (saving || (editStatus === 'Assigned' && !editOpp)) ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '14px', fontFamily: 'inherit',
              }}>
                {saving ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!prevLoad && pid && preview.length === 0 && !error && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '48px', textAlign: 'center', color: '#9ca3af', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <MdAutoFixHigh size={36} color="#d1d5db" style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>لم يُولَّد توزيع بعد لهذه الفترة</p>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>اضغط "توليد التوزيع" لبدء الخوارزمية</p>
        </div>
      )}
    </div>
  );
}

export default StudentListPage;
