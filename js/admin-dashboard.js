// admin-dashboard.js
class AdminDashboard {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.products = [];
        this.currentTab = 'orders';
        this.init();
    }

    async init() {
        if (!Utils.requireAdmin()) return;

        this.setupEventListeners();
        this.loadAdminInfo();
        await this.loadOrders();
        await this.loadProducts();
        this.renderStats();
    }

    setupEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

        // Search & filter orders
        const searchOrder = document.getElementById('searchOrder');
        const filterStatus = document.getElementById('filterStatus');
        if (searchOrder) searchOrder.addEventListener('input', Utils.debounce(() => this.filterOrders(), 300));
        if (filterStatus) filterStatus.addEventListener('change', () => this.filterOrders());

        // Product modal buttons
        const addProductBtn = document.getElementById('addProductBtn');
        const closeProductModal = document.getElementById('closeProductModal');
        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (addProductBtn) addProductBtn.addEventListener('click', () => this.showProductModal());
        if (closeProductModal) closeProductModal.addEventListener('click', () => this.hideProductModal());
        if (cancelProductBtn) cancelProductBtn.addEventListener('click', () => this.hideProductModal());

        // Product form submit
        const productForm = document.getElementById('productForm');
        if (productForm) productForm.addEventListener('submit', e => {
            e.preventDefault();
            this.saveProduct();
        });

        // Close order modal
        const closeOrderModal = document.getElementById('closeOrderModal');
        if (closeOrderModal) closeOrderModal.addEventListener('click', () => this.hideOrderModal());

        // Close modals when clicking outside
        const productModal = document.getElementById('productModal');
        if (productModal) productModal.addEventListener('click', (e) => {
            if (e.target === productModal) this.hideProductModal();
        });
        const orderModal = document.getElementById('orderModal');
        if (orderModal) orderModal.addEventListener('click', (e) => {
            if (e.target === orderModal) this.hideOrderModal();
        });
    }

    loadAdminInfo() {
        const adminInfo = Utils.getAdminInfo();
        if (adminInfo.name) document.getElementById('adminName').textContent = adminInfo.name;
    }

    // ===========================
    // API CALLS
    // ===========================

    async loadOrders() {
        try {
            const response = await Utils.getOrders();
            this.orders = response || [];
            this.filteredOrders = [...this.orders];
            this.renderOrders();
            this.renderStats();
        } catch (error) {
            console.error('Error loading orders:', error);
            Utils.showToast('Gagal memuat pesanan', 'error');
        }
    }

    async loadProducts() {
        try {
            const response = await Utils.getProducts();
            this.products = response || [];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Gagal memuat produk', 'error');
        }
    }

    async viewOrder(orderId) {
        try {
            const response = await Utils.getOrder(orderId);
            if (response) this.showOrderModal(response);
        } catch (error) {
            console.error('Error viewing order:', error);
            Utils.showToast('Gagal memuat detail pesanan', 'error');
        }
    }

    async saveOrderStatus(orderId) {
        const paymentStatus = document.getElementById('updatePaymentStatus').value;
        const orderStatus = document.getElementById('updateOrderStatus').value;

        try {
            const response = await Utils.updateOrderStatus({
                order_id: orderId,
                payment_status: paymentStatus,
                order_status: orderStatus
            });

            if (response.success) {
                Utils.showToast('Status berhasil diperbarui', 'success');
                this.hideOrderModal();
                await this.loadOrders();
            } else {
                Utils.showToast(response.message || 'Gagal memperbarui status', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

        try {
            const response = await Utils.deleteProduct({ product_id: productId });
            if (response.success) {
                Utils.showToast('Produk berhasil dihapus', 'success');
                await this.loadProducts();
            } else {
                Utils.showToast(response.message || 'Gagal menghapus produk', 'error');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    async saveProduct() {
        const productId = document.getElementById('productId').value;
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value
        };

        try {
            const response = productId
                ? await Utils.editProduct({ product_id: productId, ...productData })
                : await Utils.createProduct(productData);

            if (response.success) {
                Utils.showToast(productId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan', 'success');
                this.hideProductModal();
                await this.loadProducts();
            } else {
                Utils.showToast(response.message || 'Gagal menyimpan produk', 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    // ===========================
    // SEARCH & FILTER ORDERS
    // ===========================
    filterOrders() {
        const query = (document.getElementById('searchOrder')?.value || '').toLowerCase();
        const status = document.getElementById('filterStatus')?.value || 'all';

        this.filteredOrders = this.orders.filter(order => {
            const matchesQuery = order.order_id.toLowerCase().includes(query) || order.name.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || order.order_status === status;
            return matchesQuery && matchesStatus;
        });

        this.renderOrders(this.filteredOrders);
    }

    // ===========================
    // RENDERING
    // ===========================
    renderOrders(orders = this.filteredOrders) {
        const tbody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyOrders');

        if (!orders.length) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = orders.map(order => this.createOrderRow(order)).join('');

        // Attach event listeners
        tbody.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewOrder(btn.dataset.id));
        });
        tbody.querySelectorAll('.update-order-btn').forEach(btn => {
            btn.addEventListener('click', () => this.saveOrderStatus(btn.dataset.id));
        });
    }

    createOrderRow(order) {
        const paymentStatusBadge = Utils.getStatusBadge(order.payment_status, 'payment');
        const orderStatusBadge = Utils.getStatusBadge(order.order_status, 'order');

        return `
            <tr class="order-row">
                <td class="px-6 py-4 whitespace-nowrap">${order.order_id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${Utils.formatDate(order.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${order.name}<br>${order.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${order.product_name || 'Produk'}<br>Qty: ${order.qty}</td>
                <td class="px-6 py-4 whitespace-nowrap text-green-600">${Utils.formatCurrency(order.total_price || 0)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${paymentStatusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap">${orderStatusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="view-order-btn text-blue-600 hover:text-blue-900 mr-2" data-id="${order.order_id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="update-order-btn text-green-600 hover:text-green-900" data-id="${order.order_id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!this.products.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Belum ada produk</td></tr>';
            return;
        }

        tbody.innerHTML = this.products.map(p => this.createProductRow(p)).join('');

        // Attach edit/delete buttons
        tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editProduct(btn.dataset.id));
        });
        tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteProduct(btn.dataset.id));
        });
    }

    createProductRow(product) {
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <img src="${product.image || CONFIG.DEFAULT_PRODUCT_IMAGE}" 
                         alt="${product.name}" 
                         class="w-16 h-16 object-cover rounded"
                         onerror="this.src='${CONFIG.DEFAULT_PRODUCT_IMAGE}'">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${product.name}<br>${Utils.truncateText(product.description || '', 50)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-green-600 text-sm">${Utils.formatCurrency(product.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="edit-product-btn text-blue-600 hover:text-blue-900 mr-2" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-product-btn text-red-600 hover:text-red-900" data-id="${product.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }

    renderStats() {
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('pendingPayment').textContent = this.orders.filter(o => o.payment_status === 'Pending').length;
        document.getElementById('processingOrders').textContent = this.orders.filter(o => o.order_status === 'Diproses').length;
        document.getElementById('completedOrders').textContent = this.orders.filter(o => o.order_status === 'Selesai').length;
    }

    // ===========================
    // MODAL
    // ===========================
    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const modalBody = document.getElementById('orderModalBody');
        // ... bisa pakai template HTML sama seperti sebelumnya
        modal.classList.add('active');
    }

    hideOrderModal() { document.getElementById('orderModal').classList.remove('active'); }

    showProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Edit Produk';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productDescription').value = product.description || '';
        } else {
            title.textContent = 'Tambah Produk';
            form.reset();
            document.getElementById('productId').value = '';
        }

        modal.classList.add('active');
    }

    hideProductModal() { document.getElementById('productModal').classList.remove('active'); }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) this.showProductModal(product);
    }

    handleLogout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            Utils.clearAdminSession();
            Utils.showToast('Logout berhasil', 'success');
            setTimeout(() => window.location.href = 'admin-login.html', 1000);
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('border-green-500', btn.dataset.tab === tab);
            btn.classList.toggle('text-green-600', btn.dataset.tab === tab);
            btn.classList.toggle('border-transparent', btn.dataset.tab !== tab);
            btn.classList.toggle('text-gray-600', btn.dataset.tab !== tab);
        });

        document.getElementById('ordersTab').classList.toggle('hidden', tab !== 'orders');
        document.getElementById('productsTab').classList.toggle('hidden', tab !== 'products');
    }
}

// Global instance
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
