import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueUpdatesChart = ({ chartData }) => {
  const data = {
    labels: chartData?.categories || [],
    datasets: [
      {
        label: 'Monthly Sales (₹)',
        data: chartData?.data || [],
        backgroundColor: 'rgba(79, 70, 229, 0.85)',
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 32,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#94a3b8'
        }
      },
      y: {
        grid: {
          color: '#f1f5f9',
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11
          },
          color: '#94a3b8',
          callback: (value) => `₹${value / 1000}k`
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Revenue Updates</h3>
      <div style={styles.chartWrapper}>
        <Bar data={data} options={options} />
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
  }
};

export default RevenueUpdatesChart;
