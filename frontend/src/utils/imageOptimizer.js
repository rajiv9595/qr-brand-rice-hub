/**
 * Cloudinary image optimization utility
 * Automatically injects transformations for better performance
 */
export const optimizeImage = (url, width = 600) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    // Injects f_auto (auto format) and q_auto (auto quality) and w_... (width)
    // Assumes URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[id].[ext]
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};
