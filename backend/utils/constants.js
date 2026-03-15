const ROLES = {
    ADMIN: 'admin',
    SUPPLIER: 'supplier',
    EXPERT: 'expert',
    CUSTOMER: 'customer'
};

const ORDER_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

const APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const USAGE_CATEGORIES = [
    'Daily Cooking',
    'Function & Event',
    'Healthy Rice'
];

const RICE_TYPES = [
    'Raw',
    'Steam',
    'Boiled',
    'Brown'
];

const PACK_SIZES = [
    '500gm',
    '1kg',
    '5kg',
    '10kg',
    '26kg',
    '50kg'
];

const TRADER_TYPES = {
    WHOLESALER: 'Wholesaler',
    RETAILER: 'Retailer'
};

const PRICE_CATEGORIES = {
    PREMIUM: 'Premium Rice',
    BUDGET: 'Budget Friendly Rice'
};

const RICE_VARIETIES = [
    'Basmati',
    'Sona Masuri',
    'BPT 5204',
    'HMT',
    'RNR',
    'Kolam',
    'Organic',
    'Diabetic'
];

module.exports = {
    ROLES,
    ORDER_STATUS,
    APPROVAL_STATUS,
    USAGE_CATEGORIES,
    RICE_TYPES,
    PACK_SIZES,
    TRADER_TYPES,
    PRICE_CATEGORIES,
    RICE_VARIETIES
};
