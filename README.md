# 🏥 Arogya Mitra — AI-Powered Healthcare Platform

> A full-stack healthcare platform connecting patients and doctors with AI-powered health guidance, appointment management, prescription handling, and more.

---

## ✨ Features

### 1. 🔐 Authentication
- Register with **Name**, **Email**, and **Role** (Patient/Doctor)
- Login with **email + password** (bcrypt-hashed)
- Legacy accounts (no password) still supported
- **JWT** token-based sessions (7-day expiry)
- Role-based routing: Doctors → Doctor Dashboard, Patients → Home
- Quick-fill test doctor accounts on Login page

### 2. 🤖 AI Health Assistant
- **For Patients:** Structured health advice with:
  - 🔍 Symptom analysis (possible causes)
  - 🛡️ Self-care tips & home remedies
  - 🥗 Diet & lifestyle recommendations
  - ⚠️ Warning signs (when to see a doctor)
  - 💡 Quick wellness tips
- **For Doctors:** Clinical assistant mode:
  - 📋 Patient symptom summarization
  - 🔍 Key symptom highlighting
  - ⚠️ Possible concern areas
  - 🧪 Suggested investigations
  - 🚨 Red flag identification
- **Pregnancy Mode:** Auto-detected for pregnancy-related queries with safe, gentle advice
- Powered by **OpenAI** (with smart fallback responses)

### 3. 👨‍⚕️ Doctor Dashboard
- **Appointments Tab:** View, accept, reject, complete appointments with inline reply
- **Patients Tab:** Full patient list with detailed health history:
  - Appointment history
  - Prescription records
  - Chat messages
  - Current medicines
- **Prescribe Tab:** Write prescriptions that are auto-simplified by AI for patients

### 4. 📋 Prescription System
- **Doctor uploads** prescription text with diagnosis
- **AI automatically simplifies** into:
  - 💊 Medicine name
  - ⏰ When to take (morning/night)
  - 🍽️ Before/after food
  - 📅 Duration
- **Patient views** simplified prescriptions with:
  - 🔊 Text-to-speech readout
  - Expandable original prescription text

### 5. 💬 Doctor–Patient Messaging
- Patients can find and message doctors directly
- "**Ask Doctor**" button in AI Health Assistant
- Doctors can view and reply to patient messages
- Read receipts and conversation history

### 6. 📄 Prescription Scanner (OCR)
- Upload prescription image → Extract text using **Tesseract.js**
- Auto-detect medicines, timing, and dosage
- **Voice readout** of extracted instructions (Web Speech API)
- Confidence scoring

### 7. 💊 Medicine Reminders
- Add medicines with name, dosage, time, frequency
- Toggle active/paused status
- **Server-side cron job** (node-cron) logs reminders every minute

### 8. 🤰 Pregnancy Module
- Week-by-week pregnancy guide (Weeks 1–40)
- Interactive slider with progress bar
- Symptoms, tips, diet, and baby development info

### 9. 👨‍👩‍👧‍👦 Family Health System
- Create family groups and add members by **email** or **username** with relationship tags
- Click any family member card to view their **shared health information**:
  - 💊 Active medicines (name, dosage, timing, frequency)
  - 📋 Prescriptions with AI-simplified summaries + 🔊 TTS readout
  - 📅 Appointment history with status badges
- Backend endpoint: `GET /api/family/member/:userId/health`

### 10. 🩺 Doctor AI Clinical Assistant
- Dedicated **AI tab** inside Doctor Dashboard
- Clinical-mode prompting: symptom summarization, red flags, investigations
- Quick-prompt suggestions (chest pain, diabetic history, low Hb…)
- Powered by `sendChatMessage` with doctor context

### 11. 📅 Appointment Booking
- Browse and search doctors by specialization and city
- Book appointments with date/time-slot selection
- Track appointment status (scheduled → accepted → completed)
- **Google Maps** integration — View clinic location on map

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, React Router, Tailwind CSS, i18next |
| Backend   | Node.js, Express.js                  |
| Database  | MySQL + Prisma 7 ORM                |
| AI        | OpenAI API (with fallback responses) |
| OCR       | Tesseract.js                         |
| File Upload | Multer                             |
| Scheduler | node-cron                            |
| Auth      | JWT (JSON Web Tokens)                |

