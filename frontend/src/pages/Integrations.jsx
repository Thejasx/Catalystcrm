import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { 
  Calendar, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  CreditCard, 
  Save, 
  ToggleLeft, 
  ToggleRight,
  Sparkles,
  Link2
} from 'lucide-react';

const Integrations = () => {
  const { authFetch } = useAuth();
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations);
      }
    } catch (e) {
      console.error('Error fetching integrations list', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = async (key) => {
    const updatedConfig = { 
      ...integrations[key], 
      enabled: !integrations[key].enabled 
    };
    
    // Save immediately on toggle
    await saveSettings(key, updatedConfig);
  };

  const handleFieldChange = (key, field, value) => {
    setIntegrations({
      ...integrations,
      [key]: {
        ...integrations[key],
        [field]: value
      }
    });
  };

  const saveSettings = async (key, configData) => {
    try {
      setSavingKey(key);
      const targetConfig = configData || integrations[key];

      const res = await authFetch('/integrations', {
        method: 'POST',
        body: JSON.stringify({
          key,
          config: targetConfig
        })
      });

      if (res.ok) {
        showToast('Integration configuration saved successfully');
        fetchIntegrations();
      } else {
        showToast('Failed to save integration settings', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading || !integrations) {
    return <div style={styles.loader}>Loading configurations...</div>;
  }

  // Define details for visual layout
  const cards = [
    {
      key: 'google_calendar_sync',
      name: 'Google Calendar Integration',
      desc: 'Sync scheduled client meetings and send reminders directly to invitees.',
      icon: Calendar,
      color: '#4285f4',
      fields: [
        { name: 'Client ID', key: 'clientId', type: 'text', placeholder: 'Enter Google OAuth Client ID' },
        { name: 'Client Secret', key: 'clientSecret', type: 'password', placeholder: 'Enter Client Secret' }
      ]
    },
    {
      key: 'whatsapp_api',
      name: 'WhatsApp Cloud API',
      desc: 'Send automated follow-ups and marketing details to leads via WhatsApp.',
      icon: MessageSquare,
      color: '#25d366',
      fields: [
        { name: 'Phone Number ID', key: 'phoneId', type: 'text', placeholder: 'Enter WhatsApp Phone ID' },
        { name: 'System Access Token', key: 'accessToken', type: 'password', placeholder: 'Enter System Token' }
      ]
    },
    {
      key: 'email_smtp',
      name: 'Email SMTP / SendGrid',
      desc: 'Configure standard business email triggers for follow-ups and notifications.',
      icon: Mail,
      color: '#ea4335',
      fields: [
        { name: 'SMTP Server Host', key: 'smtpHost', type: 'text', placeholder: 'e.g. smtp.sendgrid.net' },
        { name: 'SMTP Server Port', key: 'smtpPort', type: 'text', placeholder: 'e.g. 587' },
        { name: 'SMTP Username', key: 'smtpUser', type: 'text', placeholder: 'SMTP login' },
        { name: 'SMTP Password', key: 'smtpPass', type: 'password', placeholder: 'SMTP secret password' }
      ]
    },
    {
      key: 'sms_gateway',
      name: 'Twilio SMS Gateway',
      desc: 'Trigger SMS messages directly to lead mobile phones on updates.',
      icon: Smartphone,
      color: '#f22f46',
      fields: [
        { name: 'Account SID', key: 'twilioSid', type: 'text', placeholder: 'Twilio account string identifier' },
        { name: 'Auth Token', key: 'twilioToken', type: 'password', placeholder: 'Twilio account secret token' },
        { name: 'Twilio Phone No', key: 'twilioPhone', type: 'text', placeholder: 'e.g. +1 555-0199' }
      ]
    },
    {
      key: 'payment_gateway',
      name: 'Stripe Payment Processor',
      desc: 'Manage lead transaction pipelines and automatically close deals as WON on payments.',
      icon: CreditCard,
      color: '#635bff',
      fields: [
        { name: 'Publishable API Key', key: 'stripePublicKey', type: 'text', placeholder: 'pk_live_...' },
        { name: 'Secret API Key', key: 'stripeSecretKey', type: 'password', placeholder: 'sk_live_...' }
      ]
    }
  ];

  return (
    <div style={styles.container}>
      <Header title="API Connectors & Integrations" />

      {/* Banner */}
      <div style={styles.banner} className="glass-panel">
        <div style={styles.bannerLeft}>
          <Link2 size={24} color="var(--color-primary)" />
          <div>
            <h4 style={styles.bannerTitle}>Modular API Ecosystem</h4>
            <p style={styles.bannerText}>Connect external services to automate notifications, payments, and calendar syncs.</p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {cards.map((c) => {
          const config = integrations[c.key];
          const IconComponent = c.icon;

          return (
            <div key={c.key} style={styles.card} className="glass-panel">
              <div style={styles.cardHeader}>
                <div style={styles.headerLeft}>
                  <div style={{ ...styles.iconWrapper, backgroundColor: `${c.color}15` }}>
                    <IconComponent size={20} color={c.color} />
                  </div>
                  <div>
                    <h4 style={styles.cardName}>{c.name}</h4>
                    <span style={{
                      ...styles.statusText,
                      color: config.enabled ? 'var(--color-success)' : 'var(--text-light)'
                    }}>
                      {config.enabled ? 'Active / Linked' : 'Offline'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleToggle(c.key)}
                  style={styles.toggleBtn}
                >
                  {config.enabled ? (
                    <ToggleRight size={28} color="var(--color-success)" />
                  ) : (
                    <ToggleLeft size={28} color="var(--text-light)" />
                  )}
                </button>
              </div>

              <p style={styles.cardDesc}>{c.desc}</p>

              {/* Form config panel opens if enabled */}
              {config.enabled && (
                <div style={styles.formPanel}>
                  {c.fields.map((f) => (
                    <div key={f.key} className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">{f.name}</label>
                      <input
                        type={f.type}
                        className="form-input"
                        style={{ fontSize: '13px', padding: '8px 12px' }}
                        value={config[f.key] || ''}
                        onChange={(e) => handleFieldChange(c.key, f.key, e.target.value)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}

                  <button 
                    onClick={() => saveSettings(c.key)}
                    className="btn btn-primary"
                    style={styles.saveBtn}
                    disabled={savingKey === c.key}
                  >
                    <Save size={14} />
                    <span>{savingKey === c.key ? 'Saving...' : 'Save credentials'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  loader: {
    padding: '80px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
  banner: {
    padding: '16px 24px',
    backgroundColor: 'white',
    marginTop: '24px',
    marginBottom: '24px',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  bannerTitle: {
    fontSize: '15px',
    fontWeight: '600',
  },
  bannerText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: 'var(--border-radius-lg)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: '16px',
    fontWeight: '600',
  },
  statusText: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  cardDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '12px',
    lineHeight: '1.5',
  },
  formPanel: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px dashed #e2e8f0',
    backgroundColor: '#fafbfc',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
  },
  saveBtn: {
    marginTop: '8px',
    padding: '8px 14px',
    fontSize: '12px',
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

export default Integrations;
