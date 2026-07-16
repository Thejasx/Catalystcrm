import React, { useState } from 'react';


/**
 * MappingModal – simple modal that lists detected columns and allows the user to map
 * each column to a system field. It also provides a "Save as reusable template"
 * checkbox. When the user clicks Confirm, the selected mapping and the checkbox
 * state are passed to the parent via onSubmit.
 */
const MappingModal = ({ columns, onSubmit, onCancel }) => {
  // columns: [{ column: 'Amt', bestMatch: 'Revenue', rating: 0.85 }, ...]
  const [mapping, setMapping] = useState(() => {
    const initial = {};
    columns.forEach(col => {
      // Initialise with the suggested bestMatch as the key if available
      if (col.bestMatch) {
        initial[col.bestMatch] = col.column;
      }
    });
    return initial;
  });
  const [saveTemplate, setSaveTemplate] = useState(false);

  const handleSelectChange = (systemField, userColumn) => {
    setMapping(prev => ({ ...prev, [systemField]: userColumn }));
  };

  const handleConfirm = () => {
    onSubmit(mapping, saveTemplate);
  };

  // Gather a unique list of system fields from suggestions for dropdown options
  const systemFields = Array.from(
    new Set(columns.flatMap(col => (col.bestMatch ? [col.bestMatch] : [])))
  );

  return (
    <div className="modal-backdrop" style={styles.backdrop}>
      <div className="modal" style={styles.modal}>
        <h3 style={styles.title}>Map Columns</h3>
        <div style={styles.content}>
          {columns.map((col, idx) => (
            <div key={idx} style={styles.row}>
              <span style={styles.colName}>{col.column}</span>
              <select
                value={Object.keys(mapping).find(key => mapping[key] === col.column) || ''}
                onChange={e => handleSelectChange(e.target.value, col.column)}
                style={styles.select}
              >
                <option value="">-- Select system field --</option>
                {systemFields.map(sf => (
                  <option key={sf} value={sf}>
                    {sf}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={saveTemplate}
            onChange={e => setSaveTemplate(e.target.checked)}
          />
          Save as reusable template
        </label>
        <div style={styles.actions}>
          <button onClick={onCancel} style={styles.btn}>Cancel</button>
          <button onClick={handleConfirm} style={{ ...styles.btn, ...styles.btnPrimary }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};



const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-primary)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '24px',
    width: '420px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(8px)',
  },
  title: { margin: 0, marginBottom: '16px', color: 'var(--text-primary)' },
  content: { marginBottom: '16px' },
  row: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  colName: { flex: '1 1 40%', color: 'var(--text-secondary)' },
  select: {
    flex: '1 1 60%',
    padding: '6px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: 'var(--text-primary)',
  },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  btn: {
    padding: '8px 16px',
    borderRadius: 'var(--border-radius-md)',
    border: 'none',
    cursor: 'pointer',
    background: 'var(--color-secondary-light)',
    color: 'var(--text-primary)',
  },
  btnPrimary: { background: 'var(--color-primary)', color: '#fff' },
};

export default MappingModal;
