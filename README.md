# Meeting Scheduling API Documentation

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Create Meeting
Create a new meeting between users.

- **URL**: `/meetings`
- **Method**: `POST`
- **Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "date": "string", // Format: YYYY-MM-DD
  "time": "string", // Format: HH:mm
  "duration": "number", // in minutes
  "participants": "string"
}
```
- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
```json
{
  "id": 1,
  "title": "Project Discussion",
  "description": "Initial project planning meeting",
  "date": "2025-01-03",
  "time": "09:00",
  "duration": 30,
  "participants": "Freelancer A, Client B"
}
```

### 2. Get Available Time Slots
Retrieve available time slots for a specific user.

- **URL**: `/users/:userId/available-slots`
- **Method**: `GET`
- **URL Params**: 
  - Required: `userId=[integer]`
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
```json
[
  {
    "date": "2025-01-03",
    "time": "09:00",
    "duration": 30
  },
  {
    "date": "2025-01-03",
    "time": "14:00",
    "duration": 20
  }
]
```
- **Error Response**:
  - **Code**: 404 Not Found
  - **Content**: `{ "error": "User not found" }`

### 3. Update Meeting (Reschedule)
Update an existing meeting's details.

- **URL**: `/meetings/:meetingId`
- **Method**: `PUT`
- **URL Params**:
  - Required: `meetingId=[integer]`
- **Request Body**:
```json
{
  "title": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "duration": "number",
  "participants": "string"
}
```
- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Updated meeting object

### 4. Cancel Meeting
Cancel an existing meeting.

- **URL**: `/meetings/:meetingId`
- **Method**: `DELETE`
- **URL Params**:
  - Required: `meetingId=[integer]`
- **Success Response**:
  - **Code**: 204 No Content

## Data Models

### Meeting Object
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "duration": "number",
  "participants": "string"
}
```

### User Object
```json
{
  "userId": "number",
  "name": "string",
  "availableSlots": [
    {
      "date": "string",
      "time": "string",
      "duration": "number"
    }
  ]
}
```

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 5000 by default. You can modify the port by setting the `PORT` environment variable.

## CORS
The API has CORS enabled and accepts requests from all origins in this development version.

## Error Handling
The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
Currently, there is no rate limiting implemented in this development version.