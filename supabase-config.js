// Supabase Configuration
// Replace with your Supabase project credentials

const SUPABASE_URL = 'https://jsrzwaljmfurbvqhhjqj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s8Ga4123WtvHr1-wRSvzxg_HYCopr6D';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
