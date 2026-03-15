const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived ACCESS token (15 minutes)
 * Sent in JSON response, stored in localStorage/memory by frontend
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};

/**
 * Generate a long-lived REFRESH token (7 days)
 * Sent as httpOnly cookie, never exposed to frontend JS
 */
const generateRefreshToken = (id) => {
    return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

/**
 * Set the refresh token as an httpOnly cookie on the response
 */
const setRefreshCookie = (res, refreshToken) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,                     // Not accessible via JavaScript
        secure: isProduction,               // HTTPS only in production
        sameSite: isProduction ? 'none' : 'lax',  // Cross-site in production (frontend + backend on different domains)
        maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
        path: '/',
    });
};

/**
 * Clear the refresh token cookie (used during logout)
 */
const clearRefreshCookie = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 0,
        path: '/',
    });
};

// Backward compatibility: default export still works like before
const generateToken = generateAccessToken;

module.exports = { generateToken, generateAccessToken, generateRefreshToken, setRefreshCookie, clearRefreshCookie };
