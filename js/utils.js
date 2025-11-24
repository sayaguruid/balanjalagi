// ===============================
// UTILITY CLASS
// ===============================
class Utils {

    // ===============================
    // API CALL
    // ===============================
    static async apiCall(path, options = {}) {
        const CONFIG = window.CONFIG;
        let url = '';

        if (path.startsWith('?') || path.startsWith('/')) {
            url = `${CONFIG.API_BASE_URL}${path}`;
        } else {
            url = `${CONFIG.API_BASE_URL}?action=${path}`;
        }

        const defaultOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const finalOptions = { ...defaultOptions, ...options };

        if (finalOptions.method.toUpperCase() === 'POST' && finalOptions.body && typeof finalOptions.body !== 'string') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        try {
            const response = await fetch(url, finalOptions);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("API call failed:", error);
            throw error;
        }
    }

    // ===============================
    // PRODUCT API
    // ===============================
    static getProducts() { return this.apiCall('getProducts'); }
    static getProduct(id) { return this.apiCall(`getProduct&id=${id}`); }

    // ===============================
    // ORDER API
    // ===============================
    static createOrder(orderData) { return this.apiCall('createOrder', { method: 'POST', body: orderData }); }
    static trackOrder(orderId) { return this.apiCall(`trackOrder&id=${orderId}`); }

    // ===============================
    // ADMIN API
    // ===============================
    static adminLogin(credentials) { return this.apiCall('adminLogin', { method:'POST', body: credentials }); }
    static getOrders() { return this.apiCall('getOrders'); }
    static getOrder(orderId) { return this.apiCall(`getOrder&id=${orderId}`); }
    static updateOrderStatus(data) { return this.apiCall('updateOrderStatus', { method:'POST', body:data }); }
    static createProduct(data) { return this.apiCall('createProduct', { method:'POST', body:data }); }
    static editProduct(data) { return this.apiCall('editProduct', { method:'POST', body:data }); }
    static deleteProduct(data) { return this.apiCall('deleteProduct', { method:'POST', body:data }); }

    // ===============================
    // HELPER FUNCTIONS
    // ===============================
    static formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(amount);
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' };
        return date.toLocaleDateString('id-ID', options);
    }

    static generateOrderId() {
        const prefix = 'ORD';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for(let i=0;i<6;i++) result += chars.charAt(Math.floor(Math.random()*chars.length));
        return `${prefix}-${result}`;
    }

    static generateTrackingLink(orderId) {
        return `${window.location.origin}/track.html?id=${orderId}`;
    }

    static validatePhoneNumber(phone) {
        const phoneRegex = /^(?:\+62|62|0)[0-9]{9,13}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g,''));
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static showToast(message, type='success') {
        const CONFIG = window.CONFIG;
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
            type==='success'?'bg-green-500 text-white':
            type==='error'?'bg-red-500 text-white':
            type==='warning'?'bg-yellow-500 text-white':'bg-blue-500 text-white'}`;

        const icon = type==='success'?'check-circle': type==='error'?'exclamation-circle': type==='warning'?'exclamation-triangle':'info-circle';
        toast.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(()=>{ toast.style.transform='translateX(0)'; toast.style.opacity=1; },100);
        setTimeout(()=>{ toast.style.transform='translateX(100%)'; toast.style.opacity=0; setTimeout(()=>document.body.removeChild(toast),300); }, CONFIG.TOAST_DURATION);
    }

    static showLoading(el){ if(el) el.classList.add('loading','active'); }
    static hideLoading(el){ if(el) el.classList.remove('loading','active'); }

    static getUrlParameter(name){ return new URLSearchParams(window.location.search).get(name); }
    static setUrlParameter(name,value){ const url = new URL(window.location); url.searchParams.set(name,value); window.history.pushState({},'',url); }

    static debounce(func,wait){
        let timeout;
        return function(...args){ clearTimeout(timeout); timeout=setTimeout(()=>func(...args),wait); };
    }

    static convertImageToBase64(file){
        return new Promise((resolve,reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static validateImageFile(file){
        const CONFIG = window.CONFIG;
        if(!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.');
        if(file.size>CONFIG.MAX_IMAGE_SIZE) throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
        return true;
    }

    static getStatusBadge(status,type='order'){
        const statusConfig = type==='payment'?
        { 'Pending':'bg-yellow-100 text-yellow-800','Dibayar':'bg-green-100 text-green-800','Gagal':'bg-red-100 text-red-800','Dikembalikan':'bg-gray-100 text-gray-800' }:
        { 'Pending':'bg-yellow-100 text-yellow-800','Diproses':'bg-blue-100 text-blue-800','Dikirim':'bg-purple-100 text-purple-800','Selesai':'bg-green-100 text-green-800','Dibatalkan':'bg-red-100 text-red-800' };
        const cls = statusConfig[status] || 'bg-gray-100 text-gray-800';
        return `<span class="px-2 py-1 text-xs font-medium rounded-full ${cls}">${status}</span>`;
    }

    static async copyToClipboard(text){
        try{ await navigator.clipboard.writeText(text); return true; }
        catch(err){ const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); return true; }
    }

    static isAdminLoggedIn(){
        const CONFIG = window.CONFIG;
        const token=localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
        const name=localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_NAME);
        return !!(token && name);
    }

    static getAdminInfo(){ 
        const CONFIG = window.CONFIG;
        return { token: localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN), name: localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_NAME) };
    }

    static setAdminSession(token,name){
        const CONFIG = window.CONFIG;
        localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN,token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_NAME,name);
    }

    static clearAdminSession(){
        const CONFIG = window.CONFIG;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_NAME);
    }

    static requireAdmin(){ if(!this.isAdminLoggedIn()){ window.location.href='admin-login.html'; return false;} return true; }

    static sanitizeHtml(html){ const div=document.createElement('div'); div.textContent=html; return div.innerHTML; }
    static truncateText(text,maxLen){ return text.length<=maxLen?text:text.substr(0,maxLen)+'...'; }
    static scrollToTop(){ window.scrollTo({ top:0, behavior:'smooth' }); }
    static isInViewport(el){ const r=el.getBoundingClientRect(); return r.top>=0 && r.left>=0 && r.bottom<=(window.innerHeight||document.documentElement.clientHeight) && r.right<=(window.innerWidth||document.documentElement.clientWidth); }

}

// Export untuk Node.js (opsional)
if(typeof module!=='undefined' && module.exports) module.exports=Utils;
