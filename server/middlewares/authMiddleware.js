const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get the token from headers

    if (!token) {
        return res.status(401).json({ error: 'No token provided. Please log in.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token expired or invalid. Please log in again.' });
        }

        // Attach user info to request object
        req.userId = decoded.userId; // Save user ID for further requests
        req.role = decoded.role; // Save role for authorization checks
        next(); // Move to the next middleware or route handler
    });
};

module.exports = authMiddleware;
