const { query, getPool } = require('../config/db');

// Validates cart and returns checkout pre-requisites
exports.getCheckout = async (req, res) => {
    try {
        if (!req.session.cart || req.session.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Your shopping cart is empty.' });
        }

        let subtotal = 0;
        const platformFee = 0.00;
        const verifiedItems = [];

        for (const item of req.session.cart) {
            const products = await query('SELECT * FROM products WHERE id = ?', [item.product_id]);
            if (products.length > 0) {
                const product = products[0];
                
                if (product.stock < item.quantity) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Insufficient stock for ${product.name}. Only ${product.stock} units left in stock.` 
                    });
                }

                const price = product.discount_price !== null ? parseFloat(product.discount_price) : parseFloat(product.price);
                subtotal += price * item.quantity;
                verifiedItems.push({
                    product_id: product.id,
                    name: product.name,
                    brand: product.brand,
                    sku: product.sku,
                    price,
                    quantity: item.quantity,
                    total: price * item.quantity
                });
            }
        }

        const total = subtotal + platformFee;
        const addresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC', [req.session.user.id]);

        res.json({
            success: true,
            cartItems: verifiedItems,
            subtotal,
            platformFee,
            total,
            addresses
        });

    } catch (error) {
        console.error('Checkout API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading checkout data.' });
    }
};

// Places the order and generates the WhatsApp link
exports.postCheckout = async (req, res) => {
    const { 
        recipient_name, 
        phone, 
        address_line, 
        city, 
        state, 
        pincode, 
        latitude, 
        longitude,
        save_address,
        selected_address_id
    } = req.body;

    if (!req.session.cart || req.session.cart.length === 0) {
        return res.status(400).json({ success: false, message: 'Shopping cart is empty.' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        let finalRecipientName = recipient_name;
        let finalPhone = phone;
        let finalAddress = '';

        // If user selected an existing address
        if (selected_address_id) {
            const [addressResult] = await connection.query(
                'SELECT * FROM addresses WHERE id = ? AND user_id = ?', 
                [selected_address_id, req.session.user.id]
            );
            if (addressResult.length > 0) {
                const addr = addressResult[0];
                finalRecipientName = addr.recipient_name;
                finalPhone = addr.phone;
                finalAddress = `${addr.address_line}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
            } else {
                throw new Error('Selected address not found.');
            }
        } else {
            // Validate new address input
            if (!recipient_name || !phone || !address_line || !city || !state || !pincode) {
                throw new Error('All address fields are required for a new address.');
            }
            finalAddress = `${address_line}, ${city}, ${state} - ${pincode}`;

            // Save address if checked
            if (save_address) {
                await connection.query(
                    'INSERT INTO addresses (user_id, recipient_name, phone, address_line, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [req.session.user.id, recipient_name, phone, address_line, city, state, pincode]
                );
            }
        }

        // Verify stock and calculate totals
        let subtotal = 0;
        const platformFee = 0.00;
        const orderItems = [];

        for (const item of req.session.cart) {
            const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
            if (products.length === 0) {
                throw new Error('One of the products in your cart no longer exists.');
            }

            const product = products[0];
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} units left.`);
            }

            const price = product.discount_price !== null ? parseFloat(product.discount_price) : parseFloat(product.price);
            subtotal += price * item.quantity;

            orderItems.push({
                product_id: product.id,
                name: product.name,
                brand: product.brand,
                quantity: item.quantity,
                price: price
            });
        }

        const totalAmount = subtotal + platformFee;

        // Insert Order
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_amount, platform_fee, status, payment_method, payment_status, shipping_address, recipient_name, phone, latitude, longitude) 
             VALUES (?, ?, ?, 'PENDING', 'COD', 'COD', ?, ?, ?, ?, ?)`,
            [
                req.session.user.id, 
                totalAmount, 
                platformFee, 
                finalAddress, 
                finalRecipientName, 
                finalPhone, 
                latitude || null, 
                longitude || null
            ]
        );

        const orderId = orderResult.insertId;

        // Insert Order Items and Update Product Stocks
        for (const item of orderItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );

            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        connection.release();

        // Clear Cart
        req.session.cart = [];

        // Build the structured WhatsApp message
        let waMessage = `🚜 *SK All Agriculture Parts Order #${orderId}* 🚜\n\n`;
        
        orderItems.forEach(item => {
            waMessage += `* ${item.name} (${item.brand}) x${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        waMessage += `-----------------------------------------\n`;
        waMessage += `platform fee: ₹${platformFee.toFixed(2)}\n\n`;
        waMessage += `💰 *Total: ₹${totalAmount.toFixed(2)}*\n`;
        waMessage += `👤 *Name:* ${finalRecipientName}\n`;
        waMessage += `📞 *Phone:* ${finalPhone}\n`;
        waMessage += `🏠 *Address:* ${finalAddress}\n`;

        if (latitude && longitude) {
            waMessage += `📍 *Location:* https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}\n`;
        }

        const encodedMsg = encodeURIComponent(waMessage);
        const adminWaNumber = '9026754812';
        const waLink = `https://api.whatsapp.com/send?phone=91${adminWaNumber}&text=${encodedMsg}`;

        // Store WhatsApp link in session to fetch on the success page
        req.session.lastOrder = {
            id: orderId,
            total: totalAmount,
            waLink: waLink
        };

        res.json({
            success: true,
            message: 'Order placed successfully!',
            orderId,
            total: totalAmount,
            waLink
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Order placement API error:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to place order.' });
    }
};

// Returns details of the last placed order
exports.getLastSuccess = (req, res) => {
    if (!req.session.lastOrder) {
        return res.status(404).json({ success: false, message: 'No recent order found in this session.' });
    }

    const orderInfo = req.session.lastOrder;
    // Clear it from session so refreshing doesn't keep it
    delete req.session.lastOrder;

    res.json({
        success: true,
        order: orderInfo
    });
};

// Returns logged-in user's orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
            [req.session.user.id]
        );
        res.json({ success: true, orders });
    } catch (error) {
        console.error('My orders API error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching order history.' });
    }
};

// Returns detailed order specifications
exports.getOrderDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orderResult = await query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [id, req.session.user.id]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const order = orderResult[0];

        const items = await query(
            `SELECT oi.*, p.name, p.brand, p.main_image, p.sku, p.slug 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [order.id]
        );

        res.json({ 
            success: true, 
            order, 
            items 
        });

    } catch (error) {
        console.error('Order details API error:', error);
        res.status(500).json({ success: false, message: 'Server error loading order details.' });
    }
};

