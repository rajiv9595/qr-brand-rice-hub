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
    'Daily Family Use',
    'Function/Catering Use',
    'Guests/Special Meal Use',
    'Healthy/Brown Rice',
    'Biryani/Pulao Special',
    'Hotel/Commercial Use'
];

module.exports = {
    ROLES,
    ORDER_STATUS,
    APPROVAL_STATUS,
    USAGE_CATEGORIES
};
