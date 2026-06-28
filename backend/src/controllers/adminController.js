const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Helper to generate slugs
function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/&/g, '-and-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// 1. Dashboard Analytics
exports.getDashboard = async (req, res) => {
    try {
        const salesResult = await query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'DELIVERED'");
        const totalSales = salesResult[0].total || 0;

        const orderCountResult = await query("SELECT COUNT(*) as count FROM orders");
        const totalOrders = orderCountResult[0].count;

        const pendingResult = await query("SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'");
        const pendingOrders = pendingResult[0].count;

        const outOfStockResult = await query("SELECT COUNT(*) as count FROM products WHERE stock = 0");
        const outOfStockCount = outOfStockResult[0].count;

        const userCountResult = await query("SELECT COUNT(*) as count FROM users");
        const totalUsers = userCountResult[0].count;

        const recentOrders = await query(
            `SELECT o.*, u.name as user_name 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC LIMIT 5`
        );

        res.json({
            success: true,
            analytics: {
                totalSales: parseFloat(totalSales),
                totalOrders,
                pendingOrders,
                outOfStockCount,
                totalUsers
            },
            recentOrders
        });
    } catch (error) {
        console.error('Admin Dashboard API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading dashboard analytics.' });
    }
};

// 2. Products List
exports.getProducts = async (req, res) => {
    try {
        const products = await query(
            `SELECT p.*, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             ORDER BY p.id DESC`
        );
        res.json({ success: true, products });
    } catch (error) {
        console.error('Admin products list API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading products list.' });
    }
};

