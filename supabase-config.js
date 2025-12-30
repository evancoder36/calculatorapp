// Supabase Configuration
var SUPABASE_URL = 'https://jsrzwaljmfurbvqhhjqj.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzcnp3YWxqbWZ1cmJ2cWhoanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODQ3OTAsImV4cCI6MjA4MjY2MDc5MH0.BFYytfMdoQICYgSvCX0_bGxsPN2TrlfwWakiRSR1fzM';

// Initialize Supabase client
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
