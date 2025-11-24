// Configuration file for the e-commerce website
const CONFIG = {

    // ===============================
    // 💾 API CONFIGURATION (Apps Script)
    // ===============================
    // URL Google Apps Script - ganti setelah deploy
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwjNPRowheb0lZOXu8j0eygufVVB2pJPuYJMDANTXDCTbelOVB3m_pKk31sdj83SqAe/exec',

    // ===============================
    // 🌐 SITE CONFIGURATION
    // ===============================
    SITE_NAME: 'Toko Online',
    SITE_DESCRIPTION: 'Toko online terpercaya dengan produk berkualitas',

    // ===============================
    // 💵 CURRENCY CONFIGURATION
    // ===============================
    CURRENCY: 'IDR',
    CURRENCY_SYMBOL: 'Rp',

    // ===============================
    // 📩 CONTACT INFORMATION
    // ===============================
    ADMIN_EMAIL: 'admin@tokoonline.com',
    ADMIN_WHATSAPP: '628123456789',

    // ===============================
    // 💳 PAYMENT CONFIGURATION
    // ===============================
    PAYMENT_METHODS: {
        QRIS: {
            name: 'QRIS',
            description: 'Quick Response Code Indonesian Standard',
            image: 'https://via.placeholder.com/200x200/10b981/ffffff?text=QRIS'
        },
        TRANSFER: {
            name: 'Transfer Bank',
            description: 'Transfer ke rekening bank',
            banks: [
                { name: 'BCA', account: '1234567890', holder: 'Toko Online' },
                { name: 'BRI', account: '0987654321', holder: 'Toko Online' },
                { name: 'BNI', account: '1122334455', holder: 'Toko Online' },
                { name: 'Mandiri', account: '5544332211', holder: 'Toko Online' }
            ]
        },
        COD: {
            name: 'COD',
            description: 'Cash on Delivery - Bayar di tempat'
        }
    },

    // ===============================
    // 📦 ORDER & PAYMENT STATUS
    // ===============================
    ORDER_STATUS: {
        PENDING: 'Pending',
        PROCESSING: 'Diproses',
        SHIPPED: 'Dikirim',
        COMPLETED: 'Selesai',
        CANCELLED: 'Dibatalkan'
    },

    PAYMENT_STATUS: {
        PENDING: 'Pending',
        PAID: 'Dibayar',
        FAILED: 'Gagal',
        REFUNDED: 'Dikembalikan'
    },

    // ===============================
    // 🖼 IMAGE CONFIGURATION
    // ===============================
    DEFAULT_PRODUCT_IMAGE: 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=No+Image',
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

    // ===============================
    // 🔢 PAGINATION
    // ===============================
    PRODUCTS_PER_PAGE: 12,

    // ===============================
    // 🗄 STORAGE KEYS
    // ===============================
    STORAGE_KEYS: {
        ADMIN_TOKEN: 'admin_token',
        ADMIN_NAME: 'admin_name',
        CART: 'shopping_cart',
        RECENTLY_VIEWED: 'recently_viewed'
    },

    // ===============================
    // 🎞 UI / ANIMATION SETTINGS
    // ===============================
    ANIMATION_DURATION: 300,      // ms
    TOAST_DURATION: 3000,        // ms
    TOAST_POSITION: 'top-right'  // top-right, bottom-right, top-left, bottom-left
};

// Export for module-based environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
