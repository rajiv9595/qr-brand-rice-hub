const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet({
    crossOriginResourcePolicy: false, // allow images from external domains
}));

// Rate limiting (High limit to prevent 429 during normal development but still restrict DoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '50mb' })); // Increased limit for parsing larger inputs



// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/supplier', require('./routes/supplierRoutes'));
app.use('/api/rice', require('./routes/riceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/expert-review', require('./routes/expertReviewRoutes'));
app.use('/api/cooking-tips', require('./routes/cookingTipsRoutes'));
app.use('/api/market-updates', require('./routes/marketUpdateRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/watchlist', require('./routes/watchlistRoutes'));
app.use('/api/negotiations', require('./routes/negotiationRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('QR BRAND RICE HUB API is running...');
});

// Serve static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
console.log('Environment PORT:', process.env.PORT);
console.log('Selected PORT:', PORT);

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Force restart trigger 7

