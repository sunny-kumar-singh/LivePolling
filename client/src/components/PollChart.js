import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PollChart = ({ sessionCode }) => {
  const [pollData, setPollData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/polls/${sessionCode}/current`);
        setPollData(response.data);
        console.log(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch poll data');
        console.error('Error fetching poll data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionCode) {
      fetchPollData();
    }
  }, [sessionCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!pollData) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
        <p className="font-medium">No poll data available</p>
      </div>
    );
  }

  const chartData = {
    labels: pollData.options,
    datasets: [
      {
        label: 'Votes',
        data: pollData.votes,
        backgroundColor: [
          'linear-gradient(180deg, rgba(34, 90, 227, 0.8) 0%, rgba(34, 90, 227, 0.6) 100%)',
          'linear-gradient(180deg, rgba(34, 90, 227, 0.7) 0%, rgba(34, 90, 227, 0.5) 100%)',
          'linear-gradient(180deg, rgba(34, 90, 227, 0.6) 0%, rgba(34, 90, 227, 0.4) 100%)',
          'linear-gradient(180deg, rgba(34, 90, 227, 0.5) 0%, rgba(34, 90, 227, 0.3) 100%)',
          'linear-gradient(180deg, rgba(34, 90, 227, 0.4) 0%, rgba(34, 90, 227, 0.2) 100%)',
          'linear-gradient(180deg, rgba(34, 90, 227, 0.3) 0%, rgba(34, 90, 227, 0.1) 100%)',
        ],
        borderColor: [
          'rgba(34, 90, 227, 1)',
          'rgba(34, 90, 227, 0.8)',
          'rgba(34, 90, 227, 0.6)',
          'rgba(34, 90, 227, 0.4)',
          'rgba(34, 90, 227, 0.2)',
          'rgba(34, 90, 227, 0.1)',
        ],
        borderWidth: 2,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0
        },
        barThickness: 45,
        maxBarThickness: 50,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      onProgress: function(animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((bar, index) => {
          const value = dataset.data[index];
          const total = dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.font = 'bold 12px Inter';
          ctx.fillStyle = '#225ae3';
          ctx.fillText(`${percentage}%`, bar.x, bar.y - 5);
          ctx.restore();
        });
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: pollData.question,
        font: {
          size: 20,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 20,
          bottom: 30,
        },
        color: '#225ae3',
      },
      tooltip: {
        backgroundColor: 'rgba(34, 90, 227, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(34, 90, 227, 0.3)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.raw} votes (${percentage}%)`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(34, 90, 227, 0.1)',
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#225ae3',
          padding: 10,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          color: '#225ae3',
          padding: 10,
        },
      },
    },
    layout: {
      padding: {
        top: 30,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  };

  const totalVotes = pollData.votes.reduce((sum, vote) => sum + vote, 0);

  return (
    <div className="poll-chart bg-white rounded-lg p-6">
      <div style={{ height: '400px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Total Votes</p>
          <p className="text-2xl font-bold text-blue-700">{totalVotes}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Status</p>
          <p className="text-2xl font-bold text-green-700 capitalize">{pollData.status}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600 font-medium">SessionCode</p>
          <p className="text-2xl font-bold text-indigo-700 capitalize">{sessionCode}</p>
        </div>
        {pollData.endDate && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">End Date</p>
            <p className="text-2xl font-bold text-purple-700">
              {new Date(pollData.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollChart; 