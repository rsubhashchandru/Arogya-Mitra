const prisma = require('../lib/prisma');

/**
 * Debug endpoint to check doctor-appointment system
 * GET /api/debug/doctors — List all doctors with their appointments
 * GET /api/debug/appointments — List all appointments with doctor/patient info
 * GET /api/debug/verify/:doctorId — Verify specific doctor's appointment link
 */

// Get all doctors with their appointments
exports.getAllDoctorsDebug = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        appointments: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`[DEBUG] Found ${doctors.length} doctors`);

    const summary = doctors.map((doctor) => ({
      doctorId: doctor.id,
      userId: doctor.userId,
      doctorName: doctor.user.name,
      doctorEmail: doctor.user.email,
      specialization: doctor.specialization,
      appointmentCount: doctor.appointments.length,
      appointments: doctor.appointments.map((apt) => ({
        appointmentId: apt.id,
        patientName: apt.patient.name,
        patientEmail: apt.patient.email,
        date: apt.date,
        time: apt.time,
        reason: apt.reason,
        status: apt.status,
      })),
    }));

    res.json({
      success: true,
      totalDoctors: doctors.length,
      data: summary,
    });
  } catch (error) {
    console.error('Debug doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug data',
      error: error.message,
    });
  }
};

// Get all appointments with full details
exports.getAllAppointmentsDebug = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`[DEBUG] Found ${appointments.length} appointments`);

    const summary = appointments.map((apt) => ({
      appointmentId: apt.id,
      doctorId: apt.doctorId,
      doctorUserId: apt.doctor.userId,
      doctorName: apt.doctor.user.name,
      doctorEmail: apt.doctor.user.email,
      patientId: apt.patientId,
      patientName: apt.patient.name,
      patientEmail: apt.patient.email,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      createdAt: apt.createdAt,
    }));

    res.json({
      success: true,
      totalAppointments: appointments.length,
      data: summary,
    });
  } catch (error) {
    console.error('Debug appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug data',
      error: error.message,
    });
  }
};

// Verify specific doctor's appointment linkage
exports.verifyDoctorAppointmentLink = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const docId = parseInt(doctorId);

    if (isNaN(docId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID',
      });
    }

    // Get doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id: docId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: `Doctor with ID ${docId} not found`,
      });
    }

    // Get appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: docId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      verification: {
        doctorId: doctor.id,
        doctorUserId: doctor.userId,
        doctorName: doctor.user.name,
        doctorEmail: doctor.user.email,
        specialization: doctor.specialization,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        totalAppointments: appointments.length,
        appointments: appointments.map((apt) => ({
          appointmentId: apt.id,
          patientName: apt.patient.name,
          patientEmail: apt.patient.email,
          date: apt.date,
          time: apt.time,
          reason: apt.reason,
          status: apt.status,
        })),
      },
    });
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify doctor',
      error: error.message,
    });
  }
};

// Get system status and statistics
exports.getSystemStatus = async (req, res) => {
  try {
    const [userCount, doctorCount, patientCount, appointmentCount] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.appointment.count(),
    ]);

    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      success: true,
      systemStatus: {
        totalUsers: userCount,
        doctorUsers: doctorCount,
        patientUsers: patientCount,
        totalAppointments: appointmentCount,
        appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message,
    });
  }
};

// Diagnose why a specific appointment is not visible to a doctor
exports.diagnoseAppointmentIssue = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.query;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentId query parameter',
      });
    }

    const aptId = parseInt(appointmentId);
    const docId = doctorId ? parseInt(doctorId) : null;

    // Get appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: aptId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `Appointment ID ${aptId} not found`,
      });
    }

    const diagnosis = {
      appointmentFound: true,
      appointmentId: appointment.id,
      createdAt: appointment.createdAt,
      patientInfo: {
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        patientEmail: appointment.patient.email,
      },
      doctorInfo: {
        doctorId: appointment.doctorId,
        doctorUserId: appointment.doctor.userId,
        doctorName: appointment.doctor.user.name,
        doctorEmail: appointment.doctor.user.email,
        specialization: appointment.doctor.specialization,
      },
      appointmentDetails: {
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
      },
      checks: {
        doctorProfileExists: !!appointment.doctor,
        doctorUserLinked: !!appointment.doctor.user,
        appointmentHasDoctorId: !!appointment.doctorId,
        appointmentHasPatientId: !!appointment.patientId,
      },
      diagnosis:
        appointment.doctor && appointment.doctor.user
          ? '✅ All links OK. Doctor should see this appointment in dashboard.'
          : '❌ ERROR: Doctor or User link is broken!',
    };

    res.json({
      success: true,
      diagnosis,
    });
  } catch (error) {
    console.error('Diagnose error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to diagnose',
      error: error.message,
    });
  }
};
