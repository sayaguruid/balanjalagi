// JavaScript for success.html (Order Confirmation)

class OrderSuccess {
    constructor() {
        this.orderDetails = null;
        this.init();
    }

    init() {
        this.loadOrderDetails();
        this.setupEventListeners();
        this.renderOrderDetails();
    }

    loadOrderDetails() {
        const storedDetails = sessionStorage.getItem('orderDetails');
        if (!storedDetails) {
            Utils.showToast('Detail pesanan tidak ditemukan', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        this.orderDetails = JSON.parse(storedDetails);
    }

    setupEventListeners() {
        // Copy link button
        const copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyTrackingLink();
            });
        }
    }

    renderOrderDetails() {
        if (!this.orderDetails) return;

        const { orderDetails } = this;

        // Update order information
        document.getElementById('orderId').textContent = orderDetails.order_id;
        document.getElementById('customerName').textContent = orderDetails.name;
        document.getElementById('customerPhone').textContent = orderDetails.phone;
        document.getElementById('productName').textContent = orderDetails.product_name;
        document.getElementById('productQty').textContent = orderDetails.qty;
        document.getElementById('totalPrice').textContent = Utils.formatCurrency(orderDetails.total_price);
        
        // Payment method
        const paymentMethodText = {
            'qris': 'QRIS',
            'transfer': 'Transfer Bank',
            'cod': 'COD'
        };
        document.getElementById('paymentMethod').textContent = paymentMethodText[orderDetails.payment_method] || orderDetails.payment_method;
        
        // Payment status
        const paymentStatusElement = document.getElementById('paymentStatus');
        const paymentStatus = orderDetails.payment_status;
        paymentStatusElement.textContent = paymentStatus;
        
        // Add color coding for payment status
        if (paymentStatus === 'Pending') {
            paymentStatusElement.className = 'font-semibold text-yellow-600';
        } else if (paymentStatus === 'Dibayar') {
            paymentStatusElement.className = 'font-semibold text-green-600';
        } else if (paymentStatus === 'Gagal') {
            paymentStatusElement.className = 'font-semibold text-red-600';
        }

        // Generate and display tracking link
        const trackingLink = Utils.generateTrackingLink(orderDetails.order_id);
        const trackingLinkInput = document.getElementById('trackingLink');
        if (trackingLinkInput) {
            trackingLinkInput.value = trackingLink;
        }
    }

    async copyTrackingLink() {
        const trackingLinkInput = document.getElementById('trackingLink');
        const copySuccess = document.getElementById('copySuccess');
        
        if (!trackingLinkInput) return;

        try {
            await Utils.copyToClipboard(trackingLinkInput.value);
            
            // Show success message
            copySuccess.classList.remove('hidden');
            setTimeout(() => {
                copySuccess.classList.add('hidden');
            }, 2000);
            
            Utils.showToast('Link tracking berhasil disalin!', 'success');
        } catch (error) {
            Utils.showToast('Gagal menyalin link', 'error');
        }
    }
}

// Initialize the order success page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrderSuccess();
});