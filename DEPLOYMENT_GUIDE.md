# Arogya Mitra - Deployment & Configuration Guide

## Development Setup

### Prerequisites
- Node.js v14+ installed
- MySQL v8.0+ running locally or a cloud MySQL instance
- Git (optional)
- Code editor (VS Code recommended)

### Quick Start (Windows)

1. **Clone/Extract the project**
   ```bash
   cd "Arogya Mitra"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   copy .env.example .env
   ```
   
   Edit `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://root:your_password@localhost:3306/arogya_mitra"
   JWT_SECRET=your_very_secret_key_123!@#
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:3000
   ```

   Create database and push schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS arogya_mitra;"
   npx prisma db push
   npx prisma generate
   ```

   Start backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup (New Terminal)**
   ```bash
   cd frontend
   npm install
   npm start
   ```

---

## MySQL Setup

### Option 1: Local MySQL

1. **Install MySQL**
   - Windows: Download from https://dev.mysql.com/downloads/mysql/
   - Mac: `brew install mysql`
   - Linux: `sudo apt install mysql-server`

2. **Start MySQL**
   - Windows: MySQL runs as a service
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Create Database**
   ```sql
   CREATE DATABASE arogya_mitra;
   ```

4. **Push Schema**
   ```bash
   cd backend && npx prisma db push
   ```

### Option 2: Cloud MySQL (PlanetScale, Railway, Aiven)

1. Create account and get a MySQL connection URL
2. Update `.env`:
   ```env
   DATABASE_URL="mysql://user:password@host:port/database_name"
   ```
3. Push schema: `npx prisma db push`

---

## Environment Configuration

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development / production |
| DATABASE_URL | MySQL connection (Prisma) | mysql://root:password@localhost:3306/arogya_mitra |
| JWT_SECRET | Secret key for JWT | your_secret_key_here |
| JWT_EXPIRE | JWT expiration | 7d |
| CLIENT_URL | Frontend URL (CORS) | http://localhost:3000 |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

---

## Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db push` | Push schema to database |
| `npx prisma studio` | Visual database browser |
| `npx prisma migrate dev` | Create migration files |

---

## Docker Deployment

### Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: arogya_mitra

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: mysql://root:password@mysql:3306/arogya_mitra
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"

volumes:
  mysql_data:
```

Run: `docker-compose up -d`

---

## Troubleshooting

### MySQL Connection Issues
- Check MySQL is running: `mysql -u root -p`
- Verify DATABASE_URL in .env
- Ensure database exists: `CREATE DATABASE arogya_mitra;`

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to sync tables

### CORS Errors
- Ensure CLIENT_URL matches your frontend URL
- Clear browser cache

---

## Resources

- MySQL Docs: https://dev.mysql.com/doc/
- Prisma Docs: https://www.prisma.io/docs
- Express Docs: https://expressjs.com/
- React Docs: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

---

Built with ❤️ for better healthcare
