import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function UserPanel() {
  const { sessionCode } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/polls/${sessionCode}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch poll');
        }

        setPoll(data);
        // Check if user has already voted
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
        if (votedPolls[sessionCode]) {
          setHasVoted(true);
          setShowNameInput(false);
          // Restore username if previously voted
          const savedUsername = localStorage.getItem(`poll_${sessionCode}_username`);
          if (savedUsername) {
            setUsername(savedUsername);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [sessionCode]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    setShowNameInput(false);
    // Store username in localStorage
    localStorage.setItem(`poll_${sessionCode}_username`, username);
  };

  const handleVote = async (optionIndex) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${sessionCode}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          optionIndex,
          username: localStorage.getItem(`poll_${sessionCode}_username`)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setPoll(data.poll);
      setHasVoted(true);
      
      // Mark this poll as voted in localStorage
      const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '{}');
      votedPolls[sessionCode] = true;
      localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    } catch (err) {
      setError(err.message);
    }
  };

  const chartData = poll ? {
    labels: poll.options,
    datasets: [
      {
        label: 'Votes',
        data: poll.votes,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(99, 102, 241, 0.7)'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Poll Results',
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-indigo-600 font-medium">Loading poll...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-red-600 mb-6 text-center font-medium">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-gray-600 mb-6 text-center font-medium">Poll not found</div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg mb-28 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Join Poll</h2>
          <form onSubmit={handleJoin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
               Enter Your Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter your name"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Join Poll
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{poll.question}</h2>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
              Session Code: <span className="font-bold">{sessionCode}</span>
            </div>
          </div>

          {!hasVoted ? (
            <div className="space-y-4 mb-8">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors font-medium text-gray-700"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium mb-6">
                Thank you for voting!
              </div>
              <div className="h-96 bg-gray-50 p-4 rounded-lg">
                {chartData && <Bar data={chartData} options={chartOptions} />}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 text-gray-100 py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPanel; 