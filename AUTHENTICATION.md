# Arogya Mitra - Authentication System Documentation

## Overview

Arogya Mitra implements a JWT-based authentication system with bcrypt password hashing, MySQL storage via Prisma ORM, and comprehensive user profile management.

---

## 🔐 Authentication Architecture

### Technology Stack
- **JWT (JSON Web Tokens)**: Stateless token-based authentication
- **Bcryptjs**: Industry-standard password hashing with salt rounds
- **MySQL + Prisma ORM**: Relational user data persistence
- **Express.js**: Backend API with middleware
- **React**: Frontend with localStorage token management

---

## 📋 User Data Storage

### User Table Schema (MySQL via Prisma)

```sql
CREATE TABLE User (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  phone       VARCHAR(255),
  age         INT,
  gender      VARCHAR(255),
  language    VARCHAR(255) DEFAULT 'English',
  role        VARCHAR(255) DEFAULT 'patient',
  createdAt   DATETIME     DEFAULT NOW(),
  updatedAt   DATETIME     ON UPDATE NOW(),
  INDEX(email)
);
```

---

## 🔒 Security Features

### 1. Password Hashing

- Uses `bcryptjs` with 10 salt rounds
- Passwords are hashed before storage in MySQL
- Original passwords are never stored

```javascript
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### 2. JWT Authentication

**Payload Contains:**
- `id`: User's auto-increment integer ID
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (default: 7 days)

```javascript
const token = jwt.sign(
  { id: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

### 3. Request Authentication Middleware

```javascript
exports.authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  req.userId = decoded.id;
  req.userRole = user.role;
  next();
};
```

### 4. Password Requirements
- Minimum length: 6 characters
- Validated at registration
- Confirmation required during signup

### 5. Input Validation
- Email format verified using `validator.js`
- Phone number required
- Age validated (1-150)
- Language code mapping (en→English, hi→Hindi, kn→Kannada)

---

## 🚀 Authentication Flow

### Registration Flow

1. **User Submits Form** → `POST /api/users/register`
2. **Backend validates** all fields, checks email uniqueness
3. **Password hashed** with bcrypt (10 salt rounds)
4. **User created** in MySQL via Prisma
5. **JWT generated** with user.id
6. **Response** includes token + user data (password excluded)

### Login Flow

1. **User submits credentials** → `POST /api/users/login`
2. **Find user** by email in MySQL via Prisma
3. **Compare password** with bcrypt
4. **Generate JWT** token
5. **Response** includes token + user data

### Protected Request Flow

1. Client sends `Authorization: Bearer <token>`
2. Middleware extracts and verifies token
3. Verifies user still exists in database
4. Attaches userId and userRole to request
5. Route handler processes authenticated request

---

## 📱 Frontend Integration

### Token Storage
```javascript
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### Token Usage (Axios Interceptor)
```javascript
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### Logout
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## 🔑 Environment Variables

```env
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=7d
DATABASE_URL="mysql://root:password@localhost:3306/arogya_mitra"
NODE_ENV=development
```

---

## 🧪 Testing Authentication

### Test Registration
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "testpass123",
    "phone": "9876543210",
    "age": 25,
    "gender": "male",
    "preferredLanguage": "en"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚠️ Security Best Practices

### Do's ✅
- Use HTTPS in production
- Store JWT_SECRET securely
- Validate all inputs server-side
- Hash passwords with bcrypt
- Use strong JWT_SECRET (32+ characters)
- Rotate secrets regularly

### Don'ts ❌
- Don't commit .env file
- Don't store passwords in plaintext
- Don't expose JWT_SECRET in code
- Don't store sensitive data in JWT payload
- Don't disable CORS validation

---

## 📚 Resources

- JWT.io: https://jwt.io/
- Bcryptjs: https://www.npmjs.com/package/bcryptjs
- Prisma Docs: https://www.prisma.io/docs
- OWASP Auth Cheat Sheet: https://cheatsheetseries.owasp.org/

---

Built with security in mind for healthcare applications.
