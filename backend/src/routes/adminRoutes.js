const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const adminController = require('../controllers/adminController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Configure Multer Disk Storage for Product/Category uploads (points to public/uploads)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // We resolve relative to public/uploads in the backend root
        cb(null, path.join(__dirname, '../../public/uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, jpeg, png, webp, gif) are allowed.'));
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Admin Dashboard Analytics
router.get('/dashboard', requireAdminAuth, adminController.getDashboard);

// Products CRUD Endpoints
router.get('/products', requireAdminAuth, adminController.getProducts);
router.post('/products/add', requireAdminAuth, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'extra_images', maxCount: 3 }
]), adminController.postAddProduct);
router.get('/products/edit/:id', requireAdminAuth, adminController.getEditProduct);
router.post('/products/edit/:id', requireAdminAuth, upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'extra_images', maxCount: 3 }
]), adminController.postEditProduct);
router.post('/products/delete/:id', requireAdminAuth, adminController.postDeleteProduct);
router.post('/products/delete-image/:imageId', requireAdminAuth, adminController.deleteProductImage);

// Banner Endpoints
router.get('/banners', requireAdminAuth, adminController.getBanners);
router.post('/banners/add', requireAdminAuth, upload.single('image'), adminController.postAddBanner);
router.post('/banners/edit/:id', requireAdminAuth, upload.single('image'), adminController.postEditBanner);
router.post('/banners/delete/:id', requireAdminAuth, adminController.postDeleteBanner);

// Category Endpoints
router.get('/categories', requireAdminAuth, adminController.getCategories);
router.post('/categories/add', requireAdminAuth, upload.single('image'), adminController.postAddCategory);
router.get('/categories/edit/:id', requireAdminAuth, adminController.getEditCategory);
router.post('/categories/edit/:id', requireAdminAuth, upload.single('image'), adminController.postEditCategory);
router.post('/categories/delete/:id', requireAdminAuth, adminController.postDeleteCategory);

// Orders Endpoints
router.get('/orders', requireAdminAuth, adminController.getOrders);
router.get('/orders/:id', requireAdminAuth, adminController.getOrderDetails);
router.post('/orders/:id/status', requireAdminAuth, adminController.postUpdateOrderStatus);

// Customers List Endpoint
router.get('/users', requireAdminAuth, adminController.getUsers);

// Inventory Quick Manage Endpoints
router.get('/inventory', requireAdminAuth, adminController.getInventory);
router.post('/inventory/update', requireAdminAuth, adminController.postUpdateStock);

// Settings Profile Update Endpoint
router.post('/settings/profile', requireAdminAuth, adminController.postUpdateProfile);

// Technical Inquiries Endpoints
router.get('/inquiries', requireAdminAuth, adminController.getInquiries);
router.post('/inquiries/delete/:id', requireAdminAuth, adminController.postDeleteInquiry);

module.exports = router;
