import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Calendar, Sparkles } from 'lucide-react';

const Header = ({ title, onSearchChange }) => {
  const { authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await authFetch('/meetings');
      if (res.ok) {
        const data = await res.json();
        // Generate notifications for meetings starting in the next 48 hours
        const now = new Date();
        const upcoming = data.meetings.filter(m => {
          const start = new Date(m.startTime);
          const diffHours = (start - now) / (1000 * 60 * 60);
          return diffHours > 0 && diffHours < 48;
        });

        const list = upcoming.map(m => ({
          id: m.id,
          title: `Upcoming Meeting: ${m.title}`,
          time: new Date(m.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(m.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          details: m.description || 'No description provided.'
        }));
        setNotifications(list);
      }
    } catch (e) {
      console.error('Error fetching reminders', e);
    }
  };

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h1 style={styles.title}>{title}</h1>
      </div>

      <div style={styles.right}>
        {/* Search */}
        {onSearchChange && (
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search leads, details..."
              value={searchVal}
              onChange={handleSearch}
              style={styles.searchInput}
            />
          </div>
        )}

        {/* Notifications */}
        <div style={styles.bellWrapper}>
          <button 
            style={styles.bellBtn} 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span style={styles.badge}>{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div style={styles.dropdown} className="glass-panel">
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                <span style={styles.dropdownCount}>{notifications.length} Unread</span>
              </div>
              <div style={styles.dropdownList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyState}>
                    <Sparkles size={24} color="var(--text-light)" />
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>All caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={styles.item}>
                      <div style={styles.itemHeader}>
                        <Calendar size={14} color="var(--color-primary)" />
                        <span style={styles.itemTitle}>{n.title}</span>
                      </div>
                      <p style={styles.itemDetail}>{n.details}</p>
                      <span style={styles.itemTime}>{n.date} at {n.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '8px',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-light)',
    pointerEvents: 'none',
  },
  searchInput: {
    padding: '10px 16px 10px 38px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    width: '260px',
    transition: 'all 0.2s',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
    ':focus': {
      width: '320px',
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    }
  },
  bellWrapper: {
    position: 'relative',
  },
  bellBtn: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all 0.2s',
    position: 'relative',
    ':hover': {
      backgroundColor: '#f8fafc',
      transform: 'scale(1.05)',
    }
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    backgroundColor: 'var(--color-error)',
    color: 'white',
    borderRadius: '50%',
    minWidth: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    border: '2px solid white',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '48px',
    width: '320px',
    maxHeight: '400px',
    background: 'white',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid #e2e8f0',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitle: {
    fontWeight: '600',
    fontSize: '14px',
  },
  dropdownCount: {
    fontSize: '12px',
    color: 'var(--color-primary)',
    fontWeight: '500',
  },
  dropdownList: {
    overflowY: 'auto',
    maxHeight: '320px',
  },
  emptyState: {
    padding: '32px 16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  item: {
    padding: '12px 16px',
    borderBottom: '1px solid #f8fafc',
    transition: 'background 0.2s',
    cursor: 'default',
    ':hover': {
      backgroundColor: '#f8fafc',
    }
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: '13px',
    color: 'var(--text-primary)',
  },
  itemDetail: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemTime: {
    fontSize: '10px',
    color: 'var(--text-light)',
    fontWeight: '500',
  }
};

export default Header;
