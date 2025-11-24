// ===============================
// UTILITY CLASS
// ===============================
class Utils {

    // ===============================
    // API CALL (perbaikan untuk GAS & CORS)
    // ===============================
    static async apiCall(path, options = {}) {
        if (!window.CONFIG) throw new Error("CONFIG is not defined");

        // Pastikan path GAS
        const url = new URL(window.CONFIG.API_BASE_URL);
        url.searchParams.set('path', path);

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        // POST body
        if (finalOptions.method.toUpperCase() === 'POST' && finalOptions.body && typeof finalOptions.body !== 'string') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        try {
            const response = await fetch(url, finalOptions);
            const result = await response.json();

            if (!result.success) throw new Error(result.message || 'API error');

            // Supaya kompatibel dengan ProductCatalog
            if (path === 'products') return result.products || [];
            return result;
        } catch (error) {
            console.error("API call failed:", error);
            throw error;
        }
    }

    // ===============================
    // PRODUCT API
    // ===============================
    static getProducts() { return this.apiCall('products'); }
    static getProduct(id) { return this.apiCall(`product&id=${id}`); }

    // ===============================
    // ORDER API
    // ===============================
    static createOrder(orderData) { return this.apiCall('order', { method: 'POST', body: orderData }); }
    static trackOrder(orderId) { return this.apiCall(`track&id=${orderId}`); }

    // ===============================
    // ADMIN API
    // ===============================
    static adminLogin(credentials) { return this.apiCall('admin/login', { method: 'POST', body: credentials }); }
    static getOrders() { return this.apiCall('admin/orders'); }
    static getOrder(orderId) { return this.apiCall(`admin/order&id=${orderId}`); }
    static updateOrderStatus(data) { return this.apiCall('admin/update-order-status', { method: 'POST', body: data }); }
    static createProduct(data) { return this.apiCall('admin/create-product', { method: 'POST', body: data }); }
    static editProduct(data) { return this.apiCall('admin/edit-product', { method: 'POST', body: data }); }
    static deleteProduct(data) { return this.apiCall('admin/delete-product', { method: 'POST', body: data }); }

    // ===============================
    // HELPERS
    // ===============================
    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('id-ID', options);
    }

    static generateOrderId() {
        const prefix = 'ORD';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        return `${prefix}-${result}`;
    }

    static generateTrackingLink(orderId) {
        return `${window.location.origin}/track.html?id=${orderId}`;
    }

    static validatePhoneNumber(phone) {
        const phoneRegex = /^(?:\+62|62|0)[0-9]{9,13}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;

        const icon = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'exclamation-circle' :
                     type === 'warning' ? 'exclamation-triangle' :
                     'info-circle';

        toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; }, 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, window.CONFIG.TOAST_DURATION || 3000);
    }

    static showLoading(element) { if (element) element.classList.add('loading', 'active'); }
    static hideLoading(element) { if (element) element.classList.remove('loading', 'active'); }

    static getUrlParameter(name) { return new URLSearchParams(window.location.search).get(name); }
    static setUrlParameter(name, value) { const url = new URL(window.location); url.searchParams.set(name, value); window.history.pushState({}, '', url); }

    static debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    static truncateText(text, maxLength) { return text.length <= maxLength ? text : text.substr(0, maxLength) + '...'; }
}

// Export untuk Node.js (opsional)
if (typeof module !== 'undefined' && module.exports) { module.exports = Utils; }
