const prisma = require('../lib/prisma');

// POST /api/family — create family group
exports.createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Family group name is required' });
    }

    const group = await prisma.familyGroup.create({
      data: {
        name: name.trim(),
        ownerId: req.userId,
        members: {
          create: { userId: req.userId, relation: 'Self' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, age: true, gender: true } } },
        },
      },
    });

    res.status(201).json({ success: true, message: 'Family group created', family: formatFamily(group) });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ success: false, message: 'Failed to create family group' });
  }
};

// POST /api/family/add-member
exports.addMember = async (req, res) => {
  try {
    const { groupId, email, username, relation } = req.body;

    if (!groupId || (!email && !username) || !relation) {
      return res.status(400).json({ success: false, message: 'groupId, email or username, and relation are required' });
    }

    // Verify ownership
    const group = await prisma.familyGroup.findUnique({ where: { id: parseInt(groupId) } });
    if (!group) return res.status(404).json({ success: false, message: 'Family group not found' });
    if (group.ownerId !== req.userId) return res.status(403).json({ success: false, message: 'Only group owner can add members' });

    // Find user by email OR by name (username)
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else if (username) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: username.trim(), mode: 'insensitive' } },
            { email: { startsWith: username.toLowerCase().trim() + '@' } },
          ],
        },
      });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: email
          ? 'No user found with that email. They need to register first.'
          : 'No user found with that name. Please check the spelling or use their email instead.',
      });
    }

    // Check if already a member
    const existing = await prisma.familyMember.findUnique({
      where: { groupId_userId: { groupId: parseInt(groupId), userId: user.id } },
    });
    if (existing) return res.status(400).json({ success: false, message: 'User is already a member of this group' });

    const member = await prisma.familyMember.create({
      data: {
        groupId: parseInt(groupId),
        userId: user.id,
        relation: relation.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true, age: true, gender: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: `${user.name} added to family as ${relation}`,
      member: {
        id: member.id,
        relation: member.relation,
        user: member.user,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'User is already a member of this group' });
    }
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Failed to add member' });
  }
};

// GET /api/family — get user's family groups
exports.getFamilies = async (req, res) => {
  try {
    // Groups the user owns
    const owned = await prisma.familyGroup.findMany({
      where: { ownerId: req.userId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, age: true, gender: true, phone: true } } },
        },
      },
    });

    // Groups the user is a member of (but doesn't own)
    const memberships = await prisma.familyMember.findMany({
      where: { userId: req.userId, group: { ownerId: { not: req.userId } } },
      include: {
        group: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true, age: true, gender: true, phone: true } } },
            },
          },
        },
      },
    });

    const memberGroups = memberships.map(m => m.group);
    const allGroups = [...owned, ...memberGroups].map(formatFamily);

    res.json({ success: true, families: allGroups });
  } catch (error) {
    console.error('Get families error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch family groups' });
  }
};

// DELETE /api/family/:id — delete a family group
exports.deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await prisma.familyGroup.findUnique({ where: { id: parseInt(id) } });
    if (!group) return res.status(404).json({ success: false, message: 'Family group not found' });
    if (group.ownerId !== req.userId) return res.status(403).json({ success: false, message: 'Only the owner can delete this group' });

    await prisma.familyGroup.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Family group deleted' });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete family group' });
  }
};

// GET /api/family/member/:userId/health — get a family member's shared health information
exports.getMemberHealth = async (req, res) => {
  try {
    const memberUserId = parseInt(req.params.userId);
    const currentUserId = req.userId;

    if (isNaN(memberUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid family member ID' });
    }

    // Verify requesting user is in the same family group as the target user
    let isAuthorized = (currentUserId === memberUserId);

    if (!isAuthorized) {
      const sharedGroup = await prisma.familyGroup.findFirst({
        where: {
          members: {
            some: { userId: currentUserId }
          },
          AND: {
            members: {
              some: { userId: memberUserId }
            }
          }
        }
      });
      if (sharedGroup) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this user\'s health information' });
    }

    // Fetch the target user details
    const user = await prisma.user.findUnique({
      where: { id: memberUserId },
      select: { id: true, name: true, email: true, age: true, gender: true, phone: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    // Fetch active medicines
    const medicines = await prisma.medicine.findMany({
      where: { userId: memberUserId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: memberUserId },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: { patientId: memberUserId },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { date: 'desc' },
    });

    res.json({
      success: true,
      member: user,
      healthInfo: {
        medicines: medicines.map(m => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          time: m.time,
          frequency: m.frequency,
          notes: m.notes,
        })),
        prescriptions: prescriptions.map(p => ({
          id: p.id,
          content: p.content,
          diagnosis: p.diagnosis,
          aiSummary: p.aiSummary,
          doctorName: p.doctor.user.name,
          specialization: p.doctor.specialization,
          createdAt: p.createdAt,
        })),
        appointments: appointments.map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          reason: a.reason,
          status: a.status,
          doctorName: a.doctor.user.name,
          specialization: a.doctor.specialization,
        })),
      }
    });
  } catch (error) {
    console.error('Get member health error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch family member health information' });
  }
};


function formatFamily(group) {
  return {
    _id: group.id,
    name: group.name,
    owner: group.owner,
    memberCount: group.members.length,
    members: group.members.map(m => ({
      id: m.id,
      relation: m.relation,
      user: m.user,
    })),
    createdAt: group.createdAt,
  };
}
