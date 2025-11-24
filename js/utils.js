// Utility functions for the e-commerce website

class Utils {
    // Format currency to Indonesian Rupiah
    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Format date to Indonesian format
    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('id-ID', options);
    }

    // Generate unique Order ID
    static generateOrderId() {
        const prefix = 'ORD';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}-${result}`;
    }

    // Generate tracking link
    static generateTrackingLink(orderId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}/track.html?id=${orderId}`;
    }

    // Validate phone number (Indonesian format)
    static validatePhoneNumber(phone) {
        const phoneRegex = /^(?:\+62|62|0)[0-9]{9,13}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    }

    // Validate email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show toast notification
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
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, CONFIG.TOAST_DURATION);
    }

    // Show loading state
    static showLoading(element) {
        if (element) {
            element.classList.add('loading', 'active');
        }
    }

    // Hide loading state
    static hideLoading(element) {
        if (element) {
            element.classList.remove('loading', 'active');
        }
    }

    // API call helper
    static async apiCall(path, options = {}) {
    // Jika path tidak dimulai dengan '?', tambahkan otomatis
    // Sehingga pemanggilan /products → ?path=products
    let url = '';

    if (path.startsWith('?')) {
        url = `${CONFIG.API_BASE_URL}${path}`;
    } else {
        url = `${CONFIG.API_BASE_URL}?path=${path}`;
    }

    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("API call failed:", error);
        throw error;
    }
}

    // Get URL parameters
    static getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // Set URL parameter
    static setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Convert image to base64
    static convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Validate image file
    static validateImageFile(file) {
        if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.');
        }
        
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
        }
        
        return true;
    }

    // Get status badge HTML
    static getStatusBadge(status, type = 'order') {
        const statusConfig = type === 'payment' ? 
            {
                'Pending': 'bg-yellow-100 text-yellow-800',
                'Dibayar': 'bg-green-100 text-green-800',
                'Gagal': 'bg-red-100 text-red-800',
                'Dikembalikan': 'bg-gray-100 text-gray-800'
            } :
            {
                'Pending': 'bg-yellow-100 text-yellow-800',
                'Diproses': 'bg-blue-100 text-blue-800',
                'Dikirim': 'bg-purple-100 text-purple-800',
                'Selesai': 'bg-green-100 text-green-800',
                'Dibatalkan': 'bg-red-100 text-red-800'
            };
        
        const className = statusConfig[status] || 'bg-gray-100 text-gray-800';
        
        return `<span class="px-2 py-1 text-xs font-medium rounded-full ${className}">${status}</span>`;
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // Check if user is logged in as admin
    static isAdminLoggedIn() {
        const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
        const name = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_NAME);
        return !!(token && name);
    }

    // Get admin info
    static getAdminInfo() {
        return {
            token: localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN),
            name: localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_NAME)
        };
    }

    // Set admin session
    static setAdminSession(token, name) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_NAME, name);
    }

    // Clear admin session
    static clearAdminSession() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_NAME);
    }

    // Redirect if not admin
    static requireAdmin() {
        if (!this.isAdminLoggedIn()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }

    // Sanitize HTML to prevent XSS
    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    // Truncate text
    static truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Scroll to top
    static scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;

}
