const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const { initializeDatabase } = require('./src/config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Ensure backend/public/uploads directory exists for Multer uploads
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created backend/public/uploads directory.');
}

// Write mock SVG image files for seed categories & products to prevent 404s
const defaultImages = [
    { name: 'cat-yoke.png', color: '#1B4D3E' },
    { name: 'cat-ujoint.png', color: '#2C5E43' },
    { name: 'cat-ptoshaft.png', color: '#3A6F4E' },
    { name: 'cat-bladeholder.png', color: '#4E8A64' },
    { name: 'cat-gears.png', color: '#153A2D' },
    { name: 'cat-bearings.png', color: '#1D4536' },
    { name: 'cat-couplings.png', color: '#275240' },
    { name: 'cat-tractor.png', color: '#E5A93C' },
    { name: 'cat-hardware.png', color: '#3E5C76' },
    { name: 'prod-ujk.png', color: '#1B4D3E' },
    { name: 'prod-yoke.png', color: '#E5A93C' },
    { name: 'prod-cross.png', color: '#2C5E43' },
    { name: 'prod-bolts.png', color: '#3E5C76' },
    { name: 'prod-clutch.png', color: '#A53C3C' }
];

defaultImages.forEach(img => {
    const imgPath = path.join(uploadsDir, img.name);
    if (!fs.existsSync(imgPath)) {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
            <rect width="100%" height="100%" fill="${img.color}"/>
            <circle cx="200" cy="130" r="60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
            <path d="M150,130 L250,130 M200,80 L200,180" stroke="rgba(255,255,255,0.4)" stroke-width="6" stroke-linecap="round"/>
            <text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${img.name.replace('cat-', '').replace('prod-', '').replace('.png', '').toUpperCase()}</text>
            <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="12" fill="rgba(255,255,255,0.6)">SK Agriculture Parts Premium Spare Parts</text>
        </svg>`;
        fs.writeFileSync(imgPath.replace('.png', '.svg'), svgContent);
        fs.writeFileSync(imgPath, svgContent);
    }
});

// 2. Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Improved CORS Middleware for secure cross-domain requests
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000', 'http://localhost:5076'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Trust proxy for secure cookies in production (Render, Heroku, etc.)
app.set('trust proxy', 1);

// 3. Session Configuration
const isProd = process.env.NODE_ENV === 'production';
if (!process.env.SESSION_SECRET && isProd) {
    console.error('❌ CRITICAL: SESSION_SECRET environment variable is not set in production!');
    process.exit(1);
}
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 Hours
        secure: isProd, // Must be true in production to allow SameSite=None
        httpOnly: true, // Prevent XSS attacks
        sameSite: isProd ? 'none' : 'lax' // Required for cross-domain cookies
    }
}));

// 4. Mount API Routes
const authRoutes = require('./src/routes/authRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint (for monitoring and load balancers)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 5. Host Static Files
// A. Serve backend uploads (images) at /uploads/...
app.use(express.static(path.join(__dirname, 'public')));

// B. Redirect stale static-admin URLs to the decoupled Next.js frontend routes.
app.get('/admin/dashboard.html', (req, res) => {
    res.redirect(302, `${frontendUrl}/admin`);
});

// Handle unknown routes. The Next.js frontend runs separately in development.
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API Endpoint Not Found.' });
    }
    res.status(404).json({
        success: false,
        message: 'Frontend is served by the Next.js app.',
        frontendUrl
    });
});

// 6. Launch Server
async function startServer() {
    console.log('Initializing database connection...');
    await initializeDatabase();

    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(` SK All Agriculture Parts Decoupled API Server running on port ${PORT}`);
        console.log(` Frontend Storefront: ${frontendUrl}`);
        console.log(` Frontend Admin Dashboard: ${frontendUrl}/admin`);
        console.log(` Default Admin: username: admin | password: admin123`);
        console.log(`=======================================================`);
    });
}

startServer();
