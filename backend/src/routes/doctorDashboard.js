const express = require('express');
const router = express.Router();
const { getDoctorAppointments, updateAppointmentStatus, getDoctorPatients, getPatientDetail } = require('../controllers/doctorDashboardController');
const { authenticateUser } = require('../middleware/auth');

router.get('/appointments', authenticateUser, getDoctorAppointments);
router.patch('/appointments/:id/status', authenticateUser, updateAppointmentStatus);
router.get('/patients', authenticateUser, getDoctorPatients);
router.get('/patients/:patientId', authenticateUser, getPatientDetail);

module.exports = router;
