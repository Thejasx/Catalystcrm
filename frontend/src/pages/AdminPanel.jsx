import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import StaffModal from '../components/StaffModal';
import { 
  UserPlus, 
  ToggleLeft, 
  ToggleRight, 
  Edit3, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';

const AdminPanel = () => {
  const { authFetch } = useAuth();
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Run concurrent requests
      const [staffRes, logsRes] = await Promise.all([
        authFetch('/admin/staff'),
        authFetch('/admin/logs')
      ]);

      if (staffRes.ok && logsRes.ok) {
        const staffData = await staffRes.json();
        const logsData = await logsRes.json();
        setStaff(staffData.staff);
        setLogs(logsData.logs);
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveStaff = async (staffData) => {
    try {
      const url = staffData.id ? `/admin/staff/${staffData.id}` : '/admin/staff';
      const method = staffData.id ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(staffData)
      });

      if (res.ok) {
        showToast(staffData.id ? 'Staff details updated' : 'Staff account created successfully');
        setIsModalOpen(false);
        fetchAdminData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving staff account', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  const handleToggleStatus = async (id, username, currentStatus) => {
    const action = currentStatus ? 'Disable' : 'Enable';
    if (!window.confirm(`Are you sure you want to ${action} account: "${username}"?`)) return;

    try {
      const res = await authFetch(`/admin/staff/${id}/status`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Staff account ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchAdminData();
      } else {
        showToast('Failed to toggle staff status', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Central Admin Panel" />

      <div style={styles.actionsBar}>
        <h3 style={styles.sectionTitle}>Manage Staff Directory</h3>
        <button 
          onClick={() => { setSelectedStaff(null); setIsModalOpen(true); }} 
          className="btn btn-primary"
        >
          <UserPlus size={16} />
          <span>Create Staff Account</span>
        </button>
      </div>

      {/* Staff directory grid */}
      <div style={styles.panel} className="glass-panel">
        {loading && staff.length === 0 ? (
          <div style={styles.loader}>Retrieving staff details...</div>
        ) : staff.length === 0 ? (
          <div style={styles.empty}>No staff accounts found. Click Create Staff Account to add.</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created date</th>
                  <th>Account status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '600' }}>{s.username}</td>
                    <td>{s.email}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={styles.statusCol}>
                        {s.isActive ? (
                          <span style={styles.activeTag}>
                            <CheckCircle2 size={12} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span style={styles.inactiveTag}>
                            <XCircle size={12} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={styles.actionBtns}>
                        <button 
                          onClick={() => handleToggleStatus(s.id, s.username, s.isActive)}
                          style={styles.toggleBtn}
                          title={s.isActive ? 'Disable Login' : 'Enable Login'}
                        >
                          {s.isActive ? (
                            <ToggleRight size={22} color="var(--color-success)" />
                          ) : (
                            <ToggleLeft size={22} color="var(--text-light)" />
                          )}
                        </button>
                        <button 
                          onClick={() => { setSelectedStaff(s); setIsModalOpen(true); }}
                          style={styles.iconBtn}
                          title="Edit staff details"
                        >
                          <Edit3 size={16} color="var(--text-secondary)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Trail Section */}
      <div style={styles.logHeader}>
        <History size={18} color="var(--color-primary)" />
        <h3 style={styles.sectionTitle}>System Audit Trail & Performance</h3>
      </div>

      <div style={styles.panel} className="glass-panel">
        {loading && logs.length === 0 ? (
          <div style={styles.loader}>Loading audit trails...</div>
        ) : logs.length === 0 ? (
          <div style={styles.empty}>No log entries recorded yet.</div>
        ) : (
          <div className="table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Timestamp</th>
                  <th style={{ width: '120px' }}>User</th>
                  <th style={{ width: '160px' }}>Action Type</th>
                  <th>Activity Log Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div style={styles.timeWrapper}>
                        <Clock size={12} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '500' }}>
                      {log.user ? log.user.username : <span style={{ color: 'var(--text-light)' }}>SYSTEM</span>}
                      {log.user && (
                        <span style={styles.roleLabel}>({log.user.role})</span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        ...styles.actionTag,
                        backgroundColor: getActionColorLight(log.action),
                        color: getActionColor(log.action)
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating notification Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
        staff={selectedStaff}
      />
    </div>
  );
};

// Helper colors for action tags
const getActionColor = (action) => {
  if (action.includes('CREATE')) return 'var(--color-success)';
  if (action.includes('DELETE')) return 'var(--color-error)';
  if (action.includes('UPDATE') || action.includes('TOGGLE')) return 'var(--color-warning)';
  return 'var(--color-info)';
};

const getActionColorLight = (action) => {
  if (action.includes('CREATE')) return 'var(--color-success-light)';
  if (action.includes('DELETE')) return 'var(--color-error-light)';
  if (action.includes('UPDATE') || action.includes('TOGGLE')) return 'var(--color-warning-light)';
  return 'var(--color-info-light)';
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  panel: {
    backgroundColor: 'white',
    padding: '12px',
    marginBottom: '28px',
  },
  loader: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-light)',
  },
  statusCol: {
    display: 'flex',
    alignItems: 'center',
  },
  activeTag: {
    color: 'var(--color-success)',
    backgroundColor: 'var(--color-success-light)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  inactiveTag: {
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toggleBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  iconBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  timeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  roleLabel: {
    fontSize: '10px',
    color: 'var(--text-light)',
    marginLeft: '4px',
    textTransform: 'uppercase',
  },
  actionTag: {
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '4px',
    display: 'inline-block',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    color: 'white',
    padding: '12px 24px',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 1100,
    fontSize: '14px',
    fontWeight: '600',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  }
};

export default AdminPanel;
