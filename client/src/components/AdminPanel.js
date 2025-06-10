import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AdminPanel({ socket }) {
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    socket.on('pollCreated', ({ sessionCode, poll }) => {
      setPoll(poll);
    });

    socket.on('participantJoined', ({ participantsCount }) => {
      setParticipantsCount(participantsCount);
    });

    socket.on('participantLeft', ({ participantsCount }) => {
      setParticipantsCount(participantsCount);
    });

    socket.on('pollUpdate', ({ votes }) => {
      setPoll(prev => ({ ...prev, votes }));
    });

    return () => {
      socket.off('pollCreated');
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('pollUpdate');
    };
  }, [socket]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();
    if (question.trim() && options.every(opt => opt.trim())) {
      socket.emit('createPoll', {
        question: question.trim(),
        options: options.map(opt => opt.trim())
      });
    }
  };

  const chartData = poll ? {
    labels: poll.options,
    datasets: [
      {
        label: 'Votes',
        data: poll.votes,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Poll Results',
        color: 'white'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {!poll ? (
        <form onSubmit={handleCreatePoll} className="bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Create New Poll</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your question"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Options
            </label>
            {options.map((option, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full rounded-md bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              + Add Option
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Poll
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{poll.question}</h2>
            <div className="text-sm text-gray-300">
              Session Code: <span className="font-bold text-white">{poll.id}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-300">
              Participants: <span className="font-bold text-white">{participantsCount}</span>
            </div>
          </div>

          <div className="h-96">
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel; 