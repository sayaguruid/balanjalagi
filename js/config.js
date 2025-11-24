// Configuration file for the e-commerce website
const CONFIG = {
    // Google Apps Script URL - Ganti dengan URL Apps Script Anda setelah deploy
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxU-mSV1fTeqsn-DNFnyMuPurj6WH2WdvGGVJ6-m87aJ4SJ9EZ1iH1Apm0BrJx_NbcKyw/exec',
    
    // Website Configuration
    SITE_NAME: 'Toko Online',
    SITE_DESCRIPTION: 'Toko online terpercaya dengan produk berkualitas',
    
    // Currency Configuration
    CURRENCY: 'IDR',
    CURRENCY_SYMBOL: 'Rp',
    
    // Contact Information
    ADMIN_EMAIL: 'admin@tokoonline.com',
    ADMIN_WHATSAPP: '628123456789',
    
    // Payment Configuration
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
    
    // Order Status Configuration
    ORDER_STATUS: {
        PENDING: 'Pending',
        PROCESSING: 'Diproses',
        SHIPPED: 'Dikirim',
        COMPLETED: 'Selesai',
        CANCELLED: 'Dibatalkan'
    },
    
    // Payment Status Configuration
    PAYMENT_STATUS: {
        PENDING: 'Pending',
        PAID: 'Dibayar',
        FAILED: 'Gagal',
        REFUNDED: 'Dikembalikan'
    },
    
    // Image Configuration
    DEFAULT_PRODUCT_IMAGE: 'https://via.placeholder.com/300x300/e5e7eb/6b7280?text=No+Image',
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    
    // Pagination Configuration
    PRODUCTS_PER_PAGE: 12,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        ADMIN_TOKEN: 'admin_token',
        ADMIN_NAME: 'admin_name',
        CART: 'shopping_cart',
        RECENTLY_VIEWED: 'recently_viewed'
    },
    
    // Animation Duration (in milliseconds)
    ANIMATION_DURATION: 300,
    
    // Toast Notification Configuration
    TOAST_DURATION: 3000,
    TOAST_POSITION: 'top-right'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}


