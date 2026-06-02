const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Get token from Authorization header (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    try {
        // Verify the token using JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user payload to request object
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token. Please log in again.',
        });
    }
};

module.exports = authenticate;
