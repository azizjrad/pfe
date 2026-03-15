# 🚀 PFE - Vehicle Rental Management System - Setup Guide

## 📋 Prerequisites

Before starting, ensure you have installed:

- **PHP 8.1+** (Check: `php -v`)
- **Composer** (Check: `composer -V`)
- **Node.js 18+** (Check: `node -v`)
- **MySQL/MariaDB** (XAMPP recommended for Windows)
- **Git**

---

## 🔧 Installation Steps

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/azizjrad/pfe.git
cd pfe
```

### 2️⃣ Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Create environment file
copy .env.example .env

# Generate application key
php artisan key:generate
```

**Configure Database:**

Edit `backend/.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pfe_rental
DB_USERNAME=root
DB_PASSWORD=
```

**Create Database:**

Open MySQL and run:

```sql
CREATE DATABASE pfe_rental;
```

**Run Migrations:**

```bash
php artisan migrate
```

**Start Laravel Server:**

```bash
php artisan serve
```

Backend will run on: `http://localhost:8000`

---

### 3️⃣ Frontend Setup (React + Vite + Tailwind)

Open a new terminal:

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🗂️ Database Structure

The system includes 9 migrations:

1. **users** - Clients and admins (3-tier role system)
2. **agencies** - Rental branch locations
3. **categories** - Vehicle classifications
4. **vehicles** - Fleet inventory
5. **reservations** - Booking records with financial tracking
6. **payments** - Complex payment management (cash, cheque, installments)
7. **returns** - Vehicle inspection records
8. **client_reliability_scores** - Internal risk assessment (E-CRM)
9. **pricing_rules** - Dynamic pricing automation

---

## 👥 User Roles

- **client** - Regular customers who rent vehicles
- **agency_admin** - Branch managers (see only their agency's data)
- **super_admin** - Platform owner (see all agencies)

---

## 🧪 Test the Setup

1. **Backend test:** Visit `http://localhost:8000` - should see Laravel welcome page
2. **Frontend test:** Visit `http://localhost:5173` - should see Vite app
3. **Database test:** Run `php artisan migrate:status` - should show all migrations completed

---

## 🐛 Common Issues

### Issue: "Class 'PDO' not found"

**Solution:** Enable PHP extensions in `php.ini`:

```ini
extension=pdo_mysql
extension=openssl
extension=mbstring
```

### Issue: "SQLSTATE[HY000] [1045] Access denied"

**Solution:** Check MySQL credentials in `.env` file

### Issue: npm install fails

**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Issue: Port already in use

**Solution:**

- Laravel: `php artisan serve --port=8001`
- Vite: Change port in `vite.config.js`

---

## 📞 Support

If you encounter issues, contact your binôme or check Laravel/Vite documentation.

---

## 📝 Next Steps After Setup

1. Review database schema in `backend/database/migrations/`
2. Create seeders for sample data
3. Build API endpoints with role-based access control
4. Design frontend components for each user role
5. Implement authentication system

---

**Good luck with the PFE! 🎓**
