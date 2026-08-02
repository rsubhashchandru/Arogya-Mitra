# This file outlines the complete API endpoints for Arogya Mitra

## Base URL
Development: http://localhost:5000/api
Production: https://api.aroyamitra.com/api

## Authentication Header
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👤 User Endpoints

### 1. Register User
**POST** `/users/register`

Request Body:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "role": "patient" or "doctor" (optional, defaults to "patient")
}
```

Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "patient"
  }
}
```

---

### 2. Login User
**POST** `/users/login`

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "patient"
  }
}
```

---

### 3. Get User Profile
**GET** `/users/profile` (Protected)

Response (200):
```json
{
  "success": true,
  "user": {
    "_id": "USER_ID",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": "date",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  }
}
```

---

### 4. Update User Profile
**PUT** `/users/profile` (Protected)

Request Body (all fields optional):
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "dateOfBirth": "date",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

## 👨‍⚕️ Doctor Endpoints

### 1. Get All Doctors
**GET** `/doctors`

Query Parameters:
- `specialization` (optional): filter by specialization
- `city` (optional): filter by city
- `page` (optional, default: 1): pagination
- `limit` (optional, default: 10): items per page

Response (200):
```json
{
  "success": true,
  "doctors": [
    {
      "_id": "DOCTOR_ID",
      "userId": {
        "_id": "USER_ID",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "profilePicture": "string"
      },
      "specialization": "string",
      "experience": "number",
      "consultationFee": "number",
      "rating": "number",
      "totalReviews": "number"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

---

### 2. Get Doctor by ID
**GET** `/doctors/:id`

Response (200):
```json
{
  "success": true,
  "doctor": { /* doctor object with full details */ }
}
```

---

### 3. Create Doctor Profile
**POST** `/doctors` (Protected)

Request Body:
```json
{
  "specialization": "string",
  "qualification": ["string"],
  "experience": "number",
  "licenseNumber": "string",
  "clinic": {
    "name": "string",
    "address": "string",
    "phone": "string",
    "website": "string"
  },
  "consultationFee": "number",
  "availabilitySlots": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

Response (201):
```json
{
  "success": true,
  "message": "Doctor profile created successfully",
  "doctor": { /* created doctor object */ }
}
```

---

### 4. Update Doctor Profile
**PUT** `/doctors/:id` (Protected)

Request Body (all fields optional):
```json
{
  "specialization": "string",
  "qualification": ["string"],
  "experience": "number",
  "consultationFee": "number",
  "clinic": { /* clinic details */ },
  "availabilitySlots": [ /* slots */ ]
}
```

Response (200):
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "doctor": { /* updated doctor object */ }
}
```

---

## 📅 Appointment Endpoints

### 1. Create Appointment
**POST** `/appointments` (Protected)

Request Body:
```json
{
  "doctorId": "string",
  "appointmentDate": "date",
  "appointmentTime": "string (HH:MM format)",
  "reason": "string"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "APPOINTMENT_ID",
    "patientId": "PATIENT_ID",
    "doctorId": "DOCTOR_ID",
    "appointmentDate": "date",
    "appointmentTime": "string",
    "reason": "string",
    "status": "scheduled",
    "createdAt": "date"
  }
}
```

---

### 2. Get User Appointments
**GET** `/appointments` (Protected)

Response (200):
```json
{
  "success": true,
  "appointments": [
    {
      "_id": "APPOINTMENT_ID",
      "doctorId": {
        "_id": "DOCTOR_ID",
        "firstName": "string",
        "lastName": "string",
        "specialization": "string"
      },
      "appointmentDate": "date",
      "appointmentTime": "string",
      "status": "scheduled",
      "reason": "string"
    }
  ]
}
```

---

### 3. Get Appointment by ID
**GET** `/appointments/:id` (Protected)

Response (200):
```json
{
  "success": true,
  "appointment": { /* full appointment object with populated references */ }
}
```

---

### 4. Update Appointment
**PUT** `/appointments/:id` (Protected)

Request Body (all fields optional):
```json
{
  "appointmentDate": "date",
  "appointmentTime": "string",
  "reason": "string",
  "status": "scheduled|completed|cancelled|no-show",
  "notes": "string"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "appointment": { /* updated appointment object */ }
}
```

---

### 5. Cancel Appointment
**DELETE** `/appointments/:id` (Protected)

Response (200):
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "appointment": { /* appointment with status: 'cancelled' */ }
}
```

---

## 🏥 Health Check

### Server Health Status
**GET** `/health`

Response (200):
```json
{
  "success": true,
  "message": "Server is running",
  "database": "MySQL (Prisma)",
  "timestamp": "2024-05-05T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": { /* error details (only in development) */ }
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## Example Usage with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Doctors
```bash
curl -X GET "http://localhost:5000/api/doctors?specialization=Cardiology&city=Mumbai"
```

### Create Appointment (with token)
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "doctorId": "DOCTOR_ID",
    "appointmentDate": "2024-06-01",
    "appointmentTime": "14:00",
    "reason": "Regular checkup"
  }'
```

---

For more information, refer to the main README.md file.
