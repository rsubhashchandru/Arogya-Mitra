const prisma = require('../lib/prisma');

// GET /api/doctor/appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found. Please create your doctor profile first.' });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { select: { id: true, name: true, email: true, phone: true, age: true, gender: true } } },
      orderBy: { date: 'desc' },
    });

    const formatted = appointments.map(apt => ({
      _id: apt.id, patientId: apt.patient.id, patientName: apt.patient.name,
      patientEmail: apt.patient.email, patientPhone: apt.patient.phone,
      patientAge: apt.patient.age, patientGender: apt.patient.gender,
      date: apt.date, time: apt.time, reason: apt.reason,
      status: apt.status, notes: apt.notes, createdAt: apt.createdAt,
    }));

    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      accepted: appointments.filter(a => a.status === 'accepted').length,
      rejected: appointments.filter(a => a.status === 'rejected').length,
      completed: appointments.filter(a => a.status === 'completed').length,
    };

    res.json({ success: true, appointments: formatted, stats });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

// PATCH /api/doctor/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed'].includes(status))
      return res.status(400).json({ success: false, message: 'Status must be accepted, rejected, or completed' });

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const appointment = await prisma.appointment.findUnique({ where: { id: parseInt(id) } });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.doctorId !== doctor.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await prisma.appointment.update({
      where: { id: parseInt(id) }, data: { status },
      include: { patient: { select: { id: true, name: true, email: true, phone: true } } },
    });

    res.json({ success: true, message: `Appointment ${status}`, appointment: { _id: updated.id, patientName: updated.patient.name, date: updated.date, time: updated.time, status: updated.status } });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// GET /api/doctor/patients — full patient list for this doctor
exports.getDoctorPatients = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    // Get unique patients from appointments
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { select: { id: true, name: true, email: true, phone: true, age: true, gender: true, createdAt: true } } },
      orderBy: { date: 'desc' },
    });

    const patientMap = new Map();
    appointments.forEach(apt => {
      const p = apt.patient;
      if (!patientMap.has(p.id)) {
        patientMap.set(p.id, {
          id: p.id, name: p.name, email: p.email, phone: p.phone,
          age: p.age, gender: p.gender, joinedAt: p.createdAt,
          totalVisits: 0, lastVisit: null, lastReason: null,
        });
      }
      const entry = patientMap.get(p.id);
      entry.totalVisits++;
      if (!entry.lastVisit || new Date(apt.date) > new Date(entry.lastVisit)) {
        entry.lastVisit = apt.date;
        entry.lastReason = apt.reason;
      }
    });

    res.json({ success: true, patients: Array.from(patientMap.values()), total: patientMap.size });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
  }
};

// GET /api/doctor/patients/:patientId — patient detail + history
exports.getPatientDetail = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    const pid = parseInt(patientId);
    const patient = await prisma.user.findUnique({
      where: { id: pid },
      select: { id: true, name: true, email: true, phone: true, age: true, gender: true, createdAt: true },
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Appointments with this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id, patientId: pid },
      orderBy: { date: 'desc' },
    });

    // Prescriptions from this doctor
    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctor.id, patientId: pid },
      orderBy: { createdAt: 'desc' },
    });

    // Messages between doctor and patient
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: pid },
          { senderId: pid, receiverId: req.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Medicines
    const medicines = await prisma.medicine.findMany({
      where: { userId: pid },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      patient,
      history: {
        appointments: appointments.map(a => ({
          id: a.id, date: a.date, time: a.time, reason: a.reason,
          status: a.status, notes: a.notes,
        })),
        prescriptions: prescriptions.map(p => ({
          id: p.id, content: p.content, diagnosis: p.diagnosis,
          aiSummary: p.aiSummary, createdAt: p.createdAt,
        })),
        messages: messages.map(m => ({
          id: m.id, message: m.message, isMine: m.senderId === req.userId,
          createdAt: m.createdAt,
        })),
        medicines,
      },
    });
  } catch (error) {
    console.error('Get patient detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patient details' });
  }
};
