class Utils {
    static async apiCall(path, options = {}) {
        if (!window.CONFIG) throw new Error("CONFIG is not defined");

        const url = new URL(window.CONFIG.API_BASE_URL);
        if (path.includes('?') || path.includes('&')) url.search += path;
        else url.searchParams.set('action', path);

        const defaultOptions = { method: 'GET', headers: { 'Content-Type': 'application/json' } };
        const finalOptions = { ...defaultOptions, ...options };

        if (finalOptions.method.toUpperCase() === 'POST' && finalOptions.body && typeof finalOptions.body !== 'string') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        const controller = new AbortController();
        finalOptions.signal = controller.signal;
        const timeout = setTimeout(() => controller.abort(), window.CONFIG.API_TIMEOUT || 10000);

        try {
            const response = await fetch(url, finalOptions);
            clearTimeout(timeout);
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'API error');
            return result;
        } catch (error) {
            console.error("API call failed:", error);
            throw error;
        }
    }

    // PRODUCT
    static getProducts() { return this.apiCall('products'); }
    static getProduct(id) { return this.apiCall(`product&id=${id}`); }

    // ORDER
    static createOrder(orderData) { return this.apiCall('order', { method: 'POST', body: orderData }); }
    static trackOrder(orderId) { return this.apiCall(`track&id=${orderId}`); }

    // ADMIN
    static adminLogin(credentials) { return this.apiCall('admin/login', { method: 'POST', body: credentials }); }
    static getOrders() { return this.apiCall('admin/orders'); }
    static getOrder(orderId) { return this.apiCall(`admin/order&id=${orderId}`); }
    static updateOrderStatus(data) { return this.apiCall('admin/update-order-status', { method: 'POST', body: data }); }
    static createProduct(data) { return this.apiCall('admin/create-product', { method: 'POST', body: data }); }
    static editProduct(data) { return this.apiCall('admin/edit-product', { method: 'POST', body: data }); }
    static deleteProduct(data) { return this.apiCall('admin/delete-product', { method: 'POST', body: data }); }

    // HELPERS
    static formatCurrency(amount) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount); }
    static formatDate(dateString) { return new Date(dateString).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    static generateOrderId() { const prefix='ORD'; const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let res=''; for(let i=0;i<6;i++) res+=chars.charAt(Math.floor(Math.random()*chars.length)); return `${prefix}-${res}`; }
    static generateTrackingLink(orderId) { return `${window.location.origin}/track.html?id=${orderId}`; }
    static validatePhoneNumber(phone) { phone=phone.replace(/\D/g,''); return /^(?:62|0)[0-9]{9,13}$/.test(phone); }
    static validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    static showToast(message, type='success') { /* sama seperti sebelumnya */ }
    static showLoading(element) { element?.classList.add('loading','active'); }
    static hideLoading(element) { element?.classList.remove('loading','active'); }
    static getUrlParameter(name) { return new URLSearchParams(window.location.search).get(name); }
    static setUrlParameter(name, value) { const url=new URL(window.location); url.searchParams.set(name,value); window.history.pushState({}, '', url); }
    static debounce(func, wait) { let timeout; return (...args)=>{ clearTimeout(timeout); timeout=setTimeout(()=>func(...args), wait); }; }
    static sanitizeHtml(html){ const div=document.createElement('div'); div.textContent=html; return div.innerHTML; }
    static truncateText(text,maxLength){ return text.length<=maxLength?text:text.substr(0,maxLength)+'...'; }

    // IMAGE / FILE
    static validateImageFile(file){
        const allowed=['image/jpeg','image/png','image/jpg']; const maxSize=2*1024*1024;
        if(!allowed.includes(file.type)) throw new Error('Format file harus JPG/PNG');
        if(file.size>maxSize) throw new Error('Ukuran file maksimal 2MB');
    }
    static convertImageToBase64(file){ return new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(file); }); }
    static async copyToClipboard(text){ if(!navigator.clipboard) throw new Error('Clipboard API tidak didukung'); await navigator.clipboard.writeText(text); }
}

if(typeof module!=='undefined' && module.exports) module.exports=Utils;
