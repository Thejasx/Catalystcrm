import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const YearlySalesChart = ({ chartData }) => {
  const data = {
    labels: chartData?.categories || ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    datasets: [
      {
        label: 'Current Year (2026)',
        data: chartData?.currentYear || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(79, 70, 229, 0.85)',
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'var(--color-primary)',
        borderWidth: 3,
      },
      {
        label: 'Last Year (2025)',
        data: chartData?.lastYear || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgba(14, 165, 233, 0.5)',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'var(--color-secondary)',
        borderWidth: 2,
        borderDash: [5, 5],
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
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
      <h3 style={styles.title}>Yearly Sales</h3>
      <div style={styles.chartWrapper}>
        <Line data={data} options={options} />
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

export default YearlySalesChart;
