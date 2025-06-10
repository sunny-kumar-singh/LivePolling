const activePolls = new Map();
const sessions = new Map();

const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("createPoll", (pollData) => {
      const sessionCode = generateSessionCode();
      const poll = {
        id: sessionCode,
        question: pollData.question,
        options: pollData.options,
        votes: new Array(pollData.options.length).fill(0),
        participants: new Set(),
        createdBy: socket.id,
      };

      activePolls.set(sessionCode, poll);
      sessions.set(socket.id, sessionCode);

      socket.join(sessionCode);
      socket.emit("pollCreated", { sessionCode, poll });
    });

    socket.on("joinPoll", (sessionCode) => {
      const poll = activePolls.get(sessionCode);
      if (poll) {
        socket.join(sessionCode);
        sessions.set(socket.id, sessionCode);
        poll.participants.add(socket.id);
        socket.emit("pollJoined", { poll });
        io.to(sessionCode).emit("participantJoined", {
          participantsCount: poll.participants.size,
        });
      } else {
        socket.emit("error", { message: "Invalid session code" });
      }
    });

    socket.on("submitVote", ({ sessionCode, optionIndex }) => {
      const poll = activePolls.get(sessionCode);
      if (poll && poll.participants.has(socket.id)) {
        poll.votes[optionIndex]++;
        io.to(sessionCode).emit("pollUpdate", { votes: poll.votes });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      const sessionCode = sessions.get(socket.id);
      if (sessionCode) {
        const poll = activePolls.get(sessionCode);
        if (poll) {
          poll.participants.delete(socket.id);
          if (poll.participants.size === 0) {
            activePolls.delete(sessionCode);
          } else {
            io.to(sessionCode).emit("participantLeft", {
              participantsCount: poll.participants.size,
            });
          }
        }
        sessions.delete(socket.id);
      }
    });
  });
};

module.exports = setupSocketHandlers;
