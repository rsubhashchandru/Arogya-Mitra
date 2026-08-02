require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma');

// ── Doctor accounts ────────────────────────────────────────────────────────────
// These are the test doctor accounts with Gmail addresses and passwords.
// All passwords are: Doctor@123

const DEFAULT_PASSWORD = 'Doctor@123';

const testDoctors = [
  // ── Named test accounts (doctor1, doctor2, doctor3) ──
  {
    userName: 'Dr. Arjun Sharma',
    userEmail: 'arjun.sharma.doc@gmail.com',
    specialization: 'Cardiology',
    qualification: 'MD, DM Cardiology',
    experience: 12,
    licenseNumber: 'MCI/10001',
    clinicName: 'Arjun Heart Clinic',
    clinicAddress: '12 MG Road, Connaught Place',
    city: 'Delhi',
    consultationFee: 500,
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    userName: 'Dr. Meena Patel',
    userEmail: 'meena.patel.doc@gmail.com',
    specialization: 'Pediatrics',
    qualification: 'MD, Pediatrics',
    experience: 8,
    licenseNumber: 'MCI/10002',
    clinicName: 'Little Stars Child Clinic',
    clinicAddress: '45 Linking Road, Bandra West',
    city: 'Mumbai',
    consultationFee: 400,
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    userName: 'Dr. Vikram Nair',
    userEmail: 'vikram.nair.doc@gmail.com',
    specialization: 'Neurology',
    qualification: 'MD, DM Neurology',
    experience: 15,
    licenseNumber: 'MCI/10003',
    clinicName: 'Vikram Brain & Spine Center',
    clinicAddress: '78 Residency Road, Richmond Town',
    city: 'Bangalore',
    consultationFee: 600,
    lat: 12.9716,
    lng: 77.5946,
  },
  // ── Original seeded doctors ──
  {
    userName: 'Dr. Final',
    userEmail: 'dr.final@arogya.com',
    specialization: 'Cardiology',
    qualification: 'MD, DM Cardiology',
    experience: 12,
    licenseNumber: 'MCI/23456',
    clinicName: 'Final Heart Clinic',
    clinicAddress: '123 Heart Street, Medical Plaza',
    city: 'Bangalore',
    consultationFee: 500,
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    userName: 'Dr. Sarah Mitchell',
    userEmail: 'dr.sarah@arogya.com',
    specialization: 'Pediatrics',
    qualification: 'MD, Pediatrics',
    experience: 8,
    licenseNumber: 'MCI/23457',
    clinicName: 'Little Stars Pediatric Clinic',
    clinicAddress: '456 Children Avenue',
    city: 'Mumbai',
    consultationFee: 400,
    lat: 19.0760,
    lng: 72.8777,
  },
  {
    userName: 'Dr. Rajesh Kumar',
    userEmail: 'dr.rajesh@arogya.com',
    specialization: 'Neurology',
    qualification: 'MD, DM Neurology',
    experience: 15,
    licenseNumber: 'MCI/23458',
    clinicName: 'Brain Care Center',
    clinicAddress: '789 Neural Street',
    city: 'Delhi',
    consultationFee: 600,
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    userName: 'Dr. Priya Sharma',
    userEmail: 'dr.priya@arogya.com',
    specialization: 'Gynecology',
    qualification: 'MD, DGO',
    experience: 10,
    licenseNumber: 'MCI/23459',
    clinicName: 'Women Health Clinic',
    clinicAddress: '321 Wellness Road',
    city: 'Pune',
    consultationFee: 450,
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    userName: 'Dr. Arun Verma',
    userEmail: 'dr.arun@arogya.com',
    specialization: 'General Medicine',
    qualification: 'MBBS, MD General Medicine',
    experience: 20,
    licenseNumber: 'MCI/23460',
    clinicName: 'General Health Clinic',
    clinicAddress: '654 Health Street',
    city: 'Hyderabad',
    consultationFee: 300,
    lat: 17.3850,
    lng: 78.4867,
  },
  {
    userName: 'Dr. Neha Desai',
    userEmail: 'dr.neha@arogya.com',
    specialization: 'Dermatology',
    qualification: 'MD, DVL',
    experience: 7,
    licenseNumber: 'MCI/23461',
    clinicName: 'Skin Care Specialist',
    clinicAddress: '987 Beauty Lane',
    city: 'Chennai',
    consultationFee: 350,
    lat: 13.0827,
    lng: 80.2707,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const createdDoctors = [];

    for (const doctorData of testDoctors) {
      const existingUser = await prisma.user.findUnique({
        where: { email: doctorData.userEmail },
      });

      if (existingUser) {
        // Update password for existing user if still on simple_login
        if (existingUser.password === 'simple_login') {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword },
          });
          console.log(`🔑 Updated password for: ${doctorData.userName}`);
        } else {
          console.log(`⏭️  ${doctorData.userName} already exists`);
        }
        createdDoctors.push(existingUser);
        continue;
      }

      // Create user with hashed password
      const user = await prisma.user.create({
        data: {
          name: doctorData.userName,
          email: doctorData.userEmail,
          password: hashedPassword,
          role: 'doctor',
          phone: '+91-9999000000',
          age: 35,
          gender: 'M',
          language: 'English',
        },
      });

      // Check if doctor profile exists for this userId
      const existingDoctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
      if (!existingDoctor) {
        await prisma.doctor.create({
          data: {
            userId: user.id,
            specialization: doctorData.specialization,
            qualification: doctorData.qualification,
            experience: doctorData.experience,
            licenseNumber: doctorData.licenseNumber,
            clinicName: doctorData.clinicName,
            clinicAddress: doctorData.clinicAddress,
            city: doctorData.city,
            consultationFee: doctorData.consultationFee,
            rating: 4.5,
            totalReviews: 25,
            isVerified: true,
          },
        });
      }

      createdDoctors.push(user);
      console.log(`✅ Created: ${doctorData.userName}`);
      console.log(`   📧 Email: ${doctorData.userEmail}`);
      console.log(`   🏥 Specialization: ${doctorData.specialization}`);
      console.log(`   💰 Fee: ₹${doctorData.consultationFee}\n`);
    }

    console.log(`\n${'='.repeat(65)}`);
    console.log('✨ Seed completed! Doctor accounts ready:\n');
    console.log('USERNAME       EMAIL                          PASSWORD');
    console.log('-'.repeat(65));
    const loginMap = [
      { username: 'doctor1', email: 'arjun.sharma.doc@gmail.com' },
      { username: 'doctor2', email: 'meena.patel.doc@gmail.com' },
      { username: 'doctor3', email: 'vikram.nair.doc@gmail.com' },
      { username: 'dr.final', email: 'dr.final@arogya.com' },
      { username: 'dr.sarah', email: 'dr.sarah@arogya.com' },
      { username: 'dr.rajesh', email: 'dr.rajesh@arogya.com' },
      { username: 'dr.priya', email: 'dr.priya@arogya.com' },
      { username: 'dr.arun', email: 'dr.arun@arogya.com' },
      { username: 'dr.neha', email: 'dr.neha@arogya.com' },
    ];
    loginMap.forEach(d => {
      console.log(`${d.email.padEnd(35)} ${DEFAULT_PASSWORD}`);
    });
    console.log(`${'='.repeat(65)}\n`);
    console.log('💡 Login with email + password: Doctor@123');
    console.log('🔗 Go to /login and use any of the above emails\n');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