// 3. Handle Add Product Submit
exports.postAddProduct = async (req, res) => {
    const {
        name, brand, category_id, sku, price, discount_price, stock,
        short_description, description, material, weight, compatible_model,
        part_usage, quality_type, warranty, is_active
    } = req.body;

    try {
        if (!req.files || !req.files['main_image']) {
            return res.status(400).json({ success: false, message: 'Product main image is required.' });
        }

        const mainImagePath = '/uploads/' + req.files['main_image'][0].filename;
        const slug = slugify(name) + '-' + sku.toLowerCase();

        const existingSKU = await query('SELECT id FROM products WHERE sku = ?', [sku]);
        if (existingSKU.length > 0) {
            return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
        }

        const result = await query(
            `INSERT INTO products 
             (category_id, name, slug, brand, sku, price, discount_price, stock, short_description, description, main_image, material, weight, compatible_model, part_usage, quality_type, warranty, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name, slug, brand, sku, price, 
                discount_price ? parseFloat(discount_price) : null, 
                stock, short_description, description, mainImagePath, 
                material, weight, compatible_model, part_usage, 
                quality_type, warranty || null, is_active === 'on' || is_active === '1' || is_active === true ? 1 : 0
            ]
        );

        const productId = result.insertId;

        if (req.files['extra_images']) {
            for (const file of req.files['extra_images']) {
                const imgPath = '/uploads/' + file.filename;
                await query(
                    'INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)',
                    [productId, imgPath, 'extra']
                );
            }
        }

        res.json({ success: true, message: 'Spare part added successfully!', productId });

    } catch (error) {
        console.error('Add Product API error:', error);
        res.status(500).json({ success: false, message: 'Failed to save product. Error: ' + error.message });
    }
};

// 4. Retrieve single product details for edit form
exports.getEditProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        const categories = await query('SELECT * FROM categories');
        const extraImages = await query('SELECT * FROM product_images WHERE product_id = ?', [id]);

        res.json({ 
            success: true, 
            product, 
            categories, 
            extraImages 
        });

    } catch (error) {
        console.error('Get Edit Product API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading product details.' });
    }
};

// 5. Handle Edit Product Submit
exports.postEditProduct = async (req, res) => {
    const { id } = req.params;
    const {
        name, brand, category_id, sku, price, discount_price, stock,
        short_description, description, material, weight, compatible_model,
        part_usage, quality_type, warranty, is_active
    } = req.body;

    try {
        const products = await query('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        let mainImagePath = product.main_image;

        if (req.files && req.files['main_image']) {
            mainImagePath = '/uploads/' + req.files['main_image'][0].filename;
            const oldPath = path.join(__dirname, '../public', product.main_image);
            if (fs.existsSync(oldPath) && product.main_image.startsWith('/uploads/')) {
                try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Old image unlink failed:', e.message); }
            }
        }

        const slug = slugify(name) + '-' + sku.toLowerCase();

        await query(
            `UPDATE products SET 
                category_id = ?, name = ?, slug = ?, brand = ?, sku = ?, price = ?, 
                discount_price = ?, stock = ?, short_description = ?, description = ?, 
                main_image = ?, material = ?, weight = ?, compatible_model = ?, 
                part_usage = ?, quality_type = ?, warranty = ?, is_active = ? 
             WHERE id = ?`,
            [
                category_id, name, slug, brand, sku, price, 
                discount_price ? parseFloat(discount_price) : null, 
                stock, short_description, description, mainImagePath, 
                material, weight, compatible_model, part_usage, 
                quality_type, warranty || null, is_active === 'on' || is_active === '1' || is_active === true ? 1 : 0,
                id
            ]
        );

        if (req.files && req.files['extra_images']) {
            for (const file of req.files['extra_images']) {
                const imgPath = '/uploads/' + file.filename;
                await query(
                    'INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)',
                    [id, imgPath, 'extra']
                );
            }
        }

        res.json({ success: true, message: 'Spare part updated successfully!' });

    } catch (error) {
        console.error('Edit Product API error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product. Error: ' + error.message });
    }
};

// 6. Delete Product
exports.postDeleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const products = await query('SELECT main_image FROM products WHERE id = ?', [id]);
        if (products.length > 0) {
            const product = products[0];
            const imagePath = path.join(__dirname, '../public', product.main_image);
            if (fs.existsSync(imagePath) && product.main_image.startsWith('/uploads/')) {
                try { fs.unlinkSync(imagePath); } catch (e) {}
            }

            const extraImages = await query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
            for (const img of extraImages) {
                const extraPath = path.join(__dirname, '../public', img.image_url);
                if (fs.existsSync(extraPath) && img.image_url.startsWith('/uploads/')) {
                    try { fs.unlinkSync(extraPath); } catch (e) {}
                }
            }

            await query('DELETE FROM products WHERE id = ?', [id]);
        }
        res.json({ success: true, message: 'Spare part deleted successfully.' });
    } catch (error) {
        console.error('Delete Product API error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting product.' });
    }
};

// 7. Categories list
exports.getCategories = async (req, res) => {
    try {
        const categories = await query(
            `SELECT c.*, COUNT(p.id) as product_count 
             FROM categories c 
             LEFT JOIN products p ON c.id = p.category_id 
             GROUP BY c.id 
             ORDER BY c.id DESC`
        );
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Categories API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading categories.' });
    }
};

// 8. Add Category
exports.postAddCategory = async (req, res) => {
    const { name, description } = req.body;
    try {
        let imagePath = '/uploads/cat-default.png';
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        }

        const slug = slugify(name);
        
        const existingCat = await query('SELECT id FROM categories WHERE slug = ?', [slug]);
        if (existingCat.length > 0) {
            return res.status(400).json({ success: false, message: 'A category with a similar name already exists.' });
        }

        await query(
            'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
            [name, slug, description, imagePath]
        );

        res.json({ success: true, message: 'Category added successfully!' });

    } catch (error) {
        console.error('Add Category API error:', error);
        res.status(500).json({ success: false, message: 'Server error creating category.' });
    }
};

// 8b. Retrieve single category details for edit
exports.getEditCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.json({ success: true, category: categories[0] });
    } catch (error) {
        console.error('Get Edit Category API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading category details.' });
    }
};

// 8c. Handle Edit Category Submit
exports.postEditCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        const category = categories[0];
        let imagePath = category.image;

        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
            const oldPath = path.join(__dirname, '../../public', category.image);
            if (fs.existsSync(oldPath) && category.image.startsWith('/uploads/') && !category.image.includes('cat-default.png')) {
                try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Old category image unlink failed:', e.message); }
            }
        }

        const slug = slugify(name);

        await query(
            'UPDATE categories SET name = ?, slug = ?, description = ?, image = ? WHERE id = ?',
            [name, slug, description, imagePath, id]
        );

        res.json({ success: true, message: 'Category division updated successfully!' });
    } catch (error) {
        console.error('Edit Category API error:', error);
        res.status(500).json({ success: false, message: 'Server error updating category. Error: ' + error.message });
    }
};

// 8d. Delete Category
exports.postDeleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await query('SELECT image FROM categories WHERE id = ?', [id]);
        if (categories.length > 0) {
            const category = categories[0];
            const imagePath = path.join(__dirname, '../../public', category.image);
            if (fs.existsSync(imagePath) && category.image.startsWith('/uploads/') && !category.image.includes('cat-default.png')) {
                try { fs.unlinkSync(imagePath); } catch (e) {}
            }

            // Delete category (this will cascade delete products in it due to FOREIGN KEY ON DELETE CASCADE!)
            await query('DELETE FROM categories WHERE id = ?', [id]);
        }
        res.json({ success: true, message: 'Category division and all its products deleted successfully.' });
    } catch (error) {
        console.error('Delete Category API error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting category.' });
    }
};

// 9. Orders List
exports.getOrders = async (req, res) => {
    try {
        const orders = await query(
            `SELECT o.*, u.name as user_name 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             ORDER BY o.created_at DESC`
        );
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Orders List API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading order logs.' });
    }
};

// 10. Order Details (Admin view)
exports.getOrderDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const orderResult = await query(
            `SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [id]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const order = orderResult[0];

        const items = await query(
            `SELECT oi.*, p.name, p.brand, p.sku, p.main_image 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [id]
        );

        res.json({ success: true, order, items });

    } catch (error) {
        console.error('Admin Order Details API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading order details.' });
    }
};

// 11. Update Order Status
exports.postUpdateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    try {
        await query(
            'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
            [status, payment_status, id]
        );
        res.json({ success: true, message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Update Order Status API error:', error);
        res.status(500).json({ success: false, message: 'Server error updating order status.' });
    }
};

// 12. Customers List
exports.getUsers = async (req, res) => {
    try {
        const users = await query(
            `SELECT u.*, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent 
             FROM users u 
             LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'DELIVERED'
             GROUP BY u.id 
             ORDER BY u.id DESC`
        );
        res.json({ success: true, users });
    } catch (error) {
        console.error('Admin Customers List API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading customers database.' });
    }
};

// 13. Inventory List
exports.getInventory = async (req, res) => {
    try {
        const products = await query(
            `SELECT p.id, p.name, p.brand, p.sku, p.stock, p.price, c.name as category_name 
             FROM products p 
             JOIN categories c ON p.category_id = c.id 
             ORDER BY p.stock ASC`
        );
        res.json({ success: true, products });
    } catch (error) {
        console.error('Inventory List API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading inventory list.' });
    }
};

// 14. Quick Stock Update (AJAX save)
exports.postUpdateStock = async (req, res) => {
    const { id, stock } = req.body;
    try {
        await query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
        res.json({ success: true, message: 'Stock level updated successfully.' });
    } catch (error) {
        console.error('Quick Stock Update API error:', error);
        res.status(500).json({ success: false, message: 'Failed to update stock.' });
    }
};

// 15. Settings Profile Update
exports.postUpdateProfile = async (req, res) => {
    const { name, email, password } = req.body;
    const adminId = req.session.admin.id;

    try {
        let sql = 'UPDATE admins SET name = ?, email = ?';
        const params = [name, email];

        if (password && password.trim().length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password = ?';
            params.push(hashedPassword);
        }

        sql += ' WHERE id = ?';
        params.push(adminId);

        await query(sql, params);

        // Sync active session
        req.session.admin.name = name;
        req.session.admin.email = email;

        res.json({ success: true, message: 'Profile updated successfully!', admin: req.session.admin });

    } catch (error) {
        console.error('Admin Profile Update API error:', error);
        res.status(500).json({ success: false, message: 'Failed to update administrative settings.' });
    }
};

// 16. Get Technical Inquiries List
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await query('SELECT * FROM inquiries ORDER BY id DESC');
        res.json({ success: true, inquiries });
    } catch (error) {
        console.error('Get Inquiries API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading inquiries.' });
    }
};

// 17. Delete Technical Inquiry
exports.postDeleteInquiry = async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM inquiries WHERE id = ?', [id]);
        res.json({ success: true, message: 'Inquiry deleted successfully.' });
    } catch (error) {
        console.error('Delete Inquiry API error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting inquiry.' });
    }
};

// 18. Delete Product Extra Image
exports.deleteProductImage = async (req, res) => {
    const { imageId } = req.params;
    try {
        const images = await query('SELECT * FROM product_images WHERE id = ?', [imageId]);
        if (images.length === 0) {
            return res.status(404).json({ success: false, message: 'Product image not found.' });
        }

        const image = images[0];
        // Delete from filesystem
        const imagePath = path.join(__dirname, '../../public', image.image_url);
        if (fs.existsSync(imagePath) && image.image_url.startsWith('/uploads/')) {
            try { fs.unlinkSync(imagePath); } catch (e) { console.warn('Unlink failed:', e.message); }
        }

        // Delete from DB
        await query('DELETE FROM product_images WHERE id = ?', [imageId]);

        res.json({ success: true, message: 'Secondary image deleted successfully.' });
    } catch (error) {
        console.error('Delete Product Image API error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting product image.' });
    }
};

// 19. Get Banners List (Admin view, all banners)
exports.getBanners = async (req, res) => {
    try {
        const banners = await query('SELECT * FROM banners ORDER BY display_order ASC');
        res.json({ success: true, banners });
    } catch (error) {
        console.error('Admin Get Banners API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading banners.' });
    }
};

// 20. Add New Homepage Banner
exports.postAddBanner = async (req, res) => {
    const { title, subtitle, link_url, display_order, is_active } = req.body;
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Banner image is required.' });
        }

        const imageUrl = '/uploads/' + req.file.filename;
        const displayOrderInt = parseInt(display_order) || 0;
        const isActiveVal = is_active === '1' || is_active === 'on' || is_active === true ? 1 : 0;

        await query(
            `INSERT INTO banners (title, subtitle, link_url, image_url, display_order, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, subtitle || null, link_url || null, imageUrl, displayOrderInt, isActiveVal]
        );

        res.json({ success: true, message: 'Banner uploaded successfully!' });
    } catch (error) {
        console.error('Add Banner API error:', error);
        res.status(500).json({ success: false, message: 'Server error saving banner.' });
    }
};

// 21. Delete Homepage Banner
exports.postDeleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        const banners = await query('SELECT image_url FROM banners WHERE id = ?', [id]);
        if (banners.length > 0) {
            const banner = banners[0];
            // Delete image file from server
            const imagePath = path.join(__dirname, '../../public', banner.image_url);
            if (fs.existsSync(imagePath) && banner.image_url.startsWith('/uploads/')) {
                try { fs.unlinkSync(imagePath); } catch (e) { console.warn('Unlink banner failed:', e.message); }
            }

            await query('DELETE FROM banners WHERE id = ?', [id]);
        }
        res.json({ success: true, message: 'Banner deleted successfully.' });
    } catch (error) {
        console.error('Delete Banner API error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting banner.' });
    }
};

