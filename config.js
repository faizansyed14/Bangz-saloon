/**
 * BANGZ SALOON - Configuration File
 * Update these values with your Supabase credentials
 */

// Supabase Configuration
const SUPABASE_CONFIG = {
    // Your actual Supabase credentials
    url: 'https://ryspwycehszeyrdnpzyo.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c3B3eWNlaHN6ZXlyZG5wenlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzY0MzEsImV4cCI6MjA3NDgxMjQzMX0.PQmXYnQeLXyKLEWnfWIGMHj8q3iGxGZMQzGFfurybP0'
};

// Initialize Supabase with your credentials
if (typeof window !== 'undefined' && window.supabaseIntegration) {
    window.supabaseIntegration.setCredentials(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✅ Supabase credentials loaded from config.js');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUPABASE_CONFIG;
}
