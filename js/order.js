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
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
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

        // Update UI
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(m => {
            m.classList.remove('selected');
        });
        
        const selectedMethod = document.querySelector(`[data-method="${method}"]`);
        if (selectedMethod) {
            selectedMethod.classList.add('selected');
        }

        // Show payment instructions
        this.showPaymentInstructions(method);
    }

    showPaymentInstructions(method) {
        const instructionsContainer = document.getElementById('paymentInstructions');
        const proofSection = document.getElementById('paymentProofSection');
        
        // Hide all instructions
        document.getElementById('qrisInstructions').classList.add('hidden');
        document.getElementById('transferInstructions').classList.add('hidden');
        document.getElementById('codInstructions').classList.add('hidden');
        
        // Show relevant instructions
        switch (method) {
            case 'qris':
                document.getElementById('qrisInstructions').classList.remove('hidden');
                document.getElementById('qrisAmount').textContent = Utils.formatCurrency(this.orderData.totalPrice);
                proofSection.classList.remove('hidden');
                break;
            case 'transfer':
                document.getElementById('transferInstructions').classList.remove('hidden');
                document.getElementById('transferAmount').textContent = Utils.formatCurrency(this.orderData.totalPrice);
                proofSection.classList.remove('hidden');
                break;
            case 'cod':
                document.getElementById('codInstructions').classList.remove('hidden');
                document.getElementById('codAmount').textContent = Utils.formatCurrency(this.orderData.totalPrice);
                proofSection.classList.add('hidden');
                break;
        }
        
        instructionsContainer.classList.remove('hidden');
        instructionsContainer.classList.add('fade-in');
    }

    async handlePaymentProofUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            Utils.validateImageFile(file);
            
            const base64 = await Utils.convertImageToBase64(file);
            this.paymentProofImage = base64;
            
            // Show preview
            const previewContainer = document.getElementById('previewContainer');
            const previewImage = document.getElementById('previewImage');
            
            previewImage.src = base64;
            previewContainer.classList.remove('hidden');
            
        } catch (error) {
            Utils.showToast(error.message, 'error');
            event.target.value = '';
        }
    }

    removePaymentProof() {
        this.paymentProofImage = null;
        
        const previewContainer = document.getElementById('previewContainer');
        const paymentProofInput = document.getElementById('paymentProof');
        
        previewContainer.classList.add('hidden');
        paymentProofInput.value = '';
    }

    validateForm() {
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();

        if (!customerName) {
            Utils.showToast('Nama lengkap harus diisi', 'error');
            return false;
        }

        if (!customerPhone) {
            Utils.showToast('Nomor WhatsApp harus diisi', 'error');
            return false;
        }

        if (!Utils.validatePhoneNumber(customerPhone)) {
            Utils.showToast('Nomor WhatsApp tidak valid', 'error');
            return false;
        }

        if (!this.selectedPaymentMethod) {
            Utils.showToast('Pilih metode pembayaran', 'error');
            return false;
        }

        if (this.selectedPaymentMethod !== 'cod' && !this.paymentProofImage) {
            Utils.showToast('Upload bukti pembayaran', 'error');
            return false;
        }

        return true;
    }

    async submitOrder() {
        if (!this.validateForm()) {
            return;
        }

        try {
            Utils.showLoading(document.getElementById('loadingOverlay'));

            const orderData = {
                order_id: Utils.generateOrderId(),
                date: new Date().toISOString(),
                name: document.getElementById('customerName').value.trim(),
                phone: document.getElementById('customerPhone').value.trim(),
                product_id: this.orderData.product.id,
                qty: this.orderData.quantity,
                note: document.getElementById('customerNote').value.trim(),
                payment_method: this.selectedPaymentMethod,
                payment_status: this.selectedPaymentMethod === 'cod' ? 'Pending' : 'Pending',
                payment_proof: this.paymentProofImage || '',
                order_status: 'Pending',
                tracking_link: ''
            };

            const response = await Utils.apiCall('/order', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            Utils.hideLoading(document.getElementById('loadingOverlay'));

            if (response.success) {
                // Store order details for success page
                sessionStorage.setItem('orderDetails', JSON.stringify({
                    ...orderData,
                    product_name: this.orderData.product.name,
                    total_price: this.orderData.totalPrice
                }));

                // Clear order data
                sessionStorage.removeItem('orderData');

                // Redirect to success page
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