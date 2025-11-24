// Utility to convert Candid variant status to string
export function statusToString(status: any): string {
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status !== null) {
        const keys = Object.keys(status);
        if (keys.length > 0) {
            return keys[0]; // Return the variant key (e.g., "Created" from { Created: null })
        }
    }
    return 'Unknown';
}
