// JavaScript for product.html (Product Detail)

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
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityInput = document.getElementById('quantity');

        decreaseBtn?.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                this.updateQuantity();
            }
        });

        increaseBtn?.addEventListener('click', () => {
            if (this.product && this.quantity < this.product.stock) {
                this.quantity++;
                this.updateQuantity();
            } else {
                Utils.showToast('Stok tidak mencukupi', 'warning');
            }
        });

        quantityInput?.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0 && this.product && newQuantity <= this.product.stock) {
                this.quantity = newQuantity;
                this.updateQuantity();
            } else {
                e.target.value = this.quantity;
                Utils.showToast('Jumlah tidak valid', 'warning');
            }
        });

        const orderBtn = document.getElementById('orderBtn');
        orderBtn?.addEventListener('click', () => this.goToOrder());
    }

    async loadProduct() {
        try {
            const productId = Utils.getUrlParameter('id');
            if (!productId) {
                this.showError();
                return;
            }

            Utils.showLoading(document.getElementById('loadingState'));

            const response = await Utils.apiCall(`?action=getProduct&id=${productId}`);
            this.product = response.product;

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
        if (!this.product) {
            this.showError();
            return;
        }

        const productDetail = document.getElementById('productDetail');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');

        document.getElementById('productImage').src = this.product.image || CONFIG.DEFAULT_PRODUCT_IMAGE;
        document.getElementById('productImage').alt = this.product.name;
        document.getElementById('productName').textContent = this.product.name;
        document.getElementById('productPrice').textContent = Utils.formatCurrency(this.product.price);
        document.getElementById('productStock').textContent = this.product.stock > 0 ? `${this.product.stock} item` : 'Habis';
        document.getElementById('productDescription').textContent = this.product.description || 'Tidak ada deskripsi';

        const quantityInput = document.getElementById('quantity');
        if (quantityInput) quantityInput.max = this.product.stock;

        this.updateTotalPrice();

        const orderBtn = document.getElementById('orderBtn');
        if (orderBtn) {
            orderBtn.disabled = this.product.stock <= 0;
            if (this.product.stock <= 0) {
                orderBtn.textContent = 'Stok Habis';
                orderBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
                orderBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            }
        }

        productDetail.classList.remove('hidden');
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');

        document.title = `${this.product.name} - ${CONFIG.SITE_NAME}`;
    }

    updateQuantity() {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) quantityInput.value = this.quantity;
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        if (this.product) {
            const totalPrice = this.product.price * this.quantity;
            document.getElementById('totalPrice').textContent = Utils.formatCurrency(totalPrice);
        }
    }

    goToOrder() {
        if (!this.product || this.product.stock <= 0) {
            Utils.showToast('Produk tidak tersedia', 'error');
            return;
        }

        const orderData = {
            product: this.product,
            quantity: this.quantity,
            totalPrice: this.product.price * this.quantity
        };

        sessionStorage.setItem('orderData', JSON.stringify(orderData));
        window.location.href = 'order.html';
    }

    showError() {
        document.getElementById('productDetail')?.classList.add('hidden');
        document.getElementById('loadingState')?.classList.add('hidden');
        document.getElementById('errorState')?.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductDetail();
});
