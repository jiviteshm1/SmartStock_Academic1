/**
 * Indian Rupee (INR) currency and localization formatter.
 * Strict standard: Never uses '$', always formats with '₹' and Indian numbering commas (e.g., ₹1,250.00).
 */
export function formatINR(amount: number | string | undefined | null): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) {
    return '₹0.00';
  }

  return `₹${numeric.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
