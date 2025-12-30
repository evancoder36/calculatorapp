// Premium Features Manager
// Handles premium tab access with Supabase sync

const PREMIUM_CONFIG = {
    storageKey: 'evan_calc_premium',
    premiumTabs: ['graph', 'converter', 'currency', 'ai'],
    // Stripe Payment Link URL
    stripePaymentLink: 'https://buy.stripe.com/test_5kQbJ0dMid9T5eb1N64Ni00'
};

class PremiumManager {
    constructor() {
        this.premiumData = null;
        this.isLoading = true;
        this.loadPremiumStatus();
    }

    // Load from localStorage first (for immediate UI)
    loadPremiumStatus() {
        const stored = localStorage.getItem(PREMIUM_CONFIG.storageKey);
        if (stored) {
            try {
                this.premiumData = JSON.parse(stored);
            } catch (e) {
                localStorage.removeItem(PREMIUM_CONFIG.storageKey);
                this.premiumData = null;
            }
        }
        this.isLoading = false;
    }

    // Check Supabase for premium status (call this after page loads)
    async syncWithSupabase(userId) {
        if (!userId || typeof supabaseClient === 'undefined') return false;

        try {
            const { data, error } = await supabaseClient
                .from('premium_users')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Supabase error:', error);
                return false;
            }

            if (data && data.is_premium) {
                // User has premium in Supabase - update localStorage
                this.premiumData = {
                    isPremium: true,
                    unlockedAt: data.unlocked_at,
                    userId: userId
                };
                localStorage.setItem(PREMIUM_CONFIG.storageKey, JSON.stringify(this.premiumData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error syncing with Supabase:', error);
            return false;
        }
    }

    isPremium() {
        return this.premiumData !== null && this.premiumData.isPremium === true;
    }

    // Save premium status to both localStorage and Supabase
    async setPremium(userId) {
        const timestamp = new Date().toISOString();

        this.premiumData = {
            isPremium: true,
            unlockedAt: timestamp,
            userId: userId || 'anonymous'
        };

        // Save to localStorage
        localStorage.setItem(PREMIUM_CONFIG.storageKey, JSON.stringify(this.premiumData));

        // Save to Supabase if user is logged in
        if (userId && typeof supabaseClient !== 'undefined') {
            try {
                const user = authManager.getUser();
                const { error } = await supabaseClient
                    .from('premium_users')
                    .upsert({
                        user_id: userId,
                        is_premium: true,
                        unlocked_at: timestamp,
                        email: user?.email || '',
                        name: user?.name || ''
                    }, {
                        onConflict: 'user_id'
                    });

                if (error) {
                    console.error('Error saving to Supabase:', error);
                } else {
                    console.log('Premium status saved to Supabase');
                }
            } catch (error) {
                console.error('Error saving to Supabase:', error);
            }
        }
    }

    clearPremium() {
        this.premiumData = null;
        localStorage.removeItem(PREMIUM_CONFIG.storageKey);
    }

    isPremiumTab(tabName) {
        return PREMIUM_CONFIG.premiumTabs.includes(tabName);
    }

    getPremiumTabs() {
        return PREMIUM_CONFIG.premiumTabs;
    }

    getStripePaymentLink() {
        return PREMIUM_CONFIG.stripePaymentLink;
    }

    redirectToUpgrade() {
        window.location.href = 'upgrade.html';
    }
}

// Global premium manager instance
const premiumManager = new PremiumManager();
