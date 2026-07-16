import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import Header from '../components/Header';
import LeadModal from '../components/LeadModal';
import MeetingModal from '../components/MeetingModal';
import { 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  X
} from 'lucide-react';

const Leads = () => {
  const { authFetch, user, token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingLeadId, setMeetingLeadId] = useState(null);

  // Import overlay state
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState(null);

  // Notification Toast state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [searchVal, statusFilter, assignedToMe]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (searchVal) query.append('search', searchVal);
      if (statusFilter) query.append('status', statusFilter);
      if (assignedToMe) query.append('assignedToMe', 'true');

      const res = await authFetch(`/leads?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
      }
    } catch (e) {
      console.error('Error fetching leads list', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveLead = async (leadData) => {
    try {
      const url = leadData.id ? `/leads/${leadData.id}` : '/leads';
      const method = leadData.id ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(leadData)
      });

      if (res.ok) {
        showToast(leadData.id ? 'Lead details updated successfully' : 'Lead created successfully');
        setIsLeadModalOpen(false);
        setSelectedLead(null);
        fetchLeads();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving lead', 'error');
      }
    } catch (e) {
      showToast('API Connection error', 'error');
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete lead: "${name}"?`)) return;

    try {
      const res = await authFetch(`/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Lead deleted successfully');
        fetchLeads();
      } else {
        showToast('Failed to delete lead', 'error');
      }
    } catch (e) {
      showToast('API Connection error', 'error');
    }
  };

  const handleScheduleMeeting = async (meetingData) => {
    try {
      const res = await authFetch('/meetings', {
        method: 'POST',
        body: JSON.stringify(meetingData)
      });

      if (res.ok) {
        showToast('Meeting scheduled successfully');
        setIsMeetingModalOpen(false);
      } else {
        const err = await res.json();
        showToast(err.message || 'Error scheduling meeting', 'error');
      }
    } catch (e) {
      showToast('API Connection error', 'error');
    }
  };

  const handleExportLeads = () => {
    // Standard download window anchor
    fetch(`${API_BASE_URL}/leads/export`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Leads_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('CRM data exported successfully');
      })
      .catch(() => showToast('Failed to export leads', 'error'));
  };

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImportFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processImportFile(files[0]);
    }
  };

  const processImportFile = (file) => {
    const reader = new FileReader();
    setImportStatus({ name: file.name, status: 'uploading' });

    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const res = await authFetch('/leads/import', {
          method: 'POST',
          body: JSON.stringify({ fileBase64: base64 })
        });

        if (res.ok) {
          const data = await res.json();
          setImportStatus({ name: file.name, status: 'success', message: data.message });
          showToast(data.message);
          fetchLeads();
          setTimeout(() => setShowImportDrawer(false), 2000);
        } else {
          const err = await res.json();
          setImportStatus({ name: file.name, status: 'error', message: err.message || 'Import failed' });
        }
      } catch (err) {
        setImportStatus({ name: file.name, status: 'error', message: 'Connection error' });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={styles.container}>
      <Header title="Lead Management" onSearchChange={setSearchVal} />

      {/* Action button row and search/filter overlays */}
      <div style={styles.actionsBar}>
        <div style={styles.filters}>
          <select
            style={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Qualified">Qualified</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              style={styles.checkbox}
            />
            <span>Assigned to me</span>
          </label>
        </div>

        <div style={styles.buttons}>
          <button onClick={handleExportLeads} className="btn btn-secondary">
            <Download size={16} />
            <span>Export Excel</span>
          </button>
          <button onClick={() => setShowImportDrawer(true)} className="btn btn-secondary">
            <Upload size={16} />
            <span>Import Leads</span>
          </button>
          <button 
            onClick={() => { setSelectedLead(null); setIsLeadModalOpen(true); }} 
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Lead table */}
      <div style={styles.tablePanel} className="glass-panel">
        {loading && leads.length === 0 ? (
          <div style={styles.loading}>Retrieving leads list...</div>
        ) : leads.length === 0 ? (
          <div style={styles.empty}>No leads found matching your criteria.</div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned Agent</th>
                  <th>Hot Lead</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: '600' }}>{lead.name}</td>
                    <td>{lead.company || <span style={styles.emptyCell}>-</span>}</td>
                    <td>{lead.email || <span style={styles.emptyCell}>-</span>}</td>
                    <td>{lead.phone || <span style={styles.emptyCell}>-</span>}</td>
                    <td>
                      <span className={`badge badge-${lead.status.toLowerCase().replace(' ', '-')}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: '500' }}>
                      {lead.assignedTo ? lead.assignedTo.username : 'Unassigned'}
                    </td>
                    <td>{lead.hotLead ? 'Yes' : 'No'}</td>
                    <td>
                      <div style={styles.actionIcons}>
                        <button 
                          onClick={() => { setMeetingLeadId(lead.id); setIsMeetingModalOpen(true); }}
                          style={styles.iconBtn}
                          title="Schedule Sync Meeting"
                        >
                          <Calendar size={16} color="var(--color-primary)" />
                        </button>
                        <button 
                          onClick={() => { setSelectedLead(lead); setIsLeadModalOpen(true); }}
                          style={styles.iconBtn}
                          title="Edit Details"
                        >
                          <Edit3 size={16} color="var(--text-secondary)" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          style={styles.iconBtn}
                          title="Delete Lead"
                        >
                          <Trash2 size={16} color="var(--color-error)" />
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

      {/* Import leads drawer overlay */}
      {showImportDrawer && (
        <div className="modal-overlay">
          <div className="modal-content" style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <h3 style={styles.drawerTitle}>Import Leads from Excel</h3>
              <button onClick={() => setShowImportDrawer(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleFileDrop}
              style={{
                ...styles.dropZone,
                borderColor: isDragging ? 'var(--color-primary)' : '#cbd5e1',
                backgroundColor: isDragging ? 'var(--color-primary-light)' : '#f8fafc'
              }}
            >
              <FileSpreadsheet size={40} color="var(--text-light)" />
              <p style={{ marginTop: '12px', fontWeight: '600' }}>
                Drag and drop your spreadsheet file here
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supports .xlsx or .xls files
              </p>
              <span style={{ margin: '12px 0', fontSize: '12px', color: 'var(--text-light)' }}>or</span>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                Browse Files
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileSelect} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            {importStatus && (
              <div style={styles.statusBox}>
                <div style={{ fontWeight: '500' }}>{importStatus.name}</div>
                {importStatus.status === 'uploading' && (
                  <div style={{ color: 'var(--color-primary)', fontSize: '12px', marginTop: '4px' }}>
                    Uploading and parsing file...
                  </div>
                )}
                {importStatus.status === 'success' && (
                  <div style={{ color: 'var(--color-success)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span>{importStatus.message}</span>
                  </div>
                )}
                {importStatus.status === 'error' && (
                  <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{importStatus.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating notification Toast */}
      {toast && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'error' ? 'var(--color-error)' : 'var(--color-primary)'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleSaveLead}
        lead={selectedLead}
      />

      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={handleScheduleMeeting}
        leadIdFilter={meetingLeadId}
      />
    </div>
  );
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
    flexWrap: 'wrap',
    gap: '16px',
  },
  filters: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid #cbd5e1',
    backgroundColor: 'white',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
  },
  tablePanel: {
    backgroundColor: 'white',
    padding: '8px',
    minHeight: '350px',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  empty: {
    padding: '60px',
    textAlign: 'center',
    color: 'var(--text-light)',
  },
  emptyCell: {
    color: 'var(--text-light)',
  },
  actionIcons: {
    display: 'flex',
    gap: '10px',
  },
  iconBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
    }
  },
  drawer: {
    maxWidth: '460px',
    padding: '24px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  drawerTitle: {
    fontSize: '18px',
  },
  closeBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  dropZone: {
    border: '2px dashed #cbd5e1',
    borderRadius: 'var(--border-radius-lg)',
    padding: '36px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  statusBox: {
    marginTop: '16px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid #e2e8f0',
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

export default Leads;
