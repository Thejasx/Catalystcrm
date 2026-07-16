import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesOverviewChart = ({ chartData }) => {
  const data = {
    labels: chartData?.labels || ['New', 'Follow-up', 'Qualified', 'Won', 'Lost'],
    datasets: [
      {
        label: '# of Leads',
        data: chartData?.data || [0, 0, 0, 0, 0],
        backgroundColor: [
          '#3b82f6', // Info/Blue (New)
          '#f59e0b', // Warning/Yellow (Follow-up)
          '#a855f7', // Purple (Qualified)
          '#10b981', // Success/Green (Won)
          '#ef4444', // Error/Red (Lost)
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter',
            size: 11
          },
          usePointStyle: true,
          boxWidth: 6,
        }
      },
    },
    cutout: '65%',
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Sales Overview</h3>
      <div style={styles.chartWrapper}>
        <Doughnut data={data} options={options} />
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
  chartWrapper: {
    position: 'relative',
    height: '180px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

export default SalesOverviewChart;
