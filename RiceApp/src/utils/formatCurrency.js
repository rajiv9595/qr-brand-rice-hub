// utils/formatCurrency.js
export const formatCurrency = (amount) => {
  if (amount == null) return '';
  return '₹' + Number(amount).toLocaleString('en-IN');
};
