require('dotenv').config();
const prisma = require('./src/lib/prisma');

const testPatients = [
  { name: 'Rahul Sharma',   email: 'rahul.patient@test.com',  age: 28, gender: 'M' },
  { name: 'Priya Gupta',    email: 'priya.patient@test.com',  age: 32, gender: 'F' },
  { name: 'Amit Kumar',     email: 'amit.patient@test.com',   age: 45, gender: 'M' },
];

async function seedPatients() {
  console.log('🌱 Seeding test patient accounts...\n');
  for (const p of testPatients) {
    const existing = await prisma.user.findUnique({ where: { email: p.email } });
    if (existing) {
      console.log(`⏭️  ${p.name} already exists`);
      continue;
    }
    await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        password: 'simple_login',   // email-only login (no password needed)
        role: 'patient',
        age: p.age,
        gender: p.gender,
      },
    });
    console.log(`✅ Created patient: ${p.name}  (${p.email})`);
  }

  console.log('\n========================================');
  console.log('✨ Patient accounts ready!\n');
  console.log('EMAIL                          PASSWORD');
  console.log('----------------------------------------');
  testPatients.forEach(p => {
    console.log(`${p.email.padEnd(35)} (none — email only)`);
  });
  console.log('========================================');
  console.log('💡 Login with email, leave password BLANK\n');
  await prisma.$disconnect();
}

seedPatients().catch(e => { console.error(e); process.exit(1); });
