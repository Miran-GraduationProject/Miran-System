import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  MdDashboard,
  MdLocalHospital,
  MdDateRange,
  MdBarChart,
  MdPeople,
  MdVerified,
  MdChevronRight,
  MdChevronLeft,
} from 'react-icons/md';

const navItems = [
  { name: 'لوحة التحكم',       path: '/coordinator',           icon: MdDashboard    },
  { name: 'إدارة المستشفيات',  path: '/hospitals',             icon: MdLocalHospital },
  { name: 'الفترات التدريبية', path: '/training-periods',      icon: MdDateRange    },
  { name: 'متابعة التسجيل',   path: '/registration-monitor',  icon: MdBarChart     },
  { name: 'قوائم الطلاب',     path: '/student-list',          icon: MdPeople       },
  { name: 'الفرص المؤكدة',    path: '/confirmed-allocations', icon: MdVerified     },
];

export default function CoordinatorLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: '#ecfdf5' }}>

      {/* ─── Sidebar ─── */}
      <aside
        style={{
          width: collapsed ? '72px' : '260px',
          minHeight: '100vh',
          background: '#ffffff',
          borderLeft: '1px solid #d1fae5',
          transition: 'width 0.3s ease',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-2px 0 12px rgba(45,138,86,0.07)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 20,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: collapsed ? '20px 0' : '20px 16px',
            borderBottom: '1px solid #d1fae5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: '64px',
          }}
        >
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#2d8a56', whiteSpace: 'nowrap' }}>
              لوحة المنسق
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#2d8a56',
              flexShrink: 0,
            }}
          >
            {collapsed ? <MdChevronLeft size={18} /> : <MdChevronRight size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/coordinator'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px 0' : '11px 16px',
                  margin: '2px 8px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? '#2d8a56' : 'transparent',
                  color: isActive ? '#ffffff' : '#4b5563',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                })}
                title={collapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isActive ? 'rgba(255,255,255,0.2)' : '#f0fdf4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={isActive ? '#ffffff' : '#2d8a56'} />
                    </span>
                    {!collapsed && <span>{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid #d1fae5',
              fontSize: '12px',
              color: '#9ca3af',
              textAlign: 'center',
            }}
          >
            نظام ميران © 2026
          </div>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
