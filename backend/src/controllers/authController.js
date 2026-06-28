const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// Check Current Session Status (Me Endpoint)
exports.getMe = (req, res) => {
    const cart = req.session.cart || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
        success: true,
        user: req.session.user || null,
        admin: req.session.admin || null,
        cartCount
    });
};

// Handles User Registration
exports.postRegister = async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    try {
        const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await query(
            'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
            [name, email, phone, hashedPassword]
        );

        res.json({ success: true, message: 'Registration successful! Please login.' });

    } catch (error) {
        console.error('Registration API error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// Handles User Login
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Set session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        res.json({ 
            success: true, 
            message: 'Login successful.', 
            user: req.session.user 
        });

    } catch (error) {
        console.error('Login API error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// Handles User Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout API error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ success: true, message: 'Logged out successfully.' });
    });
};

// Handles Admin Login
exports.postAdminLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log(`[Admin Login Attempt] Username: "${username}"`);

    if (!username || !password) {
        console.warn('[Admin Login Warn] Missing username or password.');
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    try {
        const admins = await query('SELECT * FROM admins WHERE username = ?', [username]);
        if (admins.length === 0) {
            console.warn(`[Admin Login Warn] Admin not found for username: "${username}"`);
            return res.status(400).json({ success: false, message: 'Invalid administrative credentials.' });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.warn('[Admin Login Warn] Password mismatch.');
            return res.status(400).json({ success: false, message: 'Invalid administrative credentials.' });
        }

        // Set session
        req.session.admin = {
            id: admin.id,
            name: admin.name,
            username: admin.username,
            email: admin.email
        };
        console.log('[Admin Login Success] Session created for:', admin.username);

        res.json({ 
            success: true, 
            message: 'Administrative login successful.', 
            admin: req.session.admin 
        });

    } catch (error) {
        console.error('Admin login API error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// Handles Admin Logout
exports.adminLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Admin logout API error:', err);
            return res.status(500).json({ success: false, message: 'Logout failed.' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Administrative logout successful.' });
    });
};
