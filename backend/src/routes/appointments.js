const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, createAppointment);
router.get('/', authenticateUser, getAppointments);
router.get('/:id', authenticateUser, getAppointmentById);
router.put('/:id', authenticateUser, updateAppointment);
router.delete('/:id', authenticateUser, cancelAppointment);

module.exports = router;
