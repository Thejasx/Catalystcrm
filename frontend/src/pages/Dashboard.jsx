import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import SalesOverviewChart from '../components/SalesOverviewChart';
import RevenueUpdatesChart from '../components/RevenueUpdatesChart';
import YearlySalesChart from '../components/YearlySalesChart';
import ActiveUsersMap from '../components/ActiveUsersMap';
import PaymentGateways from '../components/PaymentGateways';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { authFetch, user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/reports/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.summary);
        setCharts(data.charts);
      }
    } catch (e) {
      console.error('Error fetching dashboard statistics', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
        <span style={styles.loaderText}>Assembling your metrics...</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header title="Dashboard" />

      {/* Sales Overview gradient banner */}
      <div style={styles.banner} className="glass-panel card-gradient-purple">
        <div>
          <h2 style={styles.bannerTitle}>Sales Distribution</h2>
          <p style={styles.bannerText}>Detailed sales trends, lead conversions, and staff performance metrics.</p>
        </div>
        <div style={styles.bannerMetric}>
          <div style={styles.bannerVal}>{stats?.totalSales || '0.00'}</div>
          <div style={styles.bannerLabel}>Total Sales Managed</div>
        </div>
      </div>

      {/* Numeric stats cards row */}
      <div style={styles.metricsRow}>
        {user?.role === 'admin' ? (
          <>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Total Leads"
                value={stats?.totalLeads || 0}
                change="+12.5%"
                isPositive={true}
                index={0}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Won Leads"
                value={stats?.wonLeads || 0}
                change="+5%"
                isPositive={true}
                index={1}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Target Income"
                value={stats?.targetIncome || '0.00'} 
                change="+8.3%"
                isPositive={true}
                index={2}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Monthly Profits"
                value={stats?.monthlyIncome || '0.00'} 
                change="-2.1%"
                isPositive={false}
                index={3}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Conversion Rate"
                value={`${stats?.conversionRate || 0}%`}
                change="+4.5%"
                isPositive={true}
                index={4}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Lead Payments Done"
                value={stats?.leadPaymentsDone || '0.00'}
                change="+0%"
                isPositive={true}
                index={5}
              />
            </div>
          </>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Won Leads"
                value={stats?.wonLeads || 0}
                change="+5%"
                isPositive={true}
                index={0}
              />
            </div>
            <div style={{ flex: 1 }}>
              <MetricCard
                title="Lead Payments Done"
                value={stats?.leadPaymentsDone || '0.00'}
                change="+0%"
                isPositive={true}
                index={1}
              />
            </div>
          </>
        )}
      </div>

      {/* Row of animated Charts */}
      <div className="dashboard-grid">
        <div className="col-4 glass-panel" style={styles.chartCard}>
          <SalesOverviewChart chartData={charts?.salesOverview} />
        </div>
        <div className="col-4 glass-panel" style={styles.chartCard}>
          <RevenueUpdatesChart chartData={charts?.revenueUpdates} />
        </div>
        <div className="col-4 glass-panel" style={styles.chartCard}>
          <YearlySalesChart chartData={charts?.yearlySales} />
        </div>
      </div>

      {/* Row of vector map and payment gateways */}
      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="col-8 glass-panel" style={styles.widgetCard}>
          <ActiveUsersMap />
        </div>
        <div className="col-4 glass-panel" style={styles.widgetCard}>
          <PaymentGateways />
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
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80vh',
    width: '100%',
    gap: '16px',
  },
  loaderText: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  banner: {
    padding: '24px 32px',
    borderRadius: 'var(--border-radius-lg)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    border: 'none',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  bannerText: {
    fontSize: '14px',
    opacity: 0.85,
  },
  bannerMetric: {
    textAlign: 'right',
  },
  bannerVal: {
    fontSize: '28px',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
  },
  bannerLabel: {
    fontSize: '11px',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
    marginTop: '2px',
  },
  metricsRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  chartCard: {
    backgroundColor: 'white',
    height: '240px',
  },
  widgetCard: {
    backgroundColor: 'white',
    minHeight: '380px',
  }
};

export default Dashboard;
