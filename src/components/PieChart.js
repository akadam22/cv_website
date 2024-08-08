// src/components/PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register the required Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const PieChart = ({ data }) => {
  // Construct chart data
  const chartData = {
    labels: ['Total Jobs', 'Total Users', 'Total Admins', 'Total Recruiters', 'Total Jobs Posted'],
    datasets: [
      {
        data: [
          data.total_jobs,
          data.total_users,
          data.total_admins,
          data.total_recruiters,
          data.total_jobs_posted
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5722', '#9C27B0'],
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', width: '300px', margin: '0 auto' }}>
      <h2 style={{ color: '#5f7dad', textAlign: 'center', marginBottom: '20px' }}>Dashboard Statistics</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
