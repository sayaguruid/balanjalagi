// admin-dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
    const adminNameEl = document.getElementById('adminName');
    const logoutBtn = document.getElementById('logoutBtn');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const emptyOrders = document.getElementById('emptyOrders');
    const productsTableBody = document.getElementById('productsTableBody');

    const searchOrderInput = document.getElementById('searchOrder');
    const filterStatusSelect = document.getElementById('filterStatus');

    const orderModal = document.getElementById('orderModal');
    const orderModalBody = document.getElementById('orderModalBody');
    const closeOrderModalBtn = document.getElementById('closeOrderModal');

    const productModal = document.getElementById('productModal');
    const productModalTitle = document.getElementById('productModalTitle');
    const closeProductModalBtn = document.getElementById('closeProductModal');
    const productForm = document.getElementById('productForm');
    const cancelProductBtn = document.getElementById('cancelProductBtn');

    const addProductBtn = document.getElementById('addProductBtn');

    // === Utility Variables ===
    let orders = [];
    let products = [];
    let editingProduct = null;

    // === Tab Switching ===
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.replace('border-green-500', 'border-transparent'));
            tabButtons.forEach(b => b.classList.replace('text-green-600', 'text-gray-600'));
            btn.classList.replace('border-transparent', 'border-green-500');
            btn.classList.replace('text-gray-600', 'text-green-600');

            const target = btn.dataset.tab;
            tabContents.forEach(tc => tc.classList.add('hidden'));
            document.getElementById(target + 'Tab').classList.remove('hidden');
        });
    });

    // === Logout ===
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });

    // === Load Admin Info ===
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    adminNameEl.textContent = 'Admin'; // bisa ambil dari token decoded jika ada

    // === Load Orders & Stats ===
    async function loadOrders() {
        try {
            Utils.showLoading(document.body);
            orders = await Utils.getOrders();
            renderOrdersTable(orders);
            renderOrderStats(orders);
        } catch (err) {
            Utils.showToast('Gagal memuat pesanan', 'error');
            console.error(err);
        } finally {
            Utils.hideLoading(document.body);
        }
    }

    function renderOrdersTable(list) {
        ordersTableBody.innerHTML = '';
        if (list.length === 0) {
            emptyOrders.classList.remove('hidden');
            return;
        } else {
            emptyOrders.classList.add('hidden');
        }

        list.forEach(order => {
            const tr = document.createElement('tr');
            tr.className = 'order-row';

            const statusColor = {
                pending: 'bg-yellow-100 text-yellow-600',
                diproses: 'bg-blue-100 text-blue-600',
                dikirim: 'bg-indigo-100 text-indigo-600',
                selesai: 'bg-green-100 text-green-600'
            }[order.status] || 'bg-gray-100 text-gray-600';

            tr.innerHTML = `
                <td class="px-6 py-4 font-mono">${order.id}</td>
                <td class="px-6 py-4">${Utils.formatDate(order.date)}</td>
                <td class="px-6 py-4">${Utils.sanitizeHtml(order.customerName)}</td>
                <td class="px-6 py-4">${order.items.map(i => i.name).join(', ')}</td>
                <td class="px-6 py-4">${Utils.formatCurrency(order.total)}</td>
                <td class="px-6 py-4">${order.paymentStatus || '-'}</td>
                <td class="px-6 py-4"><span class="status-badge px-2 py-1 rounded ${statusColor}">${order.status}</span></td>
                <td class="px-6 py-4">
                    <button class="view-order-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            ordersTableBody.appendChild(tr);
        });

        // Detail Order Modal
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const order = orders.find(o => o.id === id);
                if (!order) return;
                orderModalBody.innerHTML = `
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Tanggal:</strong> ${Utils.formatDate(order.date)}</p>
                    <p><strong>Pelanggan:</strong> ${Utils.sanitizeHtml(order.customerName)}</p>
                    <p><strong>Alamat:</strong> ${Utils.sanitizeHtml(order.address)}</p>
                    <p><strong>Total:</strong> ${Utils.formatCurrency(order.total)}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <h4 class="mt-4 font-semibold">Produk:</h4>
                    <ul>${order.items.map(i => `<li>${i.name} x ${i.qty}</li>`).join('')}</ul>
                `;
                orderModal.classList.add('active');
            });
        });
    }

    function renderOrderStats(list) {
        document.getElementById('totalOrders').textContent = list.length;
        document.getElementById('pendingPayment').textContent = list.filter(o => o.status === 'pending').length;
        document.getElementById('processingOrders').textContent = list.filter(o => o.status === 'diproses').length;
        document.getElementById('completedOrders').textContent = list.filter(o => o.status === 'selesai').length;
    }

    // === Search & Filter ===
    const debouncedFilter = Utils.debounce(() => {
        const keyword = searchOrderInput.value.toLowerCase();
        const status = filterStatusSelect.value;
        const filtered = orders.filter(o => 
            (o.id.toLowerCase().includes(keyword) || o.customerName.toLowerCase().includes(keyword)) &&
            (status === '' || o.status === status)
        );
        renderOrdersTable(filtered);
    }, 300);

    searchOrderInput.addEventListener('input', debouncedFilter);
    filterStatusSelect.addEventListener('change', debouncedFilter);

    closeOrderModalBtn.addEventListener('click', () => orderModal.classList.remove('active'));

    // === Load Products ===
    async function loadProducts() {
        try {
            Utils.showLoading(document.body);
            products = await Utils.getProducts();
            renderProductsTable(products);
        } catch (err) {
            Utils.showToast('Gagal memuat produk', 'error');
            console.error(err);
        } finally {
            Utils.hideLoading(document.body);
        }
    }

    function renderProductsTable(list) {
        productsTableBody.innerHTML = '';
        list.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4"><img src="${Utils.sanitizeHtml(p.image)}" class="w-16 h-16 object-cover rounded"></td>
                <td class="px-6 py-4">${Utils.sanitizeHtml(p.name)}</td>
                <td class="px-6 py-4">${Utils.formatCurrency(p.price)}</td>
                <td class="px-6 py-4">${p.stock}</td>
                <td class="px-6 py-4 space-x-2">
                    <button class="edit-product-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-product-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                editingProduct = products.find(p => p.id === id);
                if (!editingProduct) return;
                productModalTitle.textContent = 'Edit Produk';
                productForm.productId.value = editingProduct.id;
                productForm.productName.value = editingProduct.name;
                productForm.productPrice.value = editingProduct.price;
                productForm.productStock.value = editingProduct.stock;
                productForm.productImage.value = editingProduct.image;
                productForm.productDescription.value = editingProduct.description;
                productModal.classList.add('active');
            });
        });

        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (!confirm('Hapus produk ini?')) return;
                try {
                    await Utils.deleteProduct({ id });
                    Utils.showToast('Produk berhasil dihapus', 'success');
                    loadProducts();
                } catch (err) {
                    Utils.showToast('Gagal menghapus produk', 'error');
                    console.error(err);
                }
            });
        });
    }

    // === Product Modal Handlers ===
    addProductBtn.addEventListener('click', () => {
        editingProduct = null;
        productModalTitle.textContent = 'Tambah Produk';
        productForm.reset();
        productModal.classList.add('active');
    });

    closeProductModalBtn.addEventListener('click', () => productModal.classList.remove('active'));
    cancelProductBtn.addEventListener('click', () => productModal.classList.remove('active'));

    productForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = {
            id: productForm.productId.value,
            name: productForm.productName.value,
            price: parseFloat(productForm.productPrice.value),
            stock: parseInt(productForm.productStock.value),
            image: productForm.productImage.value,
            description: productForm.productDescription.value
        };
        try {
            if (editingProduct) {
                await Utils.editProduct(data);
                Utils.showToast('Produk berhasil diupdate', 'success');
            } else {
                await Utils.createProduct(data);
                Utils.showToast('Produk berhasil ditambahkan', 'success');
            }
            productModal.classList.remove('active');
            loadProducts();
        } catch (err) {
            Utils.showToast('Gagal menyimpan produk', 'error');
            console.error(err);
        }
    });

    // === Initial Load ===
    loadOrders();
    loadProducts();
});
