const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'rice_hub',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'heic', 'heif', 'bmp', 'tiff'],
        // Automatic optimization on upload
        quality: 'auto',       // Cloudinary chooses optimal compression
        format: 'auto',        // Serves WebP/AVIF to supported browsers
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' }  // Cap resolution to 1200px max
        ],
    },
});

// 5MB file size limit to reject oversized images before Cloudinary upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
    },
});

module.exports = { cloudinary, upload };
