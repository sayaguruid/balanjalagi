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
            searchInput.addEventListener(
                'input',
                Utils.debounce((e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.filterAndRenderProducts();
                }, 300)
            );
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

            // GAS uses ?action=getProducts
            const response = await Utils.apiCall('?action=getProducts');

            if (!response.success) throw new Error('Invalid API response');

            this.products = response.data || [];
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
        this.filteredProducts = this.products.filter(product => {
            const name = (product.name || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();

            if (this.searchTerm) {
                return name.includes(this.searchTerm) || desc.includes(this.searchTerm);
            }
            return true;
        });

        this.sortProducts();
        this.renderProducts();
    }

    sortProducts() {
        switch (this.sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                );
                break;

            case 'price-low':
                this.filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;

            case 'price-high':
                this.filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;

            default:
                this.filteredProducts.sort((a, b) =>
                    (a.name || '').localeCompare(b.name || '')
                );
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

        productsGrid.innerHTML = this.filteredProducts
            .map(product => this.createProductCard(product))
            .join('');

        this.attachProductCardListeners();
    }

    createProductCard(product) {
        const imageUrl = product.image || CONFIG.DEFAULT_PRODUCT_IMAGE;
        const name = Utils.sanitizeHtml(product.name || 'Produk Tanpa Nama');
        const description = Utils.truncateText(product.description || 'Tidak ada deskripsi', 60);
        const price = Utils.formatCurrency(product.price || 0);

        const stock = parseInt(product.stock) || 0;
        const stockText = stock > 0 ? `Stok: ${stock}` : 'Habis';
        const stockClass = stock > 0 ? 'text-green-600' : 'text-red-600';

        return `
            <div class="product-card bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                data-product-id="${product.id}">
                
                <div class="relative">
                    <img src="${imageUrl}" alt="${name}" class="w-full h-48 object-cover">

                    ${stock <= 0 ? `
                        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span class="text-white font-bold">Habis</span>
                        </div>` 
                    : ''}
                </div>

                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mb-2">${name}</h3>

                    <p class="text-sm text-gray-600 mb-2">
                        ${Utils.sanitizeHtml(description)}
                    </p>

                    <div class="flex justify-between items-center">
                        <span class="text-lg font-bold text-green-600">${price}</span>
                        <span class="text-sm ${stockClass}">${stockText}</span>
                    </div>
                </div>

            </div>
        `;
    }

    attachProductCardListeners() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.productId;
                window.location.href = `product.html?id=${id}`;
            });
        });
    }

    showErrorState() {
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        productsGrid.innerHTML = '';

        emptyState.classList.remove('hidden');
        emptyState.querySelector('h3').textContent = 'Gagal memuat produk';
        emptyState.querySelector('p').textContent =
            'Terjadi kesalahan saat memuat produk. Silakan refresh halaman.';
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductCatalog();
});
