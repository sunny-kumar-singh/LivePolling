const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Poll = require('../models/Poll');


const generateSessionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};


router.get('/stats', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id });
    
    const stats = {
      totalPolls: polls.length,
      totalVotes: polls.reduce((sum, poll) => sum + poll.votes.reduce((a, b) => a + b, 0), 0),
      activeVoters: polls.reduce((sum, poll) => {
        const pollVoters = poll.votes.reduce((a, b) => a + b, 0);
        return sum + (pollVoters > 0 ? 1 : 0);
      }, 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { question, options } = req.body;

  
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least two options are required' });
    }

    const sessionCode = generateSessionCode();
    const votes = new Array(options.length).fill(0);

    const poll = new Poll({
      question,
      options,
      votes,
      createdBy: req.user._id,
      sessionCode
    });

    await poll.save();

    res.status(201).json({
      message: 'Poll created successfully',
      poll,
      sessionCode
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(400).json({ error: error.message });
  }
});


router.get('/my-polls', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:sessionCode', async (req, res) => {
  try {
    const poll = await Poll.findOne({ sessionCode: req.params.sessionCode });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/:sessionCode/vote', async (req, res) => {
  try {
    const { sessionCode } = req.params;
    const { optionIndex, username } = req.body;

    if (optionIndex === undefined || !username) {
      return res.status(400).json({ error: 'Option index and username are required' });
    }

    let poll = await Poll.findOne({ sessionCode });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    
    const hasVoted = poll.voters.some(voter => voter.username === username);
    if (hasVoted) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option selected' });
    }

    try {
     
      poll.incrementVote(optionIndex);
      poll.voters.push({ username });
      poll = await poll.save();

      if (!poll) {
        throw new Error('Failed to save poll');
      }

      return res.json({ 
        message: 'Vote recorded successfully',
        poll: {
          question: poll.question,
          options: poll.options,
          votes: poll.votes,
          voters: poll.voters
        }
      });
    } catch (saveError) {
      console.error('Save error:', saveError);
      return res.status(500).json({ error: 'Failed to save vote' });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return res.status(500).json({ error: 'Failed to record vote' });
  }
});


router.get('/', auth, async (req, res) => {
  try {
    const polls = await Poll.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'username');

    res.json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    }).populate('createdBy', 'username');

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(poll);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findOne({
      _id: req.params.id,
      status: 'active',
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found or not active' });
    }

    if (poll.endDate && new Date(poll.endDate) < new Date()) {
      poll.status = 'ended';
      await poll.save();
      return res.status(400).json({ error: 'Poll has ended' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    
    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    await poll.save();

    res.json(poll);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/:id/end', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    poll.status = 'ended';
    await poll.save();

    res.json(poll);
  } catch (error) {
    console.error('End poll error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/:sessionCode/current', async (req, res) => {
  try {
    const poll = await Poll.findOne({ 
      sessionCode: req.params.sessionCode,
      status: 'active'
    });

    if (!poll) {
      return res.status(404).json({ error: 'Active poll not found' });
    }

   
    const currentQuestionData = {
      question: poll.question,
      options: poll.options,
      votes: poll.votes,
      totalVotes: poll.totalVotes,
      status: poll.status,
      endDate: poll.endDate
    };

    res.json(currentQuestionData);
  } catch (error) {
    console.error('Get current question error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;