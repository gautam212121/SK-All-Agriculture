# SK Agriculture Parts - Full-Stack E-Commerce Platform

A modern decoupled Node.js + Next.js e-commerce store for agricultural parts and equipment.

## 🎯 Project Overview

- **Backend**: Express.js REST API with MySQL database
- **Frontend**: Next.js 16 with React 19
- **Features**: Product catalog, shopping cart, user authentication, admin dashboard, inquiries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 5.7+ (or MariaDB)
- npm or yarn

### Local Development Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure .env file (update with your MySQL credentials)
# Edit .env and update DB_PASS to match your MySQL password

# Start backend server
npm run dev  # Runs on http://localhost:3001
```

#### 2. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev  # Runs on http://localhost:3000
```

#### 3. Database Setup
The database will auto-initialize on first backend startup. If needed, manually initialize:
```bash
# Option 1: Using command line
mysql -u root -p agri_parts_db < database.sql

# Option 2: Using MySQL Workbench or similar GUI
# 1. Create database: agri_parts_db
# 2. Import database.sql
```

#### 4. Access Application
- **Customer Store**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Default Admin**: username: `admin` | password: `admin123`

## 📁 Project Structure

```
backend/
├── server.js                 # Main Express server
├── package.json
├── .env                      # Environment variables (don't commit!)
├── database.sql              # Database schema
└── src/
    ├── config/
    │   └── db.js            # Database connection & initialization
    ├── controllers/          # Business logic
    ├── routes/              # API endpoints
    └── middleware/          # Authentication, CORS, etc.

frontend/
├── package.json
├── next.config.mjs         # Next.js configuration
├── app/
│   ├── layout.js           # Root layout
│   ├── page.js             # Homepage
│   ├── shop/               # Shop listing
│   ├── product/            # Product details
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout page
│   ├── orders/             # Order history
│   ├── admin/              # Admin dashboard
│   └── ...                 # Other pages
├── components/            # Reusable React components
├── context/              # React Context (AppContext)
└── lib/                  # Utilities
```

## 🔐 Security & Environment

### Development Environment (.env)
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
FRONTEND_URL=http://localhost:3000
```

### Production Environment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Security hardening
- Environment configuration
- Deployment procedures
- Monitoring setup

## 📋 API Endpoints

### Public Endpoints
- `GET /api/banners` - Homepage banners
- `GET /api/home` - Homepage data (categories, products)
- `GET /api/products` - Product listing with filters
- `GET /api/products/:slug` - Product details
- `GET /api/categories` - All categories
- `POST /api/inquiries` - Submit inquiry

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/logout` - Customer logout
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Check current session

### Cart & Orders (Auth Required)
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `POST /api/checkout` - Place order
- `GET /api/orders` - Get user's orders

## 🛠️ Development Tasks

### Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Build Production
```bash
# Backend (no build needed)
# Frontend
cd frontend && npm run build
```

### Run Tests
```bash
# Frontend linting
cd frontend && npm run lint
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL is running
- Check DB_HOST, DB_USER, DB_PASS in .env
- Verify database `agri_parts_db` exists

### CORS Error in Browser Console
- Check FRONTEND_URL matches your frontend domain
- Verify backend is running on correct port
- Ensure credentials are sent with fetch requests

### Frontend Can't Connect to API
- Verify backend is running: `curl http://localhost:3001/api/auth/me`
- Check Next.js rewrites in `next.config.mjs`
- Ensure both dev servers are running

## 📦 Dependencies

### Backend
- express - Web framework
- mysql2 - MySQL driver
- bcryptjs - Password hashing
- express-session - Session management
- multer - File uploads
- dotenv - Environment configuration

### Frontend
- next - React framework
- react - UI library
- react-dom - DOM rendering

## 📝 License
Proprietary - SK Agriculture Parts

---

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
