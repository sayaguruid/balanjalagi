// JavaScript for order.html (Order Form)

class OrderForm {
    constructor() {
        this.orderData = null;
        this.selectedPaymentMethod = null;
        this.paymentProofImage = null;
        this.init();
    }

    init() {
        this.loadOrderData();
        this.setupEventListeners();
        this.renderOrderInfo();
    }

    loadOrderData() {
        const storedData = sessionStorage.getItem('orderData');
        if (!storedData) {
            Utils.showToast('Data pesanan tidak ditemukan. Silakan pilih produk terlebih dahulu.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        this.orderData = JSON.parse(storedData);
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                this.selectPaymentMethod(method.dataset.method);
            });
        });

        // Form submission
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }

        // Payment proof upload
        const paymentProofInput = document.getElementById('paymentProof');
        if (paymentProofInput) {
            paymentProofInput.addEventListener('change', (e) => {
                this.handlePaymentProofUpload(e);
            });
        }

        // Remove image button
        const removeImageBtn = document.getElementById('removeImage');
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.removePaymentProof();
            });
        }
    }

    renderOrderInfo() {
        if (!this.orderData) return;

        const { product, quantity, totalPrice } = this.orderData;

        document.getElementById('productImage').src = product.image || CONFIG.DEFAULT_PRODUCT_IMAGE;
        document.getElementById('productImage').alt = product.name;
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = Utils.formatCurrency(product.price);
        document.getElementById('productQty').textContent = quantity;
        document.getElementById('totalPrice').textContent = Utils.formatCurrency(totalPrice);
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;

        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        document.querySelector(`[data-method="${method}"]`)?.classList.add('selected');

        this.showPaymentInstructions(method);
    }

    showPaymentInstructions(method) {
        const proofSection = document.getElementById('paymentProofSection');
        const container = document.getElementById('paymentInstructions');

        ['qrisInstructions', 'transferInstructions', 'codInstructions']
            .forEach(id => document.getElementById(id).classList.add('hidden'));

        switch (method) {
            case 'qris':
                document.getElementById('qrisInstructions').classList.remove('hidden');
                document.getElementById('qrisAmount').textContent =
                    Utils.formatCurrency(this.orderData.totalPrice);
                proofSection.classList.remove('hidden');
                break;

            case 'transfer':
                document.getElementById('transferInstructions').classList.remove('hidden');
                document.getElementById('transferAmount').textContent =
                    Utils.formatCurrency(this.orderData.totalPrice);
                proofSection.classList.remove('hidden');
                break;

            case 'cod':
                document.getElementById('codInstructions').classList.remove('hidden');
                proofSection.classList.add('hidden');
                break;
        }

        container.classList.remove('hidden');
        container.classList.add('fade-in');
    }

    async handlePaymentProofUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            Utils.validateImageFile(file);
            const base64 = await Utils.convertImageToBase64(file);
            this.paymentProofImage = base64;

            const previewImage = document.getElementById('previewImage');
            const previewContainer = document.getElementById('previewContainer');

            previewImage.src = base64;
            previewContainer.classList.remove('hidden');

        } catch (error) {
            Utils.showToast(error.message, 'error');
            event.target.value = '';
        }
    }

    removePaymentProof() {
        this.paymentProofImage = null;
        document.getElementById('previewContainer').classList.add('hidden');
        document.getElementById('paymentProof').value = '';
    }

    validateForm() {
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();

        if (!name) return Utils.showToast('Nama lengkap harus diisi', 'error'), false;
        if (!phone) return Utils.showToast('Nomor WhatsApp harus diisi', 'error'), false;
        if (!Utils.validatePhoneNumber(phone))
            return Utils.showToast('Nomor WhatsApp tidak valid', 'error'), false;

        if (!this.selectedPaymentMethod)
            return Utils.showToast('Pilih metode pembayaran', 'error'), false;

        if (this.selectedPaymentMethod !== 'cod' && !this.paymentProofImage)
            return Utils.showToast('Upload bukti pembayaran', 'error'), false;

        return true;
    }

    async submitOrder() {
        if (!this.validateForm()) return;

        try {
            Utils.showLoading(document.getElementById('loadingOverlay'));

            const orderId = Utils.generateOrderId();

            const payload = {
                action: 'createOrder',
                order_id: orderId,
                date: new Date().toISOString(),
                customer_name: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                product_id: this.orderData.product.id,
                qty: this.orderData.quantity,
                note: document.getElementById('customerNote').value.trim(),
                total_price: this.orderData.totalPrice,
                payment_method: this.selectedPaymentMethod,
                payment_status: this.selectedPaymentMethod === 'cod' ? 'Pending' : 'Pending',
                payment_proof: this.paymentProofImage || '',
                order_status: 'Pending',
                tracking_link: Utils.generateTrackingLink(orderId)
            };

            const response = await Utils.apiCall('?action=createOrder', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            Utils.hideLoading(document.getElementById('loadingOverlay'));

            if (response.success) {
                sessionStorage.setItem('orderDetails', JSON.stringify({
                    ...payload,
                    product_name: this.orderData.product.name
                }));

                sessionStorage.removeItem('orderData');
                window.location.href = 'success.html';
            } else {
                Utils.showToast(response.message || 'Gagal membuat pesanan', 'error');
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            Utils.hideLoading(document.getElementById('loadingOverlay'));
            Utils.showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        }
    }
}

// Initialize the order form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderForm();
});
