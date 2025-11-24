class ProductCatalog {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.productsGrid = document.getElementById('productsGrid');
        this.loadingState = document.getElementById('loadingState');
        this.emptyState = document.getElementById('emptyState');

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProducts();
    }

    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.filterProducts(e.target.value);
            this.renderProducts();
        }, 300));

        // Sort select
        this.sortSelect.addEventListener('change', (e) => {
            this.sortProducts(e.target.value);
            this.renderProducts();
        });
    }

    async loadProducts() {
        try {
            Utils.showLoading(this.loadingState);
            const data = await Utils.apiCall('products');
            this.products = Array.isArray(data) ? data : [];
            this.filteredProducts = [...this.products];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Gagal memuat produk. Silakan coba lagi.', 'error');
            this.filteredProducts = [];
            this.renderProducts(); // pastikan empty state muncul
        } finally {
            Utils.hideLoading(this.loadingState);
        }
    }

    filterProducts(query) {
        const q = query.trim().toLowerCase();
        this.filteredProducts = this.products.filter(p => p.name.toLowerCase().includes(q));
    }

    sortProducts(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
        }
    }

    renderProducts() {
        this.productsGrid.innerHTML = '';

        if (!this.filteredProducts.length) {
            this.emptyState.classList.remove('hidden');
            return;
        } else {
            this.emptyState.classList.add('hidden');
        }

        this.filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-lg shadow-sm overflow-hidden';

            const imgSrc = product.image || window.CONFIG.DEFAULT_PRODUCT_IMAGE;

            card.innerHTML = `
                <img src="${imgSrc}" alt="${Utils.sanitizeHtml(product.name)}" class="w-full h-48 object-cover" onerror="this.src='${window.CONFIG.DEFAULT_PRODUCT_IMAGE}'">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${Utils.truncateText(Utils.sanitizeHtml(product.name), 50)}</h3>
                    <p class="text-gray-600 mb-2">${Utils.truncateText(Utils.sanitizeHtml(product.description || ''), 80)}</p>
                    <p class="text-green-600 font-bold">${Utils.formatCurrency(product.price)}</p>
                </div>
            `;
            this.productsGrid.appendChild(card);
        });
    }
}

// Init after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductCatalog();
});
