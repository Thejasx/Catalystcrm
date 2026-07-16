import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  Sliders, 
  LogOut,
  Sparkles,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '' });

  const triggerToast = (message) => {
    setToast({ show: true, message });
    // Clear existing timeouts if any, or just use simple timeout
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Integrations', path: '/integrations', icon: Sliders },
    { name: 'My Excel', path: '/my-excel', icon: Lock }
  ];

  // Only add Admin Panel for Admin user
  if (user && user.role === 'admin') {
    menuItems.splice(4, 0, { name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.brandLogo}>
          <Sparkles size={18} color="white" />
        </div>
        <span style={styles.brandName}>Catalyst CRM</span>
      </div>

      {/* Nav Menu */}
      <nav style={styles.nav}>
        <ul style={styles.navList}>
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.locked) {
              return (
                <li key={item.name}>
                  <button
                    onClick={() => triggerToast('This feature is under development')}
                    style={{
                      ...styles.navLink,
                      background: 'transparent',
                      border: 'none',
                      width: '100%',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    className="sidebar-locked-btn"
                  >
                    <Icon 
                      size={20} 
                      style={{
                        transition: 'color 0.2s',
                        color: 'var(--text-light)'
                      }} 
                    />
                    <span style={{ color: 'var(--text-light)' }}>{item.name}</span>
                    <Lock size={14} style={{ marginLeft: 'auto', color: 'var(--text-light)', opacity: 0.8 }} />
                  </button>
                </li>
              );
            }

            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        size={20} 
                        style={{
                          transition: 'color 0.2s',
                          color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)'
                        }} 
                      />
                      <span>{item.name}</span>
                      {isActive && <div style={styles.activeDot} />}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div style={styles.footer}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user ? user.username.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.username}>{user ? user.username : 'User'}</div>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: user?.role === 'admin' ? 'var(--color-primary-light)' : 'rgba(241, 245, 249, 0.9)',
              color: user?.role === 'admin' ? 'var(--color-primary)' : 'var(--text-secondary)'
            }}>
              {user ? user.role : 'Staff'}
            </span>
          </div>
        </div>

        <button onClick={logout} style={styles.logoutBtn} title="Logout">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Floating notification Toast */}
      {toast.show && (
        <div style={styles.toast}>
          <Lock size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
          <span>{toast.message}</span>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '36px',
    paddingLeft: '8px',
  },
  brandLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  nav: {
    flex: 1,
  },
  navList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-md)',
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navLinkActive: {
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    right: '16px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary)',
  },
  footer: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    borderRadius: 'var(--border-radius-md)',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: 'inset 0 2px 4px rgba(79, 70, 229, 0.1)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  username: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '10px',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: 'var(--border-radius-md)',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    backgroundColor: 'var(--text-primary)',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 9999,
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

export default Sidebar;
