import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Connection failure. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="mesh-gradient">
      <div style={styles.card} className="glass-panel">
        <div style={styles.logoArea}>
          <div style={styles.logoCircle}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={styles.title}>Catalyst CRM</h1>
          <p style={styles.subtitle}>Enter credentials to access your sales portal</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                className="form-input"
                style={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or staff1"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                className="form-input"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.tips}>
          <div style={styles.tipHeader}>Demo Accounts:</div>
          <div style={styles.tipRow}>Admin: <code style={styles.code}>admin</code> / <code style={styles.code}>adminpassword</code></div>
          <div style={styles.tipRow}>Staff: <code style={styles.code}>staff1</code> / <code style={styles.code}>staffpassword</code></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '36px',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '28px',
  },
  logoCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
    boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error)',
    padding: '12px 16px',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-light)',
  },
  input: {
    width: '100%',
    paddingLeft: '38px',
  },
  submitBtn: {
    marginTop: '12px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: 'var(--border-radius-md)',
  },
  tips: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px dashed #e2e8f0',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  tipHeader: {
    fontWeight: '600',
    marginBottom: '4px',
    color: 'var(--text-primary)',
  },
  tipRow: {
    marginBottom: '2px',
  },
  code: {
    backgroundColor: '#f1f5f9',
    padding: '2px 4px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: 'var(--color-primary)',
  }
};

export default Login;
