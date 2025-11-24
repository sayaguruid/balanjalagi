// Main JavaScript for index.html (Product Catalog)

class ProductCatalog {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.sortBy = 'name';
        this.searchTerm = '';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProducts();
        this.renderProducts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndRenderProducts();
            }, 300));
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndRenderProducts();
            });
        }
    }

    async loadProducts() {
        try {
            Utils.showLoading(document.getElementById('loadingState'));
            
            const response = await Utils.apiCall('/products');
            this.products = response.products || [];
            this.filteredProducts = [...this.products];
            
            Utils.hideLoading(document.getElementById('loadingState'));
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Gagal memuat produk. Silakan coba lagi.', 'error');
            Utils.hideLoading(document.getElementById('loadingState'));
            this.showErrorState();
        }
    }

    filterAndRenderProducts() {
        // Filter products based on search term
        this.filteredProducts = this.products.filter(product => {
            if (this.searchTerm) {
                return product.name.toLowerCase().includes(this.searchTerm) ||
                       product.description.toLowerCase().includes(this.searchTerm);
            }
            return true;
        });

        // Sort products
        this.sortProducts();

        // Render products
        this.renderProducts();
    }

    sortProducts() {
        switch (this.sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            default:
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        productsGrid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');

        // Add click event listeners to product cards
        this.attachProductCardListeners();
    }

    createProductCard(product) {
        const imageUrl = product.image || CONFIG.DEFAULT_PRODUCT_IMAGE;
        const price = Utils.formatCurrency(product.price);
        const stockText = product.stock > 0 ? `Stok: ${product.stock}` : 'Habis';
        const stockClass = product.stock > 0 ? 'text-green-600' : 'text-red-600';

        return `
            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer" data-product-id="${product.id}">
                <div class="relative">
                    <img src="${imageUrl}" alt="${product.name}" class="w-full h-48 object-cover">
                    ${product.stock <= 0 ? '<div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"><span class="text-white font-bold">Habis</span></div>' : ''}
                </div>
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-2">${Utils.sanitizeHtml(product.name)}</h3>
                    <p class="text-sm text-gray-600 mb-2">${Utils.truncateText(product.description || '', 60)}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-green-600">${price}</span>
                        <span class="text-sm ${stockClass}">${stockText}</span>
                    </div>
                </div>
            </div>
        `;
    }

    attachProductCardListeners() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                window.location.href = `product.html?id=${productId}`;
            });
        });
    }

    showErrorState() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');
        
        productsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.querySelector('h3').textContent = 'Gagal memuat produk';
        emptyState.querySelector('p').textContent = 'Terjadi kesalahan saat memuat produk. Silakan refresh halaman.';
    }
}

// Initialize the product catalog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductCatalog();
});