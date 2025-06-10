const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  votes: {
    type: [Number],
    default: function() {
      const arr = new Array(this.options.length).fill(0);
      return Array.from(arr, x => Number(x));
    }
  },
  sessionCode: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  voters: [{
    username: {
      type: String,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove the pre-save middleware as we're handling initialization in the default function
pollSchema.index({ createdBy: 1, status: 1 });
pollSchema.index({ status: 1, isPublic: 1 });

// Add method to safely increment vote
pollSchema.methods.incrementVote = function(optionIndex) {
  if (!Array.isArray(this.votes)) {
    this.votes = new Array(this.options.length).fill(0);
  }
  if (this.votes.length !== this.options.length) {
    this.votes = new Array(this.options.length).fill(0);
  }

  this.votes[optionIndex] = Number(this.votes[optionIndex] || 0) + 1;
  return true;
};


const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;