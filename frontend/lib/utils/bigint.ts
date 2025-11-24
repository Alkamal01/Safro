// Utility functions for safe BigInt handling

/**
 * Safely convert BigInt to number for display
 * Converts to string first to avoid mobile crashes
 */
export function bigIntToNumber(value: bigint | number): number {
    if (typeof value === 'number') return value;
    return Number(value.toString());
}

/**
 * Convert satoshis (BigInt) to BTC (number) for display
 */
export function satoshisToBTC(satoshis: bigint | number): number {
    return bigIntToNumber(satoshis) / 100000000;
}

/**
 * Format satoshis as BTC string
 */
export function formatBTC(satoshis: bigint | number, decimals: number = 8): string {
    return satoshisToBTC(satoshis).toFixed(decimals);
}

/**
 * Format satoshis with locale string
 */
export function formatSatoshis(satoshis: bigint | number): string {
    return bigIntToNumber(satoshis).toLocaleString();
}
