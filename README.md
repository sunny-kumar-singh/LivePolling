# LivePolling

A real-time polling application that allows users to create and participate in live polls with instant results.

## Features

- Real-time poll updates using Socket.IO
- User authentication
- Create and manage polls
- Join polls using session codes
- Live vote tracking
- Poll statistics and analytics

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js ,JWT Authentication
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository
```bash
git clone [repository-url]
cd LivePolling
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Setup
Create `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/LivePolling
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

4. Start the application
```bash
# Start server (from server directory)
npm start

# Start client (from client directory)
npm start
```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Poll Routes
- `POST /api/polls` - Create new poll
- `GET /api/polls` - Get all polls
- `GET /api/polls/my-polls` - Get user's polls
- `GET /api/polls/:sessionCode` - Get poll by session code
- `POST /api/polls/:sessionCode/vote` - Submit vote

## Socket Events

- `createPoll` - Create a new poll session
- `joinPoll` - Join an existing poll
- `submitVote` - Submit vote for a poll
- `pollUpdate` - Receive real-time poll updates

