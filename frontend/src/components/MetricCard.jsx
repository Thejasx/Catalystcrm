
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, change, isPositive, index }) => {
  const gradientStyles = [
    'linear-gradient(135deg, #e0e7ff 0%, #e0f2fe 100%)', // Indigo Mesh
    'linear-gradient(135deg, #ffedd5 0%, #fee2e2 100%)', // Orange Mesh
    'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)', // Green Mesh
    'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)', // Purple Mesh
  ];

  return (
    <div style={{
      ...styles.card,
      backgroundImage: gradientStyles[index % gradientStyles.length]
    }} className="glass-panel">
      <div style={styles.top}>
        <span style={styles.title}>{title}</span>
        {change && (
          <div style={{
            ...styles.badge,
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isPositive ? 'var(--color-success)' : 'var(--color-error)'
          }}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div style={styles.value}>{value}</div>
    </div>
  );
};

const styles = {
  card: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '130px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  value: {
    fontSize: '28px',
    fontFamily: 'var(--font-title)',
    fontWeight: '700',
    color: 'var(--text-primary)',
  }
};

export default MetricCard;
