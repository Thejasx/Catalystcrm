import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MeetingModal = ({ isOpen, onClose, onSave, meeting, leadIdFilter }) => {
  const { authFetch, user } = useAuth();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [leadsList, setLeadsList] = useState([]);
  const [error, setError] = useState('');
  const [hostId, setHostId] = useState('');
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchLeads();
      if (user?.role === 'admin') {
        fetchStaff();
      }
      if (meeting) {
        setTitle(meeting.title || '');
        setStartTime(formatDateTimeLocal(meeting.startTime));
        setEndTime(formatDateTimeLocal(meeting.endTime));
        setDescription(meeting.description || '');
        const currentLeadId = meeting.leadId
          ? (typeof meeting.leadId === 'object' ? (meeting.leadId._id || meeting.leadId.id || '') : meeting.leadId)
          : '';
        const currentHostId = meeting.hostId
          ? (typeof meeting.hostId === 'object' ? (meeting.hostId._id || meeting.hostId.id || '') : meeting.hostId)
          : '';
        setLeadId(currentLeadId);
        setHostId(currentHostId);
      } else {
        setTitle('');
        setStartTime(getDefaultStartTime());
        setEndTime(getDefaultEndTime());
        setDescription('');
        setLeadId(leadIdFilter || '');
        setHostId(user?.id || '');
      }
      setError('');
    }
  }, [isOpen, meeting, leadIdFilter, user]);

  const fetchLeads = async () => {
    try {
      const res = await authFetch('/leads');
      if (res.ok) {
        const data = await res.json();
        setLeadsList(data.leads);
      }
    } catch (e) {
      console.error('Error fetching leads list', e);
    }
  };

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

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const getDefaultStartTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    return formatDateTimeLocal(now);
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    now.setMinutes(0, 0, 0);
    return formatDateTimeLocal(now);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) {
      setError('Title, Start Time, and End Time are required');
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError('End Time must be after Start Time');
      return;
    }

    onSave({
      id: meeting?.id,
      title,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      description,
      leadId: leadId || null,
      hostId: hostId || null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{meeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Meeting Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Discovery Sync"
              required
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Start Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">End Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="form-group">
              <label className="form-label">Assign Host (Staff) *</label>
              <select
                className="form-input"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                required
              >
                <option value={user.id}>{user.username} (Admin - You)</option>
                {staffList.filter(s => s.isActive !== false).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.username} ({s.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Related Lead</label>
            <select
              className="form-input"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              disabled={!!leadIdFilter} // Lock if preset from Lead view
            >
              <option value="">None / General Meeting</option>
              {leadsList.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} {lead.company ? `(${lead.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Notes / Agenda</label>
            <textarea
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide meeting description, call links, notes, etc."
            />
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{meeting ? 'Save Changes' : 'Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    maxWidth: '500px',
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
  }
};

export default MeetingModal;
