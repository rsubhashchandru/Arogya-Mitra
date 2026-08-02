const express = require('express');
const router = express.Router();
const { createPrescription, getMyPrescriptions, getPrescriptionById, getDoctorPrescriptions } = require('../controllers/prescriptionController');
const { authenticateUser } = require('../middleware/auth');

router.post('/', authenticateUser, createPrescription);
router.get('/', authenticateUser, getMyPrescriptions);
router.get('/doctor/all', authenticateUser, getDoctorPrescriptions);
router.get('/:id', authenticateUser, getPrescriptionById);

module.exports = router;
