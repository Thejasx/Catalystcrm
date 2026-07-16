import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const StaffModal = ({ isOpen, onClose, onSave, staff }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        setUsername(staff.username || '');
        setEmail(staff.email || '');
        setPassword(''); // Don't show password for editing
      } else {
        setUsername('');
        setEmail('');
        setPassword('');
      }
      setError('');
    }
  }, [isOpen, staff]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || (!staff && !password)) {
      setError('Username, Email, and Password (for new staff) are required');
      return;
    }

    onSave({
      id: staff?.id,
      username,
      email,
      password: password || undefined
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{staff ? 'Edit Staff Account' : 'Create Staff Account'}</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password {staff ? '(Leave empty to keep current)' : '*'}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={staff ? '••••••••' : 'Enter login password'}
              required={!staff}
            />
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">
              {staff ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    maxWidth: '420px',
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  }
};

export default StaffModal;
