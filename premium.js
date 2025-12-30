// Premium Features Manager
// Handles premium tab access and payment verification

const PREMIUM_CONFIG = {
    storageKey: 'evan_calc_premium',
    premiumTabs: ['graph', 'converter', 'currency', 'ai'],
    // Replace with your Stripe Payment Link URL
    stripePaymentLink: 'YOUR_STRIPE_PAYMENT_LINK_HERE'
};

class PremiumManager {
    constructor() {
        this.premiumData = null;
        this.loadPremiumStatus();
    }

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
    }

    isPremium() {
        return this.premiumData !== null && this.premiumData.isPremium === true;
    }

    setPremium(userId) {
        this.premiumData = {
            isPremium: true,
            unlockedAt: new Date().toISOString(),
            userId: userId || 'anonymous'
        };
        localStorage.setItem(PREMIUM_CONFIG.storageKey, JSON.stringify(this.premiumData));
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
