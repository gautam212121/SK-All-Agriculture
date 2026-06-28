const { query } = require('../config/db');

// Returns Cart items with latest DB details
exports.getCart = async (req, res) => {
    try {
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cartItems = [];
        let subtotal = 0;
        const platformFee = 0.00;

        for (const item of req.session.cart) {
            const products = await query('SELECT * FROM products WHERE id = ?', [item.product_id]);
            if (products.length > 0) {
                const product = products[0];
                const price = product.discount_price !== null ? parseFloat(product.discount_price) : parseFloat(product.price);
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;

                cartItems.push({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    sku: product.sku,
                    slug: product.slug,
                    price: product.price,
                    discount_price: product.discount_price,
                    activePrice: price,
                    main_image: product.main_image,
                    stock: product.stock,
                    quantity: item.quantity,
                    total: itemTotal,
                    outOfStock: product.stock === 0,
                    lowStock: product.stock < item.quantity
                });
            }
        }

        const total = subtotal > 0 ? (subtotal + platformFee) : 0;

        res.json({
            success: true,
            cartItems,
            subtotal,
            platformFee,
            total,
            cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0)
        });
    } catch (error) {
        console.error('Get cart API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching cart.' });
    }
};

// Adds an item to the cart
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    try {
        const products = await query('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Spare part not found or inactive.' });
        }

        const product = products[0];
        if (product.stock <= 0) {
            return res.status(400).json({ success: false, message: 'Product is out of stock.' });
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItemIndex = req.session.cart.findIndex(item => item.product_id === parseInt(productId));

        if (existingItemIndex > -1) {
            const currentQty = req.session.cart[existingItemIndex].quantity;
            const newQty = currentQty + qty;

            if (newQty > product.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot add more. Only ${product.stock} units are in stock, and you already have ${currentQty} in cart.` 
                });
            }
            req.session.cart[existingItemIndex].quantity = newQty;
        } else {
            if (qty > product.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot add. Only ${product.stock} units are in stock.` 
                });
            }
            req.session.cart.push({
                product_id: parseInt(productId),
                quantity: qty
            });
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ 
            success: true, 
            message: 'Item added to cart successfully!', 
            cartCount 
        });

    } catch (error) {
        console.error('Add to cart API error:', error);
        res.status(500).json({ success: false, message: 'Server error adding to cart.' });
    }
};

// Updates item quantity in the cart
exports.updateCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    if (!productId || isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid product or quantity.' });
    }

    try {
        const products = await query('SELECT stock FROM products WHERE id = ?', [productId]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        if (qty > product.stock) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${product.stock} units are available in stock.` 
            });
        }

        if (req.session.cart) {
            const itemIndex = req.session.cart.findIndex(item => item.product_id === parseInt(productId));
            if (itemIndex > -1) {
                req.session.cart[itemIndex].quantity = qty;
            }
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        res.json({ success: true, message: 'Cart updated successfully.', cartCount });

    } catch (error) {
        console.error('Update cart API error:', error);
        res.status(500).json({ success: false, message: 'Server error updating cart.' });
    }
};

// Removes an item from the cart
exports.removeFromCart = (req, res) => {
    const { productId } = req.body;

    if (req.session.cart && productId) {
        req.session.cart = req.session.cart.filter(item => item.product_id !== parseInt(productId));
    }

    const cartCount = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
    res.json({ 
        success: true, 
        message: 'Item removed from cart.', 
        cartCount 
    });
};