// 22. Edit Homepage Banner
exports.postEditBanner = async (req, res) => {
    const { id } = req.params;
    const { title, subtitle, link_url, display_order, is_active } = req.body;
    try {
        const banners = await query('SELECT image_url FROM banners WHERE id = ?', [id]);
        if (banners.length === 0) {
            return res.status(404).json({ success: false, message: 'Banner not found.' });
        }

        const banner = banners[0];
        let imageUrl = banner.image_url;

        // Check if new image was uploaded
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
            
            // Delete old image
            const oldPath = path.join(__dirname, '../../public', banner.image_url);
            if (fs.existsSync(oldPath) && banner.image_url.startsWith('/uploads/')) {
                try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Old banner image unlink failed:', e.message); }
            }
        }

        const displayOrderInt = parseInt(display_order) || 0;
        const isActiveVal = is_active === '1' || is_active === 'on' || is_active === true ? 1 : 0;

        await query(
            `UPDATE banners SET title = ?, subtitle = ?, link_url = ?, image_url = ?, display_order = ?, is_active = ? 
             WHERE id = ?`,
            [title, subtitle || null, link_url || null, imageUrl, displayOrderInt, isActiveVal, id]
        );

        res.json({ success: true, message: 'Banner updated successfully!' });
    } catch (error) {
        console.error('Edit Banner API error:', error);
        res.status(500).json({ success: false, message: 'Server error updating banner.' });
    }
};


