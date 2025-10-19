/**
 * General utility helper functions
 */

/**
 * Generate a unique ID
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Deep clone an object using JSON serialization
 */
export function deepClone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

/**
 * Create a sorted key pair from two player IDs
 * Used for tracking meetings between players
 */
export function keyPair(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
