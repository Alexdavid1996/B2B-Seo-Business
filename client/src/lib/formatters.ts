// Utility functions for formatting currency and numbers

export function formatCurrency(dollars: number): string {
  // Format dollars directly (no conversion needed)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function formatNumber(num: number): string {
  // Format numbers with commas
  return new Intl.NumberFormat('en-US').format(num);
}