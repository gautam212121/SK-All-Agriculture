const { query } = require('../config/db');

// Returns Homepage JSON data
exports.getHome = async (req, res) => {
    try {
        const categories = await query('SELECT * FROM categories LIMIT 9');
        
        const popularProducts = await query(
            'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.price DESC LIMIT 4'
        );
        
        const newArrivals = await query(
            'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 ORDER BY p.created_at DESC LIMIT 4'
        );

        res.json({
            success: true,
            categories,
            popularProducts,
            newArrivals
        });
    } catch (error) {
        console.error('Home API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching home data.' });
    }
};

// Returns Shop List JSON data
exports.getShop = async (req, res) => {
    try {
        const { search, category, sort, brand } = req.query;
        
        const categories = await query('SELECT * FROM categories');
        const brandResults = await query('SELECT DISTINCT brand FROM products WHERE is_active = 1');
        const brands = brandResults.map(b => b.brand);

        let sql = `
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.is_active = 1
        `;
        const params = [];

        if (search) {
            sql += ' AND (p.name LIKE ? OR p.brand LIKE ? OR p.sku LIKE ? OR p.short_description LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        if (category) {
            sql += ' AND c.slug = ?';
            params.push(category);
        }

        if (brand) {
            sql += ' AND p.brand = ?';
            params.push(brand);
        }

        if (sort === 'price_asc') {
            sql += ' ORDER BY p.price ASC';
        } else if (sort === 'price_desc') {
            sql += ' ORDER BY p.price DESC';
        } else if (sort === 'newest') {
            sql += ' ORDER BY p.created_at DESC';
        } else {
            sql += ' ORDER BY p.id DESC';
        }

        const products = await query(sql, params);

        res.json({
            success: true,
            products,
            categories,
            brands,
            filters: {
                category: category || '',
                brand: brand || '',
                sort: sort || '',
                search: search || ''
            }
        });
    } catch (error) {
        console.error('Shop API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching shop data.' });
    }
};

// Returns Category Specific JSON data
exports.getCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const categoryResult = await query('SELECT * FROM categories WHERE slug = ?', [slug]);
        if (categoryResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        const category = categoryResult[0];

        const products = await query(
            'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.is_active = 1',
            [category.id]
        );

        const categories = await query('SELECT * FROM categories');

        res.json({
            success: true,
            category,
            products,
            categories
        });
    } catch (error) {
        console.error('Category API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching category data.' });
    }
};

// Returns Product Details JSON data
exports.getProductDetails = async (req, res) => {
    try {
        const { slug } = req.params;

        const productResult = await query(
            'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1',
            [slug]
        );

        if (productResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        const product = productResult[0];

        const extraImages = await query(
            'SELECT * FROM product_images WHERE product_id = ?',
            [product.id]
        );

        const relatedProducts = await query(
            'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1 LIMIT 4',
            [product.category_id, product.id]
        );

        res.json({
            success: true,
            product,
            extraImages,
            relatedProducts
        });
    } catch (error) {
        console.error('Product details API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching product details.' });
    }
};

// Returns Active Homepage Banners JSON data
exports.getBanners = async (req, res) => {
    try {
        const banners = await query('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC');
        res.json({ success: true, banners });
    } catch (error) {
        console.error('Get banners API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching banners.' });
    }
};

