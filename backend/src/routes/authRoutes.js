const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Unified Session check
router.get('/me', authController.getMe);

// Customer Authentication endpoints
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);
router.post('/logout', authController.logout);

// Administrator Authentication endpoints
router.post('/admin/login', authController.postAdminLogin);
router.post('/admin/logout', authController.adminLogout);

module.exports = router;
