const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'arogya_mitra_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

function formatUser(user) {
  const nameParts = user.name.split(' ');
  return {
    id: user.id,
    name: user.name,
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(' ') || '',
    email: user.email,
    role: user.role,
    age: user.age,
    gender: user.gender,
    preferredLanguage: user.language,
  };
}

// ── Register ──────────────────────────────────────────────────────────────────
// POST /api/users/register  — { name, email, password?, role? }
exports.simpleRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const validRoles = ['patient', 'doctor'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login instead.' });
    }

    // Hash password if provided; otherwise keep legacy marker
    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : 'simple_login';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to Arogya Mitra!',
      token: makeToken(user.id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
// POST /api/users/login  — { email OR username, password? }
exports.simpleLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const identifier = (email || username || '').trim();
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or username is required' });
    }

    // Try to find by email first, then by name prefix (username)
    let user = await prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });

    // If not found by email, try name-based username lookup
    // e.g. username "doctor1" maps to a user whose name starts with that or has a matching email prefix
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { startsWith: identifier.toLowerCase() + '@' } },
            { name: { equals: identifier, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email or username.' });
    }

    // ── Password check ──────────────────────────────────────────────────────
    // Case 1: user has a real bcrypt hash → verify password
    // Case 2: legacy simple_login marker → allow login without password (backward compat)
    if (user.password && user.password !== 'simple_login') {
      if (!password) {
        return res.status(401).json({ success: false, message: 'Password is required for this account.' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }
    }
    // If password is 'simple_login' we allow entry (legacy email-only mode)

    res.json({
      success: true,
      message: 'Login successful',
      token: makeToken(user.id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ── Profile ───────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, phone: true, age: true, gender: true, language: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const nameParts = user.name.split(' ');
    res.json({
      success: true,
      user: {
        ...user,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        preferredLanguage: user.language,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, age, gender, preferredLanguage } = req.body;
    const data = {};
    if (firstName || lastName) data.name = `${firstName || ''} ${lastName || ''}`.trim();
    if (phone) data.phone = phone;
    if (age) data.age = parseInt(age);
    if (gender) data.gender = gender;
    if (preferredLanguage) data.language = preferredLanguage;

    const user = await prisma.user.update({ where: { id: req.userId }, data });
    const nameParts = user.name.split(' ');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        preferredLanguage: user.language,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
