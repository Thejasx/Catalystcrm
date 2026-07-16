import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const ActiveUsersMap = () => {
  const activeRegions = [
    { country: 'United States', users: '12,450', active: '45%', x: 80, y: 55 },
    { country: 'European Union', users: '6,210', active: '22%', x: 190, y: 45 },
    { country: 'India & SEA', users: '3,840', active: '18%', x: 260, y: 70 },
    { country: 'Others', users: '2,710', active: '15%', x: 310, y: 110 },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Active Users</h3>
          <span style={styles.subtitle}>8,251 Visual Sessions Now</span>
        </div>
        <Globe size={18} color="var(--color-primary)" />
      </div>

      <div style={styles.content}>
        {/* Abstract World Vector Representation */}
        <div style={styles.mapWrapper}>
          <svg viewBox="0 0 380 160" style={styles.svgMap}>
            {/* Soft grid lines to represent tech grid map */}
            <path d="M 0,20 L 380,20 M 0,50 L 380,50 M 0,80 L 380,80 M 0,110 L 380,110 M 0,140 L 380,140" stroke="#f1f5f9" strokeWidth="1" />
            <path d="M 50,0 L 50,160 M 120,0 L 120,160 M 190,0 L 190,160 M 260,0 L 260,160 M 330,0 L 330,160" stroke="#f1f5f9" strokeWidth="1" />

            {/* Abstract simplified continents */}
            {/* North America */}
            <path d="M 40,30 Q 60,35 70,55 T 90,80 Q 70,85 50,80 T 30,50 Z" fill="#e2e8f0" opacity="0.6" />
            {/* South America */}
            <path d="M 60,90 Q 75,100 80,120 T 70,150 Q 55,130 50,105 Z" fill="#e2e8f0" opacity="0.6" />
            {/* Eurasia / Africa */}
            <path d="M 160,30 Q 200,20 240,35 T 280,60 Q 240,80 200,65 T 160,50 Z" fill="#e2e8f0" opacity="0.6" />
            <path d="M 165,60 Q 185,75 190,95 T 180,135 Q 165,115 160,85 Z" fill="#e2e8f0" opacity="0.6" />
            {/* Australia */}
            <path d="M 290,110 Q 310,115 320,125 T 300,140 Q 285,130 280,115 Z" fill="#e2e8f0" opacity="0.6" />

            {/* Pulsing Markers */}
            {activeRegions.map((region, i) => (
              <g key={i}>
                <circle cx={region.x} cy={region.y} r="8" fill="var(--color-primary)" opacity="0.2" className="pulse" />
                <circle cx={region.x} cy={region.y} r="4" fill="var(--color-primary)" />
              </g>
            ))}
          </svg>
        </div>

        {/* Breakdown List */}
        <div style={styles.list}>
          {activeRegions.map((region, idx) => (
            <div key={idx} style={styles.listItem}>
              <div style={styles.countryInfo}>
                <MapPin size={12} color="var(--color-primary)" style={{ opacity: 0.7 }} />
                <span style={styles.countryName}>{region.country}</span>
              </div>
              <div style={styles.usersInfo}>
                <span style={styles.usersVal}>{region.users}</span>
                <span style={styles.percentage}>({region.active})</span>
              </div>
            </div>
          ))}
        </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  mapWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fafbfc',
    borderRadius: 'var(--border-radius-md)',
    padding: '8px',
    border: '1px dashed #e2e8f0',
    overflow: 'hidden',
  },
  svgMap: {
    width: '100%',
    height: 'auto',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    borderBottom: '1px solid #f8fafc',
    paddingBottom: '8px',
  },
  countryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  countryName: {
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  usersInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  usersVal: {
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  percentage: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  }
};

// Add standard animation in document stylesheets if needed, or inline styling.
export default ActiveUsersMap;
