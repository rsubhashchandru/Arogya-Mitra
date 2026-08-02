const prisma = require('../lib/prisma');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, city, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (specialization) {
      where.specialization = { contains: specialization };
    }

    if (city) {
      where.city = { contains: city };
    }

    // Get doctors with user info
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { rating: 'desc' },
        take: limitNum,
        skip
      }),
      prisma.doctor.count({ where })
    ]);

    // Transform to match frontend expected format
    const transformedDoctors = doctors.map(doctor => ({
      _id: doctor.id,
      userId: doctor.user ? {
        _id: doctor.user.id,
        firstName: doctor.user.name.split(' ')[0],
        lastName: doctor.user.name.split(' ').slice(1).join(' '),
        email: doctor.user.email,
        phone: doctor.user.phone
      } : null,
      specialization: doctor.specialization,
      qualification: doctor.qualification ? doctor.qualification.split(',').map(q => q.trim()) : [],
      experience: doctor.experience,
      licenseNumber: doctor.licenseNumber,
      clinic: {
        name: doctor.clinicName,
        address: doctor.clinicAddress
      },
      consultationFee: doctor.consultationFee,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
      isVerified: doctor.isVerified,
      city: doctor.city
    }));

    res.json({
      success: true,
      doctors: transformedDoctors,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor: {
        _id: doctor.id,
        userId: doctor.user ? {
          _id: doctor.user.id,
          firstName: doctor.user.name.split(' ')[0],
          lastName: doctor.user.name.split(' ').slice(1).join(' '),
          email: doctor.user.email,
          phone: doctor.user.phone
        } : null,
        specialization: doctor.specialization,
        qualification: doctor.qualification ? doctor.qualification.split(',').map(q => q.trim()) : [],
        experience: doctor.experience,
        licenseNumber: doctor.licenseNumber,
        clinic: {
          name: doctor.clinicName,
          address: doctor.clinicAddress
        },
        consultationFee: doctor.consultationFee,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        isVerified: doctor.isVerified,
        city: doctor.city
      }
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor'
    });
  }
};

// Create doctor profile
exports.createDoctorProfile = async (req, res) => {
  try {
    const { specialization, qualification, experience, licenseNumber, clinic, consultationFee, city } = req.body;

    if (!specialization || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Specialization and experience are required'
      });
    }

    // Check if doctor profile already exists for this user
    const existing = await prisma.doctor.findUnique({
      where: { userId: req.userId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists'
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId: req.userId,
        specialization,
        qualification: Array.isArray(qualification) ? qualification.join(', ') : qualification || null,
        experience: parseInt(experience),
        licenseNumber: licenseNumber || null,
        clinicName: clinic?.name || null,
        clinicAddress: clinic?.address || null,
        city: city || clinic?.city || null,
        consultationFee: consultationFee ? parseInt(consultationFee) : null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor profile'
    });
  }
};

// Update doctor profile — only the owner can update
exports.updateDoctorProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
    }

    // Authorization: ensure the doctor belongs to the current user
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    if (doctor.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const { specialization, qualification, experience, licenseNumber, clinic, consultationFee, city } = req.body;

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (qualification) updateData.qualification = Array.isArray(qualification) ? qualification.join(', ') : qualification;
    if (experience) updateData.experience = parseInt(experience);
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (clinic?.name) updateData.clinicName = clinic.name;
    if (clinic?.address) updateData.clinicAddress = clinic.address;
    if (city) updateData.city = city;
    if (consultationFee) updateData.consultationFee = parseInt(consultationFee);

    const updated = await prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updated
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile'
    });
  }
};
