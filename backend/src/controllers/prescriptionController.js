const prisma = require('../lib/prisma');

// POST /api/prescriptions — Doctor uploads prescription for a patient
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, content, diagnosis } = req.body;
    if (!patientId || !content) return res.status(400).json({ success: false, message: 'Patient ID and prescription content are required' });

    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });

    const patient = await prisma.user.findUnique({ where: { id: parseInt(patientId) } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Generate AI summary
    const aiSummary = generatePrescriptionSummary(content);

    const prescription = await prisma.prescription.create({
      data: {
        patientId: parseInt(patientId),
        doctorId: doctor.id,
        content: content.trim(),
        diagnosis: diagnosis?.trim() || null,
        aiSummary,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created and simplified for patient',
      prescription: {
        id: prescription.id,
        content: prescription.content,
        diagnosis: prescription.diagnosis,
        aiSummary: prescription.aiSummary,
        patientName: prescription.patient.name,
        doctorName: prescription.doctor.user.name,
        createdAt: prescription.createdAt,
      },
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to create prescription' });
  }
};

// GET /api/prescriptions — Patient views their prescriptions
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: req.userId },
      include: {
        doctor: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p.id,
        content: p.content,
        diagnosis: p.diagnosis,
        aiSummary: p.aiSummary,
        doctorName: p.doctor.user.name,
        specialization: p.doctor.specialization,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions' });
  }
};

// GET /api/prescriptions/:id — Single prescription detail
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: { select: { id: true, name: true, email: true, age: true, gender: true } },
        doctor: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    if (prescription.patientId !== req.userId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
      if (!doctor || doctor.id !== prescription.doctorId)
        return res.status(403).json({ success: false, message: 'Not authorized to view this prescription' });
    }

    res.json({
      success: true,
      prescription: {
        id: prescription.id,
        content: prescription.content,
        diagnosis: prescription.diagnosis,
        aiSummary: prescription.aiSummary,
        patient: prescription.patient,
        doctorName: prescription.doctor.user.name,
        specialization: prescription.doctor.specialization,
        createdAt: prescription.createdAt,
      },
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescription' });
  }
};

// GET /api/prescriptions/doctor/all — Doctor views all prescriptions they wrote
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.userId } });
    if (!doctor) return res.status(403).json({ success: false, message: 'Doctor profile not found' });

    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { select: { id: true, name: true, email: true, age: true, gender: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      prescriptions: prescriptions.map(p => ({
        id: p.id, content: p.content, diagnosis: p.diagnosis,
        aiSummary: p.aiSummary, patientName: p.patient.name,
        patientAge: p.patient.age, patientGender: p.patient.gender,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions' });
  }
};

// AI Prescription Simplifier
function generatePrescriptionSummary(content) {
  const lines = content.split('\n').filter(l => l.trim());
  const medicines = [];
  const instructions = [];

  const medPatterns = /tab|cap|syrup|mg|ml|drops|ointment|cream|gel|injection|inj|tablet|capsule/i;
  const timingMap = {
    'od': '☀️ Once a day',
    'bd': '🌅 Morning & 🌙 Night',
    'td': '🌅 Morning, ☀️ Afternoon & 🌙 Night',
    'tds': '🌅 Morning, ☀️ Afternoon & 🌙 Night',
    'hs': '🌙 At bedtime',
    'sos': '⚡ Only when needed',
    'stat': '🚨 Take immediately',
    'ac': 'Before food',
    'pc': 'After food',
  };

  lines.forEach(line => {
    const trimmed = line.trim();
    if (medPatterns.test(trimmed)) {
      const med = { raw: trimmed, name: trimmed, when: 'As directed', duration: 'As prescribed', food: '' };

      // Extract name
      const nameMatch = trimmed.match(/(Tab|Cap|Syrup|Inj|Drops|Cream|Gel|Ointment)[\.\s]*([A-Za-z\s\-0-9]+)/i);
      if (nameMatch) med.name = `${nameMatch[1]}. ${nameMatch[2]}`.trim();

      // Extract timing
      Object.entries(timingMap).forEach(([key, val]) => {
        if (new RegExp(`\\b${key}\\b`, 'i').test(trimmed)) {
          if (['ac', 'pc'].includes(key)) { med.food = val; }
          else { med.when = val; }
        }
      });
      if (/morning/i.test(trimmed)) med.when = '🌅 Morning';
      if (/night|bedtime/i.test(trimmed)) med.when = '🌙 Night';
      if (/twice/i.test(trimmed)) med.when = '🌅 Morning & 🌙 Night';
      if (/after\s*(food|meal)/i.test(trimmed)) med.food = 'After food';
      if (/before\s*(food|meal)/i.test(trimmed)) med.food = 'Before food';
      if (/empty\s*stomach/i.test(trimmed)) med.food = 'Empty stomach';

      // Extract duration
      const durMatch = trimmed.match(/(\d+)\s*(days?|weeks?|months?)/i);
      if (durMatch) med.duration = `${durMatch[1]} ${durMatch[2]}`;

      medicines.push(med);
    } else if (trimmed.length > 3) {
      instructions.push(trimmed);
    }
  });

  // Build summary
  let summary = '📋 **Your Prescription — Simplified**\n\n';

  if (medicines.length > 0) {
    summary += '**💊 Medicines:**\n';
    medicines.forEach((m, i) => {
      summary += `\n${i + 1}. **${m.name}**\n`;
      summary += `   ⏰ When: ${m.when}\n`;
      if (m.food) summary += `   🍽️ ${m.food}\n`;
      summary += `   📅 Duration: ${m.duration}\n`;
    });
  } else {
    summary += '⚠️ No specific medicines detected. Please check the original prescription above.\n';
  }

  if (instructions.length > 0) {
    summary += '\n**📝 Doctor\'s Instructions:**\n';
    instructions.forEach(inst => { summary += `• ${inst}\n`; });
  }

  summary += '\n---\n⚕️ _If anything is unclear, please ask your doctor for clarification. Do not change dosage on your own._';
  return summary;
}