---

## 📁 Project Structure

```
Arogya Mitra/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── userController.js       # Simple auth (register/login)
│   │   │   ├── chatController.js       # AI Health Assistant
│   │   │   ├── doctorController.js     # Doctor CRUD
│   │   │   ├── doctorDashboardController.js  # Dashboard APIs
│   │   │   ├── appointmentController.js # Appointment management
│   │   │   ├── prescriptionController.js # Prescription CRUD + AI
│   │   │   ├── messageController.js    # Doctor-patient messaging
│   │   │   ├── medicineController.js   # Medicine reminders
│   │   │   ├── ocrController.js        # Prescription OCR
│   │   │   ├── pregnancyController.js  # Pregnancy module
│   │   │   └── familyController.js     # Family system
│   │   ├── routes/                     # Express route files
│   │   ├── middleware/
│   │   │   └── auth.js                 # JWT authentication
│   │   ├── lib/
│   │   │   └── prisma.js              # Prisma client singleton
│   │   └── server.js                  # Express app + cron
│   ├── .env                           # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js                # Landing page
│   │   │   ├── Login.js               # Simple email login
│   │   │   ├── Register.js            # Name + Email + Role
│   │   │   ├── Doctors.js             # Doctor listing
│   │   │   ├── Appointments.js        # Patient appointments
│   │   │   ├── Profile.js             # User profile
│   │   │   ├── HealthAssistant.js     # AI chat (dual mode)
│   │   │   ├── DoctorDashboard.js     # Doctor management
│   │   │   ├── MyPrescriptions.js     # Patient prescription view
│   │   │   ├── Messages.js            # Doctor-patient chat
│   │   │   ├── MedicineReminder.js    # Medicine tracking
│   │   │   ├── PrescriptionOCR.js     # Scan prescriptions
│   │   │   ├── PregnancyModule.js     # Week-by-week guide
│   │   │   └── FamilySystem.js        # Family groups
│   │   ├── components/
│   │   │   ├── Navbar.js              # Navigation with role-based links
│   │   │   ├── Footer.js
│   │   │   └── LanguageSelector.js
│   │   ├── services/
│   │   │   ├── api.js                 # Axios instance
│   │   │   └── authService.js         # All API functions
│   │   └── App.js                     # Routes + auth guards
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+
- **npm** v9+

### 1. Clone the Repository
```bash
git clone <repo-url>
cd "Arogya Mitra"
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
DATABASE_URL="mysql://root:yourpassword@localhost:3306/arogya_mitra"
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_key  # Optional — app works without it
```

Push database schema:
```bash
npx prisma db push
npx prisma generate
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm start
```

### 4. Open the App
- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:5000**

---

## 📊 Database Models

| Model         | Purpose                                    |
|--------------|---------------------------------------------|
| User          | Patients & Doctors (role-based)             |
| Doctor        | Doctor profile (specialization, experience) |
| Appointment   | Patient-doctor appointments                 |
| Prescription  | Doctor prescriptions with AI summary        |
| ChatMessage   | Doctor-patient direct messages              |
| Medicine      | Medicine reminders for patients             |
| FamilyGroup   | Family health groups                        |
| FamilyMember  | Group membership with relations             |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | `/api/users/register`  | Register (name, email, role) |
| POST   | `/api/users/login`     | Login (email only)   |
| GET    | `/api/users/profile`   | Get profile          |
| PUT    | `/api/users/profile`   | Update profile       |

### AI Chat
| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| POST   | `/api/chat`   | AI health assistant (role-aware) |

### Doctor Dashboard
| Method | Endpoint                              | Description            |
|--------|---------------------------------------|------------------------|
| GET    | `/api/doctor/appointments`            | Doctor's appointments  |
| PATCH  | `/api/doctor/appointments/:id/status` | Accept/reject/complete |
| GET    | `/api/doctor/patients`                | Patient list           |
| GET    | `/api/doctor/patients/:id`            | Patient full history   |

### Prescriptions
| Method | Endpoint                        | Description                 |
|--------|---------------------------------|-----------------------------|
| POST   | `/api/prescriptions`            | Doctor creates prescription |
| GET    | `/api/prescriptions`            | Patient's prescriptions     |
| GET    | `/api/prescriptions/:id`        | Single prescription         |
| GET    | `/api/prescriptions/doctor/all` | Doctor's written Rx         |

### Messages
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| POST   | `/api/messages/send`         | Send message         |
| GET    | `/api/messages`              | Conversations        |
| GET    | `/api/messages/:partnerId`   | Chat thread          |
| GET    | `/api/messages/doctors/list` | Available doctors    |

### Family Health
| Method | Endpoint                              | Description                    |
|--------|---------------------------------------|--------------------------------|
| POST   | `/api/family`                         | Create family group            |
| GET    | `/api/family`                         | Get all family groups          |
| POST   | `/api/family/member`                  | Add member (by email/username) |
| DELETE | `/api/family/:id`                     | Delete group                   |
| GET    | `/api/family/member/:userId/health`   | Get member shared health info  |

### Other Features
| Method | Endpoint                | Description               |
|--------|-------------------------|---------------------------|
| POST   | `/api/medicine`         | Add medicine reminder     |
| GET    | `/api/medicine`         | Get medicines             |
| PATCH  | `/api/medicine/:id`     | Update/pause medicine     |
| DELETE | `/api/medicine/:id`     | Delete medicine           |
| POST   | `/api/ocr`              | Upload prescription image |
| GET    | `/api/pregnancy/:week`  | Pregnancy week info       |
| GET    | `/api/pregnancy/weeks`  | All available weeks       |
| GET    | `/api/appointments`     | Patient appointments      |
| POST   | `/api/appointments`     | Book appointment          |

---

## 🔄 User Flows

### Patient Flow
```
Register (Name + Email + Role:Patient)
    → Home → Browse Doctors → Book Appointment
    → AI Health Assistant → Ask questions → "Ask Doctor" button
    → Messages → Chat with doctor directly
    → My Prescriptions → View simplified instructions → 🔊 Listen
    → Medicine Reminders → Track daily medications
    → Prescription Scanner → Upload image → Get text
    → Family Health → Create group → Add members
                    → Click member card → View medicines/prescriptions/appointments
    → Pregnancy Module → Week-by-week guide → Pregnancy Advisor chatbot
