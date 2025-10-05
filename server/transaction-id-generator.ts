// Transaction ID Generator Utility
// Generates unique, human-readable transaction IDs with prefixes

/**
 * Generates a unique transaction ID with the specified prefix
 * Format: PREFIX-XXXXXX (2-letter prefix + dash + 6 random characters)
 * 
 * Examples:
 * - TX-5G2KA1 (Top-Up)
 * - WD-91BZ8Q (Withdrawal) 
 * - SF-3X9KQ7 (Seller Fee)
 */

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateTransactionId(type: 'top_up' | 'withdrawal' | 'seller_fee'): string {
  const prefixes = {
    top_up: 'TX',
    withdrawal: 'WD', 
    seller_fee: 'SF'
  };
  
  const prefix = prefixes[type];
  const randomPart = generateRandomString(6);
  
  return `${prefix}-${randomPart}`;
}

/**
 * Validates if a transaction ID has the correct format
 */
export function isValidTransactionId(transactionId: string): boolean {
  const pattern = /^(TX|WD|SF)-[A-Z0-9]{6}$/;
  return pattern.test(transactionId);
}

/**
 * Extracts the transaction type from a transaction ID
 */
export function getTransactionTypeFromId(transactionId: string): 'top_up' | 'withdrawal' | 'seller_fee' | null {
  if (!isValidTransactionId(transactionId)) {
    return null;
  }
  
  const prefix = transactionId.substring(0, 2);
  
  switch (prefix) {
    case 'TX':
      return 'top_up';
    case 'WD':
      return 'withdrawal';
    case 'SF':
      return 'seller_fee';
    default:
      return null;
  }
}

/**
 * Ensures uniqueness by checking against existing IDs and regenerating if needed
 * This should be used with database constraint checking in the actual implementation
 */
export function generateUniqueTransactionId(
  type: 'top_up' | 'withdrawal' | 'seller_fee',
  existingIds: Set<string> = new Set()
): string {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const transactionId = generateTransactionId(type);
    
    if (!existingIds.has(transactionId)) {
      return transactionId;
    }
    
    attempts++;
  }
  
  // Fallback with timestamp if uniqueness generation fails
  const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
  const prefix = type === 'top_up' ? 'TX' : type === 'withdrawal' ? 'WD' : 'SF';
  return `${prefix}-${timestamp}`;
}