const express = require('express');
const router = express.Router();
const {
  getAllDoctorsDebug,
  getAllAppointmentsDebug,
  verifyDoctorAppointmentLink,
  getSystemStatus,
  diagnoseAppointmentIssue,
} = require('../controllers/debugController');

/**
 * DEBUG ROUTES - Only for development/testing
 * WARNING: These expose sensitive data. Remove or protect in production!
 */

// Get all doctors with their appointments
router.get('/doctors', getAllDoctorsDebug);

// Get all appointments
router.get('/appointments', getAllAppointmentsDebug);

// Get system status and statistics
router.get('/status', getSystemStatus);

// Verify specific doctor's appointment linkage
router.get('/verify/:doctorId', verifyDoctorAppointmentLink);

// Diagnose specific appointment issue
router.get('/diagnose', diagnoseAppointmentIssue);

module.exports = router;
