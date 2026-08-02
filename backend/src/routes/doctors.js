const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile
} = require('../controllers/doctorController');
const { authenticateUser } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', authenticateUser, createDoctorProfile);
router.put('/:id', authenticateUser, updateDoctorProfile);

module.exports = router;
