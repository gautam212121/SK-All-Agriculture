const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { requireUserAuth } = require('../middleware/authMiddleware');
const { query } = require('../config/db');

// --- PUBLIC CATALOG ENDPOINTS ---
// Get active banners for homepage
router.get('/banners', productController.getBanners);
// Get home feeds (categories + popular + new arrivals)
router.get('/home', productController.getHome);
// Get shop list (filters, brands, categories, search, sorting)
router.get('/products', productController.getShop);
// Get single category items
router.get('/categories/:slug', productController.getCategory);
// Get single product details (with specs and related recommendation parts)
router.get('/products/:slug', productController.getProductDetails);
// Get all categories list
router.get('/categories', async (req, res) => {
    try {
        const categories = await query('SELECT * FROM categories');
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});

// Submit Technical Inquiry
router.post('/inquiries', async (req, res) => {
    const { name, phone, machine, message } = req.body;
    if (!name || !phone || !message) {
        return res.status(400).json({ success: false, message: 'Name, phone, and message are required.' });
    }
    try {
        await query(
            'INSERT INTO inquiries (name, phone, machine, message) VALUES (?, ?, ?, ?)',
            [name, phone, machine || null, message]
        );
        res.json({ success: true, message: 'Your inquiry has been received. Our engineer will contact you shortly!' });
    } catch (error) {
        console.error('Inquiry API error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit inquiry.' });
    }
});

// --- SHOPPING CART ENDPOINTS ---
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateCart);
router.post('/cart/remove', cartController.removeFromCart);

// --- TRANSACTIONAL CHECKOUT & ORDER ENDPOINTS (CUSTOMER AUTH REQUIRED) ---
router.get('/checkout', requireUserAuth, orderController.getCheckout);
router.post('/checkout', requireUserAuth, orderController.postCheckout);
router.get('/orders/last-success', orderController.getLastSuccess);
router.get('/orders', requireUserAuth, orderController.getMyOrders);
router.get('/orders/:id', requireUserAuth, orderController.getOrderDetails);

// --- PROFILE & ADDRESS BOOK ENDPOINTS (CUSTOMER AUTH REQUIRED) ---
// Get profile info and address book
router.get('/profile', requireUserAuth, async (req, res) => {
    try {
        const addresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.session.user.id]);
        res.json({
            success: true,
            user: req.session.user,
            addresses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load profile address book.' });
    }
});

// Add Address from Profile
router.post('/profile/address/add', requireUserAuth, async (req, res) => {
    const { recipient_name, phone, address_line, city, state, pincode } = req.body;
    if (!recipient_name || !phone || !address_line || !city || !state || !pincode) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    try {
        await query(
            'INSERT INTO addresses (user_id, recipient_name, phone, address_line, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.session.user.id, recipient_name, phone, address_line, city, state, pincode]
        );
        res.json({ success: true, message: 'Address saved successfully!' });
    } catch (error) {
        console.error('Add Address API error:', error);
        res.status(500).json({ success: false, message: 'Failed to save address.' });
    }
});

// Delete Address from Profile
router.post('/profile/address/delete/:id', requireUserAuth, async (req, res) => {
    try {
        await query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.session.user.id]);
        res.json({ success: true, message: 'Address removed successfully!' });
    } catch (error) {
        console.error('Delete Address API error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address.' });
    }
});

module.exports = router;
