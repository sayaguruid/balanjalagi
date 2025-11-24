class ProductDetail {
    constructor() {
        this.product = null;
        this.quantity = 1;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProduct();
        if (this.product) this.renderProduct();
    }

    setupEventListeners() {
        document.getElementById('decreaseQty')?.addEventListener('click', () => {
            if (this.quantity > 1) { this.quantity--; this.updateQuantity(); }
        });

        document.getElementById('increaseQty')?.addEventListener('click', () => {
            if (this.product && this.quantity < this.product.stock) { this.quantity++; this.updateQuantity(); }
            else Utils.showToast('Stok tidak mencukupi', 'warning');
        });

        document.getElementById('quantity')?.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity > 0 && this.product && newQuantity <= this.product.stock) {
                this.quantity = newQuantity;
                this.updateQuantity();
            } else {
                e.target.value = this.quantity;
                Utils.showToast('Jumlah tidak valid', 'warning');
            }
        });

        document.getElementById('orderBtn')?.addEventListener('click', () => this.goToOrder());
    }

    async loadProduct() {
        try {
            const productId = Utils.getUrlParameter('id');
            if (!productId) { this.showError(); return; }

            Utils.showLoading(document.getElementById('loadingState'));

            const response = await Utils.apiCall(`get-product?id=${productId}`);
            this.product = response?.product;

            Utils.hideLoading(document.getElementById('loadingState'));

            if (!this.product) this.showError();

        } catch (error) {
            console.error('Error loading product:', error);
            Utils.showToast('Gagal memuat produk. Silakan coba lagi.', 'error');
            Utils.hideLoading(document.getElementById('loadingState'));
            this.showError();
        }
    }

    renderProduct() {
        if (!this.product) { this.showError(); return; }

        document.getElementById('productImage')?.setAttribute('src', this.product.image || CONFIG.DEFAULT_PRODUCT_IMAGE);
        document.getElementById('productImage')?.setAttribute('alt', this.product.name);
        document.getElementById('productName')?.textContent = this.product.name;
        document.getElementById('productPrice')?.textContent = Utils.formatCurrency(this.product.price);
        document.getElementById('productStock')?.textContent = this.product.stock > 0 ? `${this.product.stock} item` : 'Habis';
        document.getElementById('productDescription')?.textContent = this.product.description || 'Tidak ada deskripsi';

        const quantityInput = document.getElementById('quantity');
        if (quantityInput) quantityInput.max = this.product.stock;

        this.updateTotalPrice();

        const orderBtn = document.getElementById('orderBtn');
        if (orderBtn) {
            orderBtn.disabled = this.product.stock <= 0;
            orderBtn.textContent = this.product.stock > 0 ? 'Pesan Sekarang' : 'Stok Habis';
            orderBtn.classList.toggle('bg-gray-400', this.product.stock <= 0);
            orderBtn.classList.toggle('cursor-not-allowed', this.product.stock <= 0);
            orderBtn.classList.toggle('bg-green-600', this.product.stock > 0);
            orderBtn.classList.toggle('hover:bg-green-700', this.product.stock > 0);
        }

        document.getElementById('productDetail')?.classList.remove('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('errorState')?.classList.add('hidden');

        document.title = `${this.product.name} - ${CONFIG.SITE_NAME}`;
    }

    updateQuantity() {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) quantityInput.value = this.quantity;
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        const total = this.product && this.quantity ? this.product.price * this.quantity : 0;
        document.getElementById('totalPrice')?.textContent = Utils.formatCurrency(total);
    }

    goToOrder() {
        if (!this.product || this.product.stock <= 0) {
            Utils.showToast('Produk tidak tersedia', 'error');
            return;
        }

        sessionStorage.setItem('orderData', JSON.stringify({
            product: this.product,
            quantity: this.quantity,
            totalPrice: this.product.price * this.quantity
        }));
        window.location.href = 'order.html';
    }

    showError() {
        document.getElementById('productDetail')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('errorState')?.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new ProductDetail());
