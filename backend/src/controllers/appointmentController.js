const prisma = require('../lib/prisma');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, notes } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, date, time, and reason'
      });
    }

    const docId = parseInt(doctorId);

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({ where: { id: docId } });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Parse date
    const date = new Date(appointmentDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    // Create appointment (unique constraint on doctorId+date+time prevents double booking)
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.userId,
        doctorId: docId,
        date,
        time: appointmentTime,
        reason,
        notes: notes || null,
        status: 'scheduled'
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        patient: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: formatAppointment(appointment)
    });
  } catch (error) {
    // Handle unique constraint violation (double booking)
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
};

// Get user's appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.userId },
      include: {
        doctor: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({
      success: true,
      appointments: appointments.map(formatAppointment)
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        patient: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization: user can only see their own appointments
    if (appointment.patientId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    res.json({
      success: true,
      appointment: formatAppointment(appointment)
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    // Check ownership
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (existing.patientId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { appointmentDate, appointmentTime, reason, status } = req.body;

    const updateData = {};
    if (appointmentDate) updateData.date = new Date(appointmentDate);
    if (appointmentTime) updateData.time = appointmentTime;
    if (reason) updateData.reason = reason;
    if (status) updateData.status = status;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        doctor: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: formatAppointment(appointment)
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked.'
      });
    }
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    // Check ownership
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (existing.patientId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        _id: appointment.id,
        ...appointment
      }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
};

// Helper: format appointment for frontend compatibility
function formatAppointment(apt) {
  const doctorUser = apt.doctor?.user;
  return {
    _id: apt.id,
    patientId: apt.patientId,
    doctorId: doctorUser ? {
      _id: doctorUser.id,
      firstName: doctorUser.name.split(' ')[0],
      lastName: doctorUser.name.split(' ').slice(1).join(' '),
      specialization: apt.doctor?.specialization
    } : apt.doctorId,
    appointmentDate: apt.date,
    appointmentTime: apt.time,
    reason: apt.reason,
    status: apt.status,
    notes: apt.notes,
    createdAt: apt.createdAt
  };
}
