#!/usr/bin/env node

/**
 * Project Validation Script
 * Checks if all systems are ready for public deployment
 */

const fs = require('fs');
const path = require('path');

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

function checkFile(filePath, name) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        checks.passed.push(`✅ ${name}`);
        return true;
    } else {
        checks.failed.push(`❌ ${name} (missing: ${filePath})`);
        return false;
    }
}

function checkEnvVar(filename) {
    const fullPath = path.join(__dirname, filename);
    if (!fs.existsSync(fullPath)) {
        checks.warnings.push(`⚠️  ${filename} not found (use .env.example as template)`);
        return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('your_password_here') || content.includes('localhost')) {
        checks.warnings.push(`⚠️  ${filename} contains placeholder values - update for production`);
    }
    checks.passed.push(`✅ ${filename} exists`);
    return true;
}

console.log('\n🔍 SK Agriculture Parts - Project Validation\n');

// 1. Check Backend Files
console.log('📦 Checking Backend Files...');
checkFile('backend/server.js', 'Backend server.js');
checkFile('backend/package.json', 'Backend package.json');
checkFile('backend/database.sql', 'Database schema');
checkFile('backend/src/config/db.js', 'Database config');
checkFile('backend/src/controllers/authController.js', 'Auth controller');
checkFile('backend/src/controllers/productController.js', 'Product controller');
checkFile('backend/src/routes/authRoutes.js', 'Auth routes');
checkFile('backend/src/routes/shopRoutes.js', 'Shop routes');
checkFile('backend/src/middleware/authMiddleware.js', 'Auth middleware');

// 2. Check Frontend Files
console.log('\n📱 Checking Frontend Files...');
checkFile('frontend/next.config.mjs', 'Next.js config');
checkFile('frontend/package.json', 'Frontend package.json');
checkFile('frontend/app/layout.js', 'Root layout');
checkFile('frontend/app/page.js', 'Homepage');
checkFile('frontend/components/Header.js', 'Header component');
checkFile('frontend/context/AppContext.js', 'App context');

// 3. Check Configuration
console.log('\n⚙️  Checking Configuration Files...');
checkEnvVar('backend/.env');
checkFile('frontend/.env.local', 'Frontend .env.local');
checkFile('.env.example', '.env example template');

// 4. Check Documentation
console.log('\n📚 Checking Documentation...');
checkFile('README.md', 'README');
checkFile('DEPLOYMENT_GUIDE.md', 'Deployment guide');
checkFile('.gitignore', '.gitignore');

// 5. Dependency Check
console.log('\n📋 Checking Dependencies...');
if (fs.existsSync('backend/node_modules')) {
    checks.passed.push('✅ Backend dependencies installed');
} else {
    checks.warnings.push('⚠️  Backend dependencies not installed (run: cd backend && npm install)');
}

if (fs.existsSync('frontend/node_modules')) {
    checks.passed.push('✅ Frontend dependencies installed');
} else {
    checks.warnings.push('⚠️  Frontend dependencies not installed (run: cd frontend && npm install)');
}

// 6. Security Checks
console.log('\n🔐 Security Checks...');
const envContent = fs.readFileSync(path.join(__dirname, 'backend/.env'), 'utf8');
if (!envContent.includes('NODE_ENV=production')) {
    checks.passed.push('✅ NODE_ENV defaults to development');
}
if (!envContent.includes('SESSION_SECRET=agri_parts')) {
    checks.passed.push('✅ SESSION_SECRET is not hardcoded');
} else {
    checks.failed.push('❌ Hardcoded SESSION_SECRET found in .env');
}

// Results Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION RESULTS');
console.log('='.repeat(50));

if (checks.passed.length > 0) {
    console.log('\n✅ PASSED (' + checks.passed.length + '):');
    checks.passed.slice(0, 5).forEach(c => console.log('  ' + c));
    if (checks.passed.length > 5) {
        console.log('  ... and ' + (checks.passed.length - 5) + ' more');
    }
}

if (checks.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + checks.warnings.length + '):');
    checks.warnings.forEach(c => console.log('  ' + c));
}

if (checks.failed.length > 0) {
    console.log('\n❌ FAILED (' + checks.failed.length + '):');
    checks.failed.forEach(c => console.log('  ' + c));
}

console.log('\n' + '='.repeat(50));

// Overall Status
if (checks.failed.length === 0) {
    console.log('\n✨ Project is READY for development!');
    console.log('Next steps:');
    console.log('  1. cd backend && npm run dev');
    console.log('  2. cd frontend && npm run dev (in new terminal)');
    console.log('  3. Open http://localhost:3000');
} else {
    console.log('\n⛔ Please fix the failed checks above before proceeding.');
    process.exit(1);
}

console.log('\n');
