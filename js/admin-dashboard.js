// JavaScript for admin-dashboard.html (Admin Dashboard)

class AdminDashboard {
    constructor() {
        this.orders = [];
        this.products = [];
        this.currentTab = 'orders';
        this.init();
    }

    init() {
        if (!Utils.requireAdmin()) return;

        this.setupEventListeners();
        this.loadAdminInfo();
        this.loadOrders();
        this.loadProducts();
        this.renderStats();
    }

    setupEventListeners() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Search and filter
        const searchOrder = document.getElementById('searchOrder');
        if (searchOrder) {
            searchOrder.addEventListener('input', Utils.debounce(() => {
                this.filterOrders();
            }, 300));
        }

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.addEventListener('change', () => {
                this.filterOrders();
            });
        }

        // Product modal
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showProductModal();
            });
        }

        const closeProductModal = document.getElementById('closeProductModal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => {
                this.hideProductModal();
            });
        }

        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) {
            cancelProductBtn.addEventListener('click', () => {
                this.hideProductModal();
            });
        }

        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Order modal
        const closeOrderModal = document.getElementById('closeOrderModal');
        if (closeOrderModal) {
            closeOrderModal.addEventListener('click', () => {
                this.hideOrderModal();
            });
        }
    }

    loadAdminInfo() {
        const adminInfo = Utils.getAdminInfo();
        if (adminInfo.name) {
            document.getElementById('adminName').textContent = adminInfo.name;
        }
    }

    async loadOrders() {
        try {
            const response = await Utils.apiCall('/admin/orders');
            this.orders = response.orders || [];
            this.renderOrders();
            this.renderStats();
        } catch (error) {
            console.error('Error loading orders:', error);
            Utils.showToast('Gagal memuat pesanan', 'error');
        }
    }

    async loadProducts() {
        try {
            const response = await Utils.apiCall('/products');
            this.products = response.products || [];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Gagal memuat produk', 'error');
        }
    }

    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('border-green-500', 'text-green-600');
                btn.classList.remove('border-transparent', 'text-gray-600');
            } else {
                btn.classList.remove('border-green-500', 'text-green-600');
                btn.classList.add('border-transparent', 'text-gray-600');
            }
        });

        // Update tab content
        document.getElementById('ordersTab').classList.toggle('hidden', tab !== 'orders');
        document.getElementById('productsTab').classList.toggle('hidden', tab !== 'products');
    }

    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        const emptyState = document.getElementById('emptyOrders');

        if (this.orders.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = this.orders.map(order => this.createOrderRow(order)).join('');

        // Add event listeners
        this.attachOrderRowListeners();
    }

    createOrderRow(order) {
        const paymentStatusBadge = Utils.getStatusBadge(order.payment_status, 'payment');
        const orderStatusBadge = Utils.getStatusBadge(order.order_status, 'order');

        return `
            <tr class="order-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="font-medium">${order.order_id}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${Utils.formatDate(order.date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${order.name}</div>
                        <div class="text-sm text-gray-600">${order.phone}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${order.product_name || 'Produk'}</div>
                    <div class="text-sm text-gray-600">Qty: ${order.qty}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${Utils.formatCurrency(order.total_price || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${paymentStatusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${orderStatusBadge}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="adminDashboard.viewOrder('${order.order_id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="adminDashboard.updateOrderStatus('${order.order_id}')" class="text-green-600 hover:text-green-900 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    attachOrderRowListeners() {
        // Event listeners are attached via onclick attributes in the HTML
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');

        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Belum ada produk</td></tr>';
            return;
        }

        tbody.innerHTML = this.products.map(product => this.createProductRow(product)).join('');
    }

    createProductRow(product) {
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <img src="${product.image || CONFIG.DEFAULT_PRODUCT_IMAGE}" alt="${product.name}" class="w-16 h-16 object-cover rounded">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-600">${Utils.truncateText(product.description || '', 50)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${Utils.formatCurrency(product.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${product.stock}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button onclick="adminDashboard.editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900 mr-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminDashboard.deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    renderStats() {
        const totalOrders = this.orders.length;
        const pendingPayment = this.orders.filter(o => o.payment_status === 'Pending').length;
        const processingOrders = this.orders.filter(o => o.order_status === 'Diproses').length;
        const completedOrders = this.orders.filter(o => o.order_status === 'Selesai').length;

        document.getElementById('totalOrders').textContent = totalOrders;
        document.getElementById('pendingPayment').textContent = pendingPayment;
        document.getElementById('processingOrders').textContent = processingOrders;
        document.getElementById('completedOrders').textContent = completedOrders;
    }

    filterOrders() {
        const searchTerm = document.getElementById('searchOrder').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;

        const filteredOrders = this.orders.filter(order => {
            const matchesSearch = order.order_id.toLowerCase().includes(searchTerm) ||
                                 order.name.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || order.order_status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        const tbody = document.getElementById('ordersTableBody');
        if (filteredOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Tidak ada pesanan yang cocok</td></tr>';
        } else {
            tbody.innerHTML = filteredOrders.map(order => this.createOrderRow(order)).join('');
            this.attachOrderRowListeners();
        }
    }

    async viewOrder(orderId) {
        try {
            const response = await Utils.apiCall(`/admin/order?id=${orderId}`);
            if (response.success) {
                this.showOrderModal(response.order);
            }
        } catch (error) {
            console.error('Error viewing order:', error);
            Utils.showToast('Gagal memuat detail pesanan', 'error');
        }
    }

    showOrderModal(order) {
        const modal = document.getElementById('orderModal');
        const modalBody = document.getElementById('orderModalBody');

        modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold mb-2">Informasi Pesanan</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Order ID:</span>
                            <span class="font-medium">${order.order_id}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Tanggal:</span>
                            <span class="font-medium">${Utils.formatDate(order.date)}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Pelanggan</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-gray-600">Nama:</span>
                            <span class="font-medium">${order.name}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">WhatsApp:</span>
                            <span class="font-medium">${order.phone}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Pesanan</h4>
                    <div class="text-sm">
                        <div>
                            <span class="text-gray-600">Produk:</span>
                            <span class="font-medium">${order.product_name || 'Produk'}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Jumlah:</span>
                            <span class="font-medium">${order.qty}</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Total:</span>
                            <span class="font-medium text-green-600">${Utils.formatCurrency(order.total_price || 0)}</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-2">Status</h4>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Pembayaran:</span>
                            ${Utils.getStatusBadge(order.payment_status, 'payment')}
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-600">Pesanan:</span>
                            ${Utils.getStatusBadge(order.order_status, 'order')}
                        </div>
                    </div>
                </div>
                
                ${order.payment_proof ? `
                <div>
                    <h4 class="font-semibold mb-2">Bukti Pembayaran</h4>
                    <img src="${order.payment_proof}" alt="Bukti Pembayaran" class="max-h-48 rounded">
                </div>
                ` : ''}
                
                <div>
                    <h4 class="font-semibold mb-2">Update Status</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                            <select id="updatePaymentStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="Pending" ${order.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Dibayar" ${order.payment_status === 'Dibayar' ? 'selected' : ''}>Dibayar</option>
                                <option value="Gagal" ${order.payment_status === 'Gagal' ? 'selected' : ''}>Gagal</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Status Pesanan</label>
                            <select id="updateOrderStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="Pending" ${order.order_status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Diproses" ${order.order_status === 'Diproses' ? 'selected' : ''}>Diproses</option>
                                <option value="Dikirim" ${order.order_status === 'Dikirim' ? 'selected' : ''}>Dikirim</option>
                                <option value="Selesai" ${order.order_status === 'Selesai' ? 'selected' : ''}>Selesai</option>
                            </select>
                        </div>
                    </div>
                    <button onclick="adminDashboard.saveOrderStatus('${order.order_id}')" class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Simpan Status
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    hideOrderModal() {
        document.getElementById('orderModal').classList.remove('active');
    }

    async saveOrderStatus(orderId) {
        const paymentStatus = document.getElementById('updatePaymentStatus').value;
        const orderStatus = document.getElementById('updateOrderStatus').value;

        try {
            const response = await Utils.apiCall('/admin/update-order-status', {
                method: 'POST',
                body: JSON.stringify({
                    order_id: orderId,
                    payment_status: paymentStatus,
                    order_status: orderStatus
                })
            });

            if (response.success) {
                Utils.showToast('Status berhasil diperbarui', 'success');
                this.hideOrderModal();
                this.loadOrders();
            } else {
                Utils.showToast(response.message || 'Gagal memperbarui status', 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    updateOrderStatus(orderId) {
        this.viewOrder(orderId);
    }

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

    hideProductModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.showProductModal(product);
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            return;
        }

        try {
            const response = await Utils.apiCall('/admin/delete-product', {
                method: 'POST',
                body: JSON.stringify({ product_id: productId })
            });

            if (response.success) {
                Utils.showToast('Produk berhasil dihapus', 'success');
                this.loadProducts();
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
            const endpoint = productId ? '/admin/edit-product' : '/admin/create-product';
            const body = productId ? { product_id: productId, ...productData } : productData;

            const response = await Utils.apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (response.success) {
                Utils.showToast(productId ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan', 'success');
                this.hideProductModal();
                this.loadProducts();
            } else {
                Utils.showToast(response.message || 'Gagal menyimpan produk', 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            Utils.showToast('Terjadi kesalahan', 'error');
        }
    }

    handleLogout() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            Utils.clearAdminSession();
            Utils.showToast('Logout berhasil', 'success');
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 1000);
        }
    }
}

// Global instance for onclick handlers
let adminDashboard;

// Initialize the admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});