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
        if (this.product) {
            this.renderProduct();
        }
    }

    setupEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityInput = document.getElementById('quantity');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    this.updateQuantity();
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                if (this.product && this.quantity < this.product.stock) {
                    this.quantity++;
                    this.updateQuantity();
                } else {
                    Utils.showToast('Stok tidak mencukupi', 'warning');
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0 && this.product && newQuantity <= this.product.stock) {
                    this.quantity = newQuantity;
                    this.updateQuantity();
                } else {
                    e.target.value = this.quantity;
                    Utils.showToast('Jumlah tidak valid', 'warning');
                }
            });
        }

        // Order button
        const orderBtn = document.getElementById('orderBtn');
        if (orderBtn) {
            orderBtn.addEventListener('click', () => {
                this.goToOrder();
            });
        }
    }

    async loadProduct() {
        try {
            const productId = Utils.getUrlParameter('id');
            if (!productId) {
                this.showError();
                return;
            }

            Utils.showLoading(document.getElementById('loadingState'));
            
            const response = await Utils.apiCall(`/product?id=${productId}`);
            this.product = response.product;
            
            Utils.hideLoading(document.getElementById('loadingState'));
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

        // Update product information
        document.getElementById('productImage').src = this.product.image || CONFIG.DEFAULT_PRODUCT_IMAGE;
        document.getElementById('productImage').alt = this.product.name;
        document.getElementById('productName').textContent = this.product.name;
        document.getElementById('productPrice').textContent = Utils.formatCurrency(this.product.price);
        document.getElementById('productStock').textContent = this.product.stock > 0 ? `${this.product.stock} item` : 'Habis';
        document.getElementById('productDescription').textContent = this.product.description || 'Tidak ada deskripsi';

        // Update quantity input max value
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.max = this.product.stock;
        }

        // Update total price
        this.updateTotalPrice();

        // Show/hide order button based on stock
        const orderBtn = document.getElementById('orderBtn');
        if (orderBtn) {
            orderBtn.disabled = this.product.stock <= 0;
            if (this.product.stock <= 0) {
                orderBtn.textContent = 'Stok Habis';
                orderBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
                orderBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
            }
        }

        // Show product detail, hide loading and error states
        productDetail.classList.remove('hidden');
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');

        // Update page title
        document.title = `${this.product.name} - ${CONFIG.SITE_NAME}`;
    }

    updateQuantity() {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.value = this.quantity;
        }
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

        // Store product data in sessionStorage for order page
        const orderData = {
            product: this.product,
            quantity: this.quantity,
            totalPrice: this.product.price * this.quantity
        };
        
        sessionStorage.setItem('orderData', JSON.stringify(orderData));
        
        // Redirect to order page
        window.location.href = 'order.html';
    }

    showError() {
        const productDetail = document.getElementById('productDetail');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');

        productDetail.classList.add('hidden');
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

// Initialize the product detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductDetail();
});