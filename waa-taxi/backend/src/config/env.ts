function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
        if (fallback !== undefined) return fallback;
        throw new Error(`❌ Missing environment variable: ${key}`);
    }
    return value;
}

export const env = {
    PORT: getEnvVar('PORT', '3000'),
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', ''),
    // SMS provider (optional)
    TWILIO_ACCOUNT_SID: getEnvVar('TWILIO_ACCOUNT_SID', ''),
    TWILIO_AUTH_TOKEN: getEnvVar('TWILIO_AUTH_TOKEN', ''),
    TWILIO_PHONE_NUMBER: getEnvVar('TWILIO_PHONE_NUMBER', ''),
    // Payment provider (optional)
    PAYMENT_PROVIDER: getEnvVar('PAYMENT_PROVIDER', ''),
};
