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

// 3. Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'agri_parts_decoupled_secure_secret_key_2026',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 Hours
        secure: false // Set to true if running HTTPS
    }
}));

// 4. Mount API Routes
const authRoutes = require('./src/routes/authRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminRoutes);

// 5. Host Static Files
// A. Serve backend uploads (images) at /uploads/...
app.use(express.static(path.join(__dirname, 'public')));

// B. Serve the frontend static client folder at the root /
// Going up one level from backend/ reaches project root, where frontend/ lives
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle client-side routing fallback (serve index.html for undefined HTML requests, 
// letting the frontend handle page routing or show its own 404)
app.use((req, res, next) => {
    // If request is looking for an API route, return JSON 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API Endpoint Not Found.' });
    }
    // Else fallback to serving frontend index.html
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 6. Launch Server
async function startServer() {
    console.log('Initializing database connection...');
    await initializeDatabase();

    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚜 SK All Agriculture Parts Decoupled API Server running on port ${PORT}`);
        console.log(`🔗 Frontend Storefront: http://localhost:${PORT}`);
        console.log(`🔗 Frontend Admin Dashboard: http://localhost:${PORT}/admin/dashboard.html`);
        console.log(`🛠️ Default Admin: username: admin | password: admin123`);
        console.log(`=======================================================`);
    });
}

startServer();

