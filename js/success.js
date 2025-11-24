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
        const copyBtn = document.getElementById('copyLinkBtn');
        copyBtn?.addEventListener('click', () => this.copyTrackingLink());
    }

    renderOrderDetails() {
        if (!this.orderDetails) return;

        const od = this.orderDetails;

        document.getElementById('orderId').textContent = od.order_id;
        document.getElementById('customerName').textContent = od.name;
        document.getElementById('customerPhone').textContent = od.phone;
        document.getElementById('productName').textContent = od.product_name;
        document.getElementById('productQty').textContent = od.qty;
        document.getElementById('totalPrice').textContent = Utils.formatCurrency(od.total_price);

        // Payment method
        const paymentMethodMap = {
            'qris': 'QRIS',
            'transfer': 'Transfer Bank',
            'cod': 'COD'
        };
        document.getElementById('paymentMethod').textContent = paymentMethodMap[od.payment_method] || od.payment_method;

        // Payment status
        const paymentStatusEl = document.getElementById('paymentStatus');
        paymentStatusEl.textContent = od.payment_status;

        if (od.payment_status === 'Pending') {
            paymentStatusEl.className = 'font-semibold text-yellow-600';
        } else if (od.payment_status === 'Dibayar') {
            paymentStatusEl.className = 'font-semibold text-green-600';
        } else if (od.payment_status === 'Gagal') {
            paymentStatusEl.className = 'font-semibold text-red-600';
        } else {
            paymentStatusEl.className = 'font-semibold text-gray-600';
        }

        // Tracking link
        const trackingLinkInput = document.getElementById('trackingLink');
        if (trackingLinkInput) {
            trackingLinkInput.value = Utils.generateTrackingLink(od.order_id);
        }
    }

    async copyTrackingLink() {
        const trackingLinkInput = document.getElementById('trackingLink');
        const copySuccess = document.getElementById('copySuccess');
        if (!trackingLinkInput) return;

        try {
            await Utils.copyToClipboard(trackingLinkInput.value);

            copySuccess?.classList.remove('hidden');
            setTimeout(() => copySuccess?.classList.add('hidden'), 2000);

            Utils.showToast('Link tracking berhasil disalin!', 'success');
        } catch (error) {
            Utils.showToast('Gagal menyalin link', 'error');
        }
    }
}

// Initialize the order success page
document.addEventListener('DOMContentLoaded', () => new OrderSuccess());
