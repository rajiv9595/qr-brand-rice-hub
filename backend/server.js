const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
// app.use('/api/', limiter); // Temporarily disabled for dev stability

// Body parser
app.use(express.json());

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

