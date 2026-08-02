const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Parse the DATABASE_URL manually and pass mariadb driver options as object
// This is needed for MySQL 8 which requires allowPublicKeyRetrieval for RSA auth.
const url = new URL(process.env.DATABASE_URL || 'mysql://root@localhost:3306/arogya_mitra');

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  allowPublicKeyRetrieval: true,
  ssl: false,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
