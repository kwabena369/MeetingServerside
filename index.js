const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let users = [
  {
    userId: 1,
    name: 'Freelancer A',
    availableSlots: [
      { date: '2025-01-03', time: '09:00', duration: 30 },
      { date: '2025-01-03', time: '14:00', duration: 20 },
    ],
  },
  {
    userId: 2,
    name: 'Client B',
    availableSlots: [
      { date: '2025-01-03', time: '10:00', duration: 30 },
      { date: '2025-01-03', time: '15:00', duration: 60 },
    ],
  },
];

let meetings = [];

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

// Update an existing meeting (reschedule)
app.put('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const updatedMeeting = req.body;
  meetings = meetings.map((meeting) =>
    meeting.id === parseInt(meetingId) ? { ...meeting, ...updatedMeeting } : meeting
  );
  console.log('Meeting rescheduled:', updatedMeeting);
  res.json(updatedMeeting);
});

// Cancel a meeting
app.delete('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  meetings = meetings.filter((meeting) => meeting.id !== parseInt(meetingId));
  console.log('Meeting canceled:', meetingId);
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});