# SPECIFICATION DOCUMENT
# Arogya Mitra – AI-Powered Healthcare Platform

## 1. Project Vision

Arogya Mitra is an AI-powered healthcare platform that connects patients and doctors through a simple, intelligent, and user-friendly system. The platform aims to provide AI-assisted health guidance, appointment booking, prescription management, doctor-patient communication, and family health management.

The objective is to make primary healthcare more accessible while assisting doctors with AI-generated insights.

---

# 2. Problem Statement

Many patients struggle to:

- Find the right doctor
- Understand prescriptions
- Track medicines
- Get basic health guidance
- Manage family health records

Doctors also face challenges in:

- Managing appointments
- Maintaining patient history
- Explaining prescriptions clearly
- Quickly summarizing patient symptoms

Arogya Mitra solves these problems using AI and automation.

---

# 3. Objectives

The system should:

- Provide AI-powered health assistance
- Connect patients and doctors
- Simplify prescriptions
- Manage appointments
- Enable doctor-patient messaging
- Track medicines
- Support pregnancy guidance
- Support family health management

---

# 4. User Roles

## Patient

Can:

- Register
- Login
- Browse doctors
- Book appointments
- Chat with AI
- Message doctors
- View prescriptions
- Scan prescriptions
- Manage medicines
- Manage family members

---

## Doctor

Can:

- Login
- Manage appointments
- View patient history
- Write prescriptions
- Reply to messages
- Use AI clinical assistant

---

## System Admin (Future)

Can:

- Manage users
- Manage doctors
- View analytics
- Moderate content

---

# 5. Functional Requirements

## Authentication

- Register using:
  - Name
  - Email
  - Role

- Login using email

- JWT authentication

---

## AI Health Assistant

Should:

- Analyze symptoms
- Suggest possible causes
- Provide self-care tips
- Suggest diet recommendations
- Show warning signs
- Recommend doctor consultation

Doctor mode should:

- Summarize symptoms
- Highlight key issues
- Suggest investigations
- Identify red flags

---

## Appointment Module

Patient should:

- Search doctors
- Select date
- Select time
- Book appointment

Doctor should:

- Accept appointment
- Reject appointment
- Complete appointment

---

## Messaging Module

Patient can:

- Find doctors
- Send messages

Doctor can:

- View conversations
- Reply

System stores chat history.

---

## Prescription Module

Doctor:

- Writes prescription
- Adds diagnosis

AI should simplify:

- Medicine
- Timing
- Food instructions
- Duration

Patient can:

- Read simplified version
- View original
- Listen using text-to-speech

---

## OCR Module

Patient uploads image.

System should:

- Extract text
- Detect medicines
- Detect dosage
- Detect timing
- Generate readable instructions

---

## Medicine Reminder

Patient can:

- Add medicine
- Edit medicine
- Delete medicine
- Pause reminder
- Resume reminder

System runs reminder scheduler.

---

## Pregnancy Module

Supports:

Week 1 → Week 40

Displays:

- Baby development
- Symptoms
- Diet
- Tips

---

## Family Health Module

Users can:

- Create family group
- Add members
- Assign relationships
- View shared health information

---

# 6. Non-Functional Requirements

The application should be:

- Responsive
- Secure
- Scalable
- Fast
- Easy to use
- Mobile friendly
- Maintainable

---

# 7. Technology Stack

Frontend:

- React
- React Router
- Tailwind CSS

Backend:

- Node.js
- Express.js

Database:

- MySQL
- Prisma ORM

AI:

- OpenAI API

OCR:

- Tesseract.js

Authentication:

- JWT

Scheduler:

- node-cron

---

# 8. Database Entities

User

- id
- name
- email
- role

Doctor

- specialization
- experience

Appointment

- patientId
- doctorId
- date
- status

Prescription

- diagnosis
- prescription
- simplifiedText

Medicine

- name
- dosage
- timing

Message

- sender
- receiver
- content

FamilyGroup

- name

FamilyMember

- relationship

---

# 9. API Requirements

Authentication

POST /register

POST /login

GET /profile

PUT /profile

AI

POST /chat

Appointments

POST /appointments

GET /appointments

PATCH /appointments/:id

Prescriptions

POST /prescriptions

GET /prescriptions

Messages

POST /messages

GET /messages

OCR

POST /ocr

Medicine

POST /medicine

GET /medicine

Pregnancy

GET /pregnancy/:week

Family

POST /family

GET /family

---

# 10. User Flow

Patient

Register

↓

Login

↓

Home

↓

Browse Doctors

↓

Book Appointment

↓

AI Assistant

↓

Ask Doctor

↓

Messages

↓

Prescriptions

↓

Medicine Reminder

↓

Family Health

---

Doctor

Register

↓

Login

↓

Dashboard

↓

Appointments

↓

Patients

↓

Prescription

↓

AI Assistant

↓

Messages

---

# 11. Security Requirements

- JWT Authentication
- Input validation
- API authorization
- Secure database access
- Environment variables
- Rate limiting (future)

---

# 12. Future Enhancements

- Video consultation
- Voice chatbot
- Wearable device integration
- Health analytics dashboard
- Multi-language support
- Emergency SOS
- Pharmacy integration
- Insurance integration

---

# 13. Success Criteria

The project will be successful if:

- Patients can easily access healthcare guidance.
- Doctors can efficiently manage appointments and prescriptions.
- AI provides helpful, safe, and understandable assistance.
- The platform is scalable and user-friendly.
