export const formatCurrency = (amount: number | undefined | null, role?: string): string => {
  const num = amount || 0;
  if (role === 'admin') {
    return `£${num.toLocaleString('en-GB')}`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const getCurrencySymbol = (role?: string): string => {
  return role === 'admin' ? '£' : '₹';
};
