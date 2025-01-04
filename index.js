const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// CORS configuration
const corsOptions = {
  origin: [
    'https://scheduling-platform.vercel.app',  // Production frontend
    'http://localhost:5173',                   // Development frontend
    'http://localhost:3000'                    // Alternative local development port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Mock data for users
let users = [
  {
    userId: 1,
    name: 'Freelancer A',
    email: 'freelancer.a@example.com',
    role: 'freelancer',
    availableSlots: [
      { date: '2025-01-03', time: '09:00', duration: 30 },
      { date: '2025-01-03', time: '14:00', duration: 60 },
      { date: '2025-01-04', time: '10:00', duration: 45 },
      { date: '2025-01-04', time: '15:30', duration: 30 },
    ],
  },
  {
    userId: 2,
    name: 'Client B',
    email: 'client.b@example.com',
    role: 'client',
    availableSlots: [
      { date: '2025-01-03', time: '10:00', duration: 30 },
      { date: '2025-01-03', time: '15:00', duration: 60 },
      { date: '2025-01-04', time: '11:00', duration: 45 },
      { date: '2025-01-04', time: '16:00', duration: 30 },
    ],
  },
];

// Mock data for meetings
let meetings = [
  {
    id: 1,
    title: "Project Discussion",
    description: "Discuss project requirements and timeline",
    date: "2025-01-03",
    time: "10:00",
    duration: 30,
    participants: [
      { id: 1, name: "Freelancer A", role: "freelancer" },
      { id: 2, name: "Client B", role: "client" }
    ],
    status: "scheduled"
  },
  {
    id: 2,
    title: "Design Review Meeting",
    description: "Review initial design mockups",
    date: "2025-01-03",
    time: "14:00",
    duration: 60,
    participants: [
      { id: 1, name: "Freelancer A", role: "freelancer" },
      { id: 2, name: "Client B", role: "client" }
    ],
    status: "scheduled"
  }
];

// Helper function to validate meeting time slots
const isTimeSlotAvailable = (date, time, duration, participants) => {
  // Check if the time slot conflicts with existing meetings
  const conflictingMeeting = meetings.find(meeting => {
    if (meeting.date === date) {
      const meetingStart = new Date(`${date}T${meeting.time}`);
      const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
      const newStart = new Date(`${date}T${time}`);
      const newEnd = new Date(newStart.getTime() + duration * 60000);

      return (newStart < meetingEnd && newEnd > meetingStart);
    }
    return false;
  });

  return !conflictingMeeting;
};

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// GET all meetings
app.get('/meetings', (req, res) => {
  res.json(meetings);
});

// GET a specific meeting
app.get('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const meeting = meetings.find(m => m.id === parseInt(meetingId));
  
  if (meeting) {
    res.json(meeting);
  } else {
    res.status(404).json({ error: 'Meeting not found' });
  }
});

// Create a new meeting
app.post('/meetings', (req, res) => {
  const { title, description, date, time, duration, participants } = req.body;

  // Basic validation
  if (!title || !date || !time || !duration || !participants) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if time slot is available
  if (!isTimeSlotAvailable(date, time, duration, participants)) {
    return res.status(409).json({ error: 'Time slot is not available' });
  }

  const newMeeting = {
    id: meetings.length + 1,
    title,
    description,
    date,
    time,
    duration,
    participants,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  meetings.push(newMeeting);
  console.log('Meeting scheduled:', newMeeting);
  res.status(201).json(newMeeting);
});

// Update a meeting
app.put('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const updatedDetails = req.body;
  
  if (!updatedDetails.date || !updatedDetails.time) {
    return res.status(400).json({ error: 'Missing required fields for rescheduling' });
  }

  const meetingIndex = meetings.findIndex(m => m.id === parseInt(meetingId));
  
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  if (!isTimeSlotAvailable(updatedDetails.date, updatedDetails.time, updatedDetails.duration || meetings[meetingIndex].duration, meetings[meetingIndex].participants)) {
    return res.status(409).json({ error: 'New time slot is not available' });
  }

  meetings[meetingIndex] = {
    ...meetings[meetingIndex],
    ...updatedDetails,
    updatedAt: new Date().toISOString()
  };

  console.log('Meeting updated:', meetings[meetingIndex]);
  res.json(meetings[meetingIndex]);
});

// Cancel a meeting
app.delete('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const meetingIndex = meetings.findIndex(m => m.id === parseInt(meetingId));
  
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  const canceledMeeting = meetings[meetingIndex];
  meetings = meetings.filter((meeting) => meeting.id !== parseInt(meetingId));
  
  console.log('Meeting canceled:', meetingId);
  res.status(200).json({ message: 'Meeting canceled successfully', meeting: canceledMeeting });
});

// GET user's available slots
app.get('/users/:userId/available-slots', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.userId === parseInt(userId));
  
  if (user) {
    res.json(user.availableSlots);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET user details
app.get('/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = users.find(u => u.userId === parseInt(userId));
  
  if (user) {
    const { password, ...safeUserData } = user;
    res.json(safeUserData);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Allowed origins:', corsOptions.origin);
});

module.exports = app;