```

### Doctor Flow
```
Register (Name + Email + Role:Doctor)
    → Doctor Dashboard
        → Appointments: Accept/Reject/Complete + Reply + Prescribe
        → Patients: View list → Click → Full health history
        → Write Prescription: Select patient → Write → AI simplifies
        → AI Clinical Assistant: Paste symptoms → Get structured clinical summary
    → Messages: Reply to patient queries
```

---

## ⚠️ Important Notes

- **OpenAI API key is optional** — The app has comprehensive rule-based fallback responses for all health topics
- **No diagnosis** — AI provides guidance only, always recommends doctor consultation
- **Password auth** — Passwords are bcrypt-hashed; legacy email-only accounts still work
- **Seed doctors** — Run `node seed.js` from the `backend/` folder to create test doctor accounts (password: `Doctor@123`)
- **Text-to-Speech** — Uses browser's built-in Web Speech API (works in Chrome, Edge, Firefox)
- **Medicine cron** — Runs every minute, logs reminders to server console
- **Family health sharing** — Members must have an Arogya Mitra account to be added to a group

## 🧪 Test Accounts

Run `node seed.js` in the `backend/` folder, then use any of these on the Login page:

| Email | Specialization | Password |
|-------|---------------|----------|
| `arjun.sharma.doc@gmail.com` | Cardiology | `Doctor@123` |
| `meena.patel.doc@gmail.com` | Pediatrics | `Doctor@123` |
| `vikram.nair.doc@gmail.com` | Neurology | `Doctor@123` |
| `dr.sarah@arogya.com` | Pediatrics | `Doctor@123` |
| `dr.priya@arogya.com` | Gynecology | `Doctor@123` |
| `dr.arun@arogya.com` | General Medicine | `Doctor@123` |

---

## 📝 License

This project is for educational and demonstration purposes.

---

**Built with ❤️ by Arogya Mitra Team**
