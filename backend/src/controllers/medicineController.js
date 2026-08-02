const prisma = require('../lib/prisma');

// POST /api/medicine
exports.addMedicine = async (req, res) => {
  try {
    const { name, dosage, time, frequency, notes } = req.body;
    if (!name || !dosage || !time) {
      return res.status(400).json({ success: false, message: 'Name, dosage, and time are required' });
    }

    const medicine = await prisma.medicine.create({
      data: {
        userId: req.userId,
        name: name.trim(),
        dosage: dosage.trim(),
        time: time.trim(),
        frequency: frequency || 'daily',
        notes: notes || null,
      },
    });

    res.status(201).json({ success: true, message: 'Medicine reminder added', medicine });
  } catch (error) {
    console.error('Add medicine error:', error);
    res.status(500).json({ success: false, message: 'Failed to add medicine reminder' });
  }
};

// GET /api/medicine
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { userId: req.userId },
      orderBy: { time: 'asc' },
    });

    res.json({ success: true, medicines });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medicines' });
  }
};

// DELETE /api/medicine/:id
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({ where: { id: parseInt(id) } });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    if (medicine.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await prisma.medicine.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Medicine reminder deleted' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete medicine' });
  }
};

// PATCH /api/medicine/:id/toggle
exports.toggleMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({ where: { id: parseInt(id) } });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    if (medicine.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await prisma.medicine.update({
      where: { id: parseInt(id) },
      data: { active: !medicine.active },
    });

    res.json({ success: true, message: `Reminder ${updated.active ? 'activated' : 'paused'}`, medicine: updated });
  } catch (error) {
    console.error('Toggle medicine error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle medicine' });
  }
};
