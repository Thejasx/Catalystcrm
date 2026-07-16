import React from 'react';

/**
 * ExcelCard – presents a visual selectable card with an icon, title and description.
 * It supports an active state with a subtle glassmorphism effect.
 */
const ExcelCard = ({ title, description, Icon, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '20px',
        borderRadius: 'var(--border-radius-lg)',
        background: selected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        border: selected ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        boxShadow: selected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <Icon size={36} color={selected ? 'var(--color-primary)' : 'var(--text-secondary)'} />
      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{description}</p>
    </div>
  );
};



export default ExcelCard;
