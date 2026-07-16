import React from 'react';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

const PaymentGateways = () => {
  const gateways = [
    { name: 'Stripe Payments', status: 'Connected', volume: '₹24,200', active: true, color: '#635bff' },
    { name: 'PayPal checkout', status: 'Connected', volume: '₹8,143', active: true, color: '#003087' },
    { name: 'Razorpay API', status: 'Inactive', volume: '₹0', active: false, color: '#0b72e7' },
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Payment Gateways</h3>
      
      <div style={styles.list}>
        {gateways.map((g, idx) => (
          <div key={idx} style={styles.item} className="glass-panel">
            <div style={{ ...styles.colorBar, backgroundColor: g.color }} />
            <div style={styles.itemContent}>
              <div style={styles.left}>
                <div style={styles.iconWrapper}>
                  <CreditCard size={16} color={g.color} />
                </div>
                <div>
                  <h4 style={styles.name}>{g.name}</h4>
                  <div style={styles.statusRow}>
                    {g.active ? (
                      <CheckCircle2 size={12} color="var(--color-success)" />
                    ) : (
                      <AlertCircle size={12} color="var(--text-light)" />
                    )}
                    <span style={{ 
                      ...styles.statusText, 
                      color: g.active ? 'var(--color-success)' : 'var(--text-secondary)'
                    }}>
                      {g.status}
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.right}>
                <span style={styles.volume}>{g.volume}</span>
                <span style={styles.volumeLabel}>Processed</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    marginBottom: '16px',
    fontWeight: '600',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  item: {
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s',
    ':hover': {
      transform: 'translateY(-1px)',
    }
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
  },
  itemContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingLeft: '8px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '600',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  volume: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
  },
  volumeLabel: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
};

export default PaymentGateways;
