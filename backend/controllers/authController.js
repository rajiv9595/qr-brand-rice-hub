const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Joi = require('joi');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    // Validation Schema
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().allow('', null),
        role: Joi.string().valid(...Object.values(ROLES)),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400);
        throw new Error(error.details[0].message);
    }

    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || ROLES.CUSTOMER,
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                token: generateToken(user._id),
            },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide an email and password');
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        res.status(403);
        throw new Error(`Account is temporarily locked. Try again in ${remainingMinutes} minutes.`);
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
        // Reset attempts on success
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        if (user.role === 'admin') {
            // Check if there's an existing valid code generated less than 2 minutes ago
            // (10 mins total expiry - 8 mins remaining = 2 mins old)
            const isCodeRecent = user.mfaCode &&
                user.mfaExpires &&
                (user.mfaExpires.getTime() - Date.now() > 8 * 60 * 1000);

            let mfaCode = user.mfaCode;

            if (!isCodeRecent) {
                mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
                user.mfaCode = mfaCode;
                user.mfaExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
                await user.save();

                // Send MFA to specified email
                try {
                    const emailService = require('../utils/emailService');
                    await emailService.sendMFACode('qrbi.system@gmail.com', mfaCode);
                    console.log(`[MFA] New Code ${mfaCode} sent to qrbi.system@gmail.com`);
                } catch (err) {
                    console.error('MFA Email failed:', err.message);
                }
            } else {
                console.log(`[MFA] Reusing existing code for ${email}`);
            }

            return res.json({
                success: true,
                mfaRequired: true,
                email: 'qrbi.system@gmail.com',
                userId: user._id
            });
        }

        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                token: generateToken(user._id),
            },
        });
    } else {
        // Increment attempts
        user.loginAttempts += 1;

        // Critical alerts for Admin on 3rd attempt
        if (user.role === 'admin' && user.loginAttempts >= 3) {
            user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 mins

            // Send Alerts
            try {
                const notificationService = require('../utils/notificationService');
                const emailService = require('../utils/emailService');

                const adminPhone = '+91 9614346666';
                const alertMsg = `SECURITY ALERT: 3 failed login attempts detected for admin account (${email}). Account has been locked for 30 minutes.`;

                await notificationService.sendSMS(adminPhone, alertMsg); // Need to export sendSMS or add method

                // For Email, we use a placeholder or owner email if known
                // Since the user said "provide in future", I'll use a placeholder for now
                const ownerEmail = process.env.OWNER_EMAIL || 'admin@ricehub.com';
                await emailService.sendEmail(
                    ownerEmail,
                    'CRITICAL: Admin Security Alert',
                    `<h3>Security Alert</h3>
                     <p>There have been 3 failed login attempts for the admin portal (${email}).</p>
                     <p><strong>Action:</strong> The account has been locked for 30 minutes.</p>
                     <p>IP Address: ${req.ip}</p>
                     <p>Time: ${new Date().toLocaleString()}</p>`
                );
            } catch (err) {
                console.error('Alert failed:', err.message);
            }
        }

        await user.save();

        res.status(401);
        const remaining = 3 - user.loginAttempts;
        if (user.role === 'admin' && remaining > 0) {
            throw new Error(`${user.loginAttempts}/3 attempts have been completed.`);
        } else if (user.role === 'admin' && remaining <= 0) {
            throw new Error(`3/3 attempts failed. Account locked and alerts sent.`);
        } else {
            throw new Error('Invalid email or password');
        }
    }
});

// @desc    Authenticate/Register user with Google
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
    const { idToken, role } = req.body;

    if (!idToken) {
        res.status(400);
        throw new Error('No Google ID token provided');
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev',
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // First time Google Login -> Register
            const randomPassword = crypto.randomBytes(20).toString('hex') + 'A1!'; // Satisfy minlength & strong checks if any

            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: role || ROLES.CUSTOMER,
                isVerified: true, // Google emails are already verified
            });
            console.log(`[Google Auth] Created new user: ${email} with role: ${user.role}`);
        } else {
            // Existing user logging in with Google
            // Reset lockings on success
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            // Optionally, we could update their name or picture here, but let's keep it minimal
            await user.save();
        }

        // Return standard login payload
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                token: generateToken(user._id),
            },
        });

    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.status(401);
        throw new Error('Google authentication failed. Invalid token.');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                isVerified: user.isVerified,
            },
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.address) {
        const currentAddress = user.address || {};
        const newAddress = req.body.address;

        user.address = {
            street: newAddress.street !== undefined ? newAddress.street : currentAddress.street || '',
            village: newAddress.village !== undefined ? newAddress.village : currentAddress.village || '',
            city: newAddress.city !== undefined ? newAddress.city : currentAddress.city || '',
            state: newAddress.state !== undefined ? newAddress.state : currentAddress.state || '',
            zipCode: newAddress.zipCode !== undefined ? newAddress.zipCode : currentAddress.zipCode || '',
            country: newAddress.country !== undefined ? newAddress.country : currentAddress.country || 'India'
        };
    }

    if (req.body.password) {
        if (!req.body.currentPassword) {
            res.status(400);
            throw new Error('Please provide current password to change password');
        }

        // Verify current password
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid current password');
        }

        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            token: generateToken(updatedUser._id),
        },
    });
});

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Optionally cleanup dependencies of this user here (SupplierProfile, listings etc.) if required.
    // For now we just physically delete the user document.
    await User.findByIdAndDelete(req.user._id);

    res.json({
        success: true,
        message: 'Account deleted successfully'
    });
});

// @desc    Verify MFA Code
// @route   POST /api/auth/verify-mfa
// @access  Public
exports.verifyMFA = asyncHandler(async (req, res) => {
    const { userId, code } = req.body;

    if (!userId || !code) {
        res.status(400);
        throw new Error('Missing user ID or verification code');
    }

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Debug logging
    console.log('--- MFA VERIFICATION DEBUG ---');
    console.log('Input Code:', code);
    console.log('Stored Code:', user.mfaCode);
    console.log('Current Time:', new Date().toISOString());
    console.log('Expiry Time:', user.mfaExpires ? user.mfaExpires.toISOString() : 'MISSING');
    console.log('Is Expired:', user.mfaExpires < Date.now());
    console.log('Codes Match:', user.mfaCode === code);
    console.log('------------------------------');

    if (user.mfaCode !== code || user.mfaExpires < Date.now()) {
        res.status(401);
        const reason = user.mfaCode !== code ? 'Invalid code' : 'Code has expired';
        throw new Error(`${reason}. Please check your email or try again.`);
    }

    // Clear MFA data
    user.mfaCode = undefined;
    user.mfaExpires = undefined;
    await user.save();

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            token: generateToken(user._id),
        },
    });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404);
        throw new Error('There is no user with that email');
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        const emailService = require('../utils/emailService');
        await emailService.sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const crypto = require('crypto');
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid token');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        token: generateToken(user._id),
    });
});
