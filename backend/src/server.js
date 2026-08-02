const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const prisma = require('./lib/prisma');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/users', require('./routes/users'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/doctor', require('./routes/doctorDashboard'));
app.use('/api/medicine', require('./routes/medicine'));
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/pregnancy', require('./routes/pregnancy'));
app.use('/api/family', require('./routes/family'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

// DEBUG ROUTES (Development only - comment out in production)
app.use('/api/debug', require('./routes/debug'));

// Medicine reminder cron job — runs every minute, logs reminders
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const time24 = `${currentHour}:${currentMin}`;

    const medicines = await prisma.medicine.findMany({
      where: { active: true, time: { in: [currentTime, time24] } },
      include: { user: { select: { name: true, email: true } } },
    });

    if (medicines.length > 0) {
      console.log(`\n💊 [${currentTime}] Medicine Reminders:`);
      medicines.forEach(m => {
        console.log(`   → ${m.user.name}: Take ${m.name} (${m.dosage}) - ${m.frequency}`);
      });
    }
  } catch (err) {
    // Silently ignore cron errors
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('MySQL connected successfully via Prisma');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`💊 Medicine reminder cron job active`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
