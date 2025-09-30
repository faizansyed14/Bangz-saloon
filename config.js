/**
 * BANGZ SALOON - Configuration File
 * Update these values with your Supabase credentials
 */

// Supabase Configuration
const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase credentials
    url: 'YOUR_SUPABASE_URL',  // e.g., 'https://your-project.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY'  // e.g., 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
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
