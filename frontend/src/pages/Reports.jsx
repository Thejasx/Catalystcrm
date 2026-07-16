import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SalesOverviewChart from '../components/SalesOverviewChart';
import RevenueUpdatesChart from '../components/RevenueUpdatesChart';
import YearlySalesChart from '../components/YearlySalesChart';
import { BarChart3, TrendingUp, Award, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const { authFetch, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchStats();
    }
  }, [authLoading]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/reports/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.summary);
        setCharts(data.charts);
      }
    } catch (e) {
      console.error('Error loading report analytics', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Analytics & Reports" />

      {/* Analytics highlights */}
      <div style={styles.metricsSummary}>
        <div style={styles.summaryCard} className="glass-panel">
          <div style={styles.iconBox}><TrendingUp size={20} color="var(--color-primary)" /></div>
          <div>
            <h4 style={styles.cardVal}>{stats?.conversionRate || 0}%</h4>
            <span style={styles.cardLabel}>Average Conversion Rate</span>
          </div>
        </div>

        <div style={styles.summaryCard} className="glass-panel">
          <div style={styles.iconBox}><Award size={20} color="var(--color-warning)" /></div>
          <div>
            <h4 style={styles.cardVal}>{stats?.wonLeads || 0}</h4>
            <span style={styles.cardLabel}>Deals Closed Won</span>
          </div>
        </div>

        <div style={styles.summaryCard} className="glass-panel">
          <div style={styles.iconBox}><CheckCircle2 size={20} color="var(--color-success)" /></div>
          <div>
            <h4 style={styles.cardVal}>{stats?.totalSales || '0.00'}</h4>
            <span style={styles.cardLabel}>Pipeline Gross Worth</span>
          </div>
        </div>
        {/* Additional Financial Cards */}
        <div style={styles.summaryCard} className="glass-panel">
          <div style={styles.iconBox}><BarChart3 size={20} color="var(--color-success)" /></div>
          <div>
            <h4 style={styles.cardVal}>{stats?.totalProfit || '0.00'}</h4>
            <span style={styles.cardLabel}>Total Profit</span>
          </div>
        </div>
        <div style={styles.summaryCard} className="glass-panel">
          <div style={styles.iconBox}><TrendingUp size={20} color="var(--color-primary)" /></div>
          <div>
            <h4 style={styles.cardVal}>{stats?.monthlyProfit || '0.00'}</h4>
            <span style={styles.cardLabel}>Monthly Profit</span>
          </div>
        </div>
      </div>

      {/* Main visual panel layout */}
      <div className="dashboard-grid">
        <div className="col-8 glass-panel" style={styles.chartPanel}>
          <YearlySalesChart chartData={charts?.yearlySales} />
        </div>
        <div className="col-4 glass-panel" style={styles.chartPanel}>
          <SalesOverviewChart chartData={charts?.salesOverview} />
        </div>
      </div>

      {/* Staff Performance Table */}
      <div style={styles.tablePanel} className="glass-panel">
        <div style={styles.tableHeader}>
          <BarChart3 size={18} color="var(--color-primary)" />
          <h3 style={styles.tableTitle}>Staff Performance Report</h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Agent Username</th>
                <th>Managed Leads</th>
                <th>Won Deals</th>
                <th>Conversion efficiency</th>
                <th>Performance Rating</th>
              </tr>
            </thead>
            <tbody>
              {charts?.staffPerformance?.map((staff, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600' }}>{staff.name}</td>
                  <td>{staff.managed}</td>
                  <td>{staff.converted}</td>
                  <td>
                    <div style={styles.progressBarWrapper}>
                      <span style={{ minWidth: '40px' }}>{staff.efficiency}%</span>
                      <div style={styles.progressBarBg}>
                        <div style={{
                          ...styles.progressBarFill,
                          width: `${staff.efficiency}%`
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      ...styles.ratingBadge,
                      backgroundColor: staff.efficiency >= 50 ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                      color: staff.efficiency >= 50 ? 'var(--color-success)' : 'var(--color-warning)',
                    }}>
                      {staff.efficiency >= 50 ? 'Excellent' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  metricsSummary: {
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: 'white',
    minWidth: '220px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardVal: {
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'var(--font-title)',
  },
  cardLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  chartPanel: {
    backgroundColor: 'white',
    height: '280px',
  },
  tablePanel: {
    marginTop: '24px',
    backgroundColor: 'white',
    padding: '24px',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
  },
  progressBarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '180px',
  },
  progressBarBg: {
    flex: 1,
    height: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--color-primary)',
    borderRadius: '3px',
  },
  ratingBadge: {
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '10px',
  }
};

export default Reports;
