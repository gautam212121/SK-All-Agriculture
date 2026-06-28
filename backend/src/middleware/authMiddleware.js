// Decoupled REST API Authentication Middleware for SK All Agriculture Parts

// Middleware to protect user-only API routes
function requireUserAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ 
        success: false, 
        error: 'unauthorized', 
        message: 'Customer session expired or unauthorized. Please sign in.' 
    });
}

// Middleware to protect admin-only API routes
function requireAdminAuth(req, res, next) {
    if (req.session && req.session.admin) {
        return next();
    }
    return res.status(401).json({ 
        success: false, 
        error: 'unauthorized', 
        message: 'Administrative session expired or unauthorized. Please sign in.' 
    });
}

module.exports = {
    requireUserAuth,
    requireAdminAuth
};

