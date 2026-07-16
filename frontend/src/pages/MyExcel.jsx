import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import ExcelCard from '../components/ExcelCard';
import MappingModal from '../components/MappingModal';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles } from 'lucide-react';


// Card definitions
const cards = [
  {
    id: 'accounting',
    title: 'Accounting',
    description: 'P&L tracking, Ledger balancing, Tax/GST',
    icon: Sparkles,
  },
  {
    id: 'hygiene',
    title: 'Data Hygiene',
    description: 'Multi‑column sorting, deduplication',
    icon: Sparkles,
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Interactive Bar, Line, Donut charts',
    icon: Sparkles,
  },
];

const MyExcel = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [file, setFile] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [showMapping, setShowMapping] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length > 0) {
      if (!selectedCard) {
        alert('Please select an operation (Accounting, Hygiene, or Analytics) before uploading a file.');
        return;
      }
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      // Directly call AI analysis endpoint
      analyzeSheet(uploadedFile);
    }
  };

  // Call AI analysis endpoint after file is uploaded
  const analyzeSheet = async (file) => {
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('operation', selectedCard.id);
    try {
      const res = await axios.post('/api/my-excel/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert('AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'text/csv': [] } });

  const detectHeaders = async (file) => {
    if (!selectedCard) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('operation', selectedCard.id);
    try {
      const res = await axios.post('/api/my-excel/detect', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMapping(res.data.columns); // array of { userColumn, suggestions: [] }
      setShowMapping(true);
    } catch (e) {
      console.error(e);
      alert('Failed to detect headers');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingSubmit = async (finalMapping, saveTemplate) => {
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('operation', selectedCard.id);
    form.append('mapping', JSON.stringify(finalMapping));
    if (saveTemplate) form.append('saveTemplate', 'true');
    try {
      const res = await axios.post('/api/my-excel/process', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
    } catch (e) {
      console.error(e);
      alert('Processing failed');
    } finally {
      setLoading(false);
      setShowMapping(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    if (selectedCard.id === 'analytics') {
      const { summary, charts } = result; // charts: {type, data}
      return (
        <div style={{ marginTop: 20 }}>
          <h3>Analytics Summary</h3>
          <pre>{JSON.stringify(summary, null, 2)}</pre>
          {charts.map((c, idx) => (
            <ResponsiveContainer width='100%' height={300} key={idx}>
              {c.type === 'bar' && (
                <BarChart data={c.data}>
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='value' fill='var(--color-primary)' />
                </BarChart>
              )}
              {c.type === 'line' && (
                <LineChart data={c.data}>
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type='monotone' dataKey='value' stroke='var(--color-primary)' />
                </LineChart>
              )}
              {c.type === 'pie' && (
                <PieChart>
                  <Pie data={c.data} dataKey='value' nameKey='name' outerRadius={80} label>
                    {c.data.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          ))}
        </div>
      );
    }
    // For accounting/hygiene, result contains downloadUrl
    return (
      <div style={{ marginTop: 20 }}>
        <a href={result.downloadUrl} download="processed.xlsx" className="download-btn">
          Download Processed File
        </a>
      </div>
    );
  };

    // Lock whole page UI
    const pageLocked = true;
    const [underDev, setUnderDev] = useState(false);
    const handleOverlayClick = () => setUnderDev(true);
    return (
      <div className="my-excel-page" style={{ padding: 24, position: 'relative', pointerEvents: 'auto', opacity: pageLocked ? 0.6 : 1 }}>
        {pageLocked && (
          <div onClick={handleOverlayClick} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 10,
            cursor: 'pointer',
          }}>
            <Lock size={64} color="white" />
          </div>
        )}
        {underDev && (
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '8px',
            zIndex: 20,
          }}>
            MyExcel is under development
          </div>
        ) }
      <h2>My Excel</h2>
        <div style={{ position: 'relative' }}>
          <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24, pointerEvents: 'none', opacity: 0.6 }}>
            {cards.map(card => (
              <ExcelCard
                key={card.id}
                title={card.title}
                description={card.description}
                Icon={() => (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <card.icon size={24} />
                    <Lock size={12} style={{ position: 'absolute', top: 0, right: 0, color: 'var(--color-primary)' }} />
                  </div>
                )}
                selected={selectedCard?.id === card.id}
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>
        </div>
      {selectedCard && (
        <div {...getRootProps()} style={{ border: '2px dashed var(--color-primary)', padding: 40, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--bg-hover)' : 'transparent' }}>
          <input {...getInputProps()} />
          {isDragActive ? <p>Drop the file here …</p> : <p>Drag &amp; drop an .xlsx or .csv file here, or click to select.</p>}
        </div>
      )}
      {loading && <p>Loading…</p>}
      {showMapping && (
        <MappingModal
          columns={mapping}
          onSubmit={handleMappingSubmit}
          onCancel={() => setShowMapping(false)}
        />
      )}
      {renderResult()}
    </div>
  );
};

export default MyExcel;
