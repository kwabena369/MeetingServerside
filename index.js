const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Apply middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://scheduling-platform.vercel.app', // Allow requests from this origin
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  credentials: true
}));

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
  // In a real application, you would check for conflicts here
  return true;
};

// Create a new meeting
app.post('/meetings', (req, res) => {
  const meeting = { ...req.body, id: meetings.length + 1 };
  meetings.push(meeting);
  console.log('Meeting scheduled:', meeting);
  res.status(201).json(meeting);
});

// Fetch available time slots for a user
app.get('/users/:userId/available-slots', (req, res) => {
  const { userId } = req.params;
  const user = users.find((u) => u.userId === parseInt(userId));
  if (user) {
    res.json(user.availableSlots);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Fetch all meetings
app.get('/meetings', (req, res) => {
  res.json(meetings);
});

// Update an existing meeting (reschedule)
app.put('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const updatedDetails = req.body;

  // Basic validation
  if (!updatedDetails.date || !updatedDetails.time) {
    return res.status(400).json({ error: 'Missing required fields for rescheduling' });
  }

  const meetingIndex = meetings.findIndex((meeting) => meeting.id === parseInt(meetingId));
  if (meetingIndex === -1) {
    return res.status(404).json({ error: 'Meeting not found' });
  }

  // Update the meeting details
  meetings[meetingIndex] = { ...meetings[meetingIndex], ...updatedDetails };
  console.log('Meeting rescheduled:', meetings[meetingIndex]);
  res.json(meetings[meetingIndex]);
});

// Cancel a meeting
app.delete('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  meetings = meetings.filter((meeting) => meeting.id !== parseInt(meetingId));
  console.log('Meeting canceled:', meetingId);
  res.status(204).end();
});

// Test endpoint
app.get('/test', (req, res) => {
  res.send('<h1>Testing</h1><p>The backend is working correctly.</p>');
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
  console.log('CORS configured for: https://scheduling-platform.vercel.app');
});

module.exports = app;