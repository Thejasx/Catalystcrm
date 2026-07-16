import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// LeadModal – Handles both Create and Edit Lead
const LeadModal = ({ isOpen, onClose, onSave, lead, inline = false }) => {
  const { authFetch, user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('New');
  const [notes, setNotes] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [dealRate, setDealRate] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [dealOutcome, setDealOutcome] = useState('pending');
  const [hotLead, setHotLead] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');

  // Load staff list & pre‑fill fields when editing
  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      if (lead) {
        setName(lead.name || '');
        setEmail(lead.email || '');
        setPhone(lead.phone || '');
        setCompany(lead.company || '');
        setStatus(lead.status || 'New');
        setNotes(lead.notes || '');
        const assignedId = lead.assignedToId
          ? (typeof lead.assignedToId === 'object' ? (lead.assignedToId._id || lead.assignedToId.id || '') : lead.assignedToId)
          : '';
        setAssignedToId(assignedId);
        setDealRate(lead.dealRate !== undefined ? lead.dealRate : '');
        setExpectedCloseDate(lead.expectedCloseDate ? lead.expectedCloseDate.split('T')[0] : '');
        setDealOutcome(lead.dealOutcome || 'pending');
        setHotLead(lead.hotLead !== undefined ? lead.hotLead : false);
      } else {
        // reset for new lead
        setName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setStatus('New');
        setNotes('');
        setAssignedToId('');
        setDealRate('');
        setExpectedCloseDate('');
        setDealOutcome('pending');
        setHotLead(false);
      }
      setError('');
    }
  }, [isOpen, lead]);

  const fetchStaff = async () => {
    try {
      const res = await authFetch('/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff);
      }
    } catch (e) {
      console.error('Error fetching staff list', e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      setError('Lead Name is required');
      return;
    }
    onSave({
      id: lead?.id,
      name,
      email,
      phone,
      company,
      status,
      notes,
      // Staff always self-assign; admins can pick a staff member
      assignedToId: user?.role === 'admin' && assignedToId ? assignedToId : null,
      dealRate: dealRate !== '' ? parseFloat(dealRate) : 0,
      expectedCloseDate: expectedCloseDate || null,
      dealOutcome,
      hotLead,
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-content" style={styles.modal}>
      <div style={styles.header}>
        <h2 style={styles.title}>{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
        <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required />
        </div>
        {/* Email & Phone */}
        <div style={styles.row}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. john@acme.com" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 555-0199" />
          </div>
        </div>
        {/* Company & Status */}
        <div style={styles.row}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Company</label>
            <input type="text" className="form-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Lead Status</label>
            <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="New">New</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
        {/* Deal Rate */}
        <div className="form-group">
          <label className="form-label">Deal Rate (₹) *</label>
          <input type="number" step="0.01" className="form-input" value={dealRate} onChange={e => setDealRate(e.target.value)} placeholder="e.g. 25000" required />
        </div>
        {/* Expected Close Date */}
        <div className="form-group">
          <label className="form-label">Expected Close Date</label>
          <input type="date" className="form-input" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} />
        </div>
        {/* Deal Outcome */}
        <div className="form-group">
          <label className="form-label">Deal Outcome</label>
          <select className="form-input" value={dealOutcome} onChange={e => setDealOutcome(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="won">Won</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {/* Hot Lead */}
        <div className="form-group">
          <label className="form-label">
            <input type="checkbox" checked={hotLead} onChange={e => setHotLead(e.target.checked)} style={{ marginRight: '8px' }} />
            Hot Lead
          </label>
        </div>
        {/* Assign Agent - Only visible to admins */}
        {user?.role === 'admin' && (
          <div className="form-group">
            <label className="form-label">Assign Agent</label>
            <select className="form-input" value={assignedToId} onChange={e => setAssignedToId(e.target.value)}>
              <option value="">Unassigned (Default to Me)</option>
              {staffList.filter(staff => staff.isActive !== false).map(staff => (
                <option key={staff.id} value={staff.id}>{staff.username} ({staff.email})</option>
              ))}
            </select>
          </div>
        )}
        {/* Interaction Notes */}
        <div className="form-group">
          <label className="form-label">Interaction Notes</label>
          <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Record follow‑up details, customer constraints, etc." />
        </div>
        {/* Footer */}
        <div style={styles.footer}>
          <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">{lead ? 'Save Changes' : 'Create Lead'}</button>
        </div>
      </form>
    </div>
  );

    return (
    <div className="modal-overlay">
      {modalContent}
    </div>
  );
};

const styles = {
  modal: {
    maxWidth: '550px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  // Fixed side drawer for inline panel view
  inlineDrawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '440px',
    height: '100vh',
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
    zIndex: 1200,
    overflowY: 'auto',
    padding: '24px',
    borderLeft: '1px solid var(--color-border-muted)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  error: {
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '10px 14px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
};

export default LeadModal;
