// JavaScript for track.html (Order Tracking)

class OrderTracking {
    constructor() {
        this.orderData = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUrlParameters();
    }

    setupEventListeners() {
        const trackBtn = document.getElementById('trackBtn');
        trackBtn?.addEventListener('click', () => this.trackOrder());

        const orderIdInput = document.getElementById('orderIdInput');
        orderIdInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.trackOrder();
        });
    }

    checkUrlParameters() {
        const orderId = Utils.getUrlParameter('id');
        if (orderId) {
            document.getElementById('orderIdInput').value = orderId;
            this.trackOrder();
        }
    }

    async trackOrder() {
        const orderId = document.getElementById('orderIdInput').value.trim();
        if (!orderId) {
            Utils.showToast('Masukkan Order ID', 'error');
            return;
        }

        try {
            Utils.showLoading(document.getElementById('loadingState'));
            this.hideErrorState();

            const response = await Utils.apiCall(`/track?id=${orderId}`);
            Utils.hideLoading(document.getElementById('loadingState'));

            if (response.success && response.order) {
                this.orderData = response.order;
                this.renderOrderDetails();
                this.renderTrackingStatus();
            } else {
                this.showErrorState();
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            Utils.hideLoading(document.getElementById('loadingState'));
            this.showErrorState();
        }
    }

    renderOrderDetails() {
        if (!this.orderData) return;

        const order = this.orderData;

        document.getElementById('orderId').textContent = order.order_id;
        document.getElementById('orderDate').textContent = Utils.formatDate(order.date);
        document.getElementById('customerName').textContent = order.name;
        document.getElementById('customerPhone').textContent = order.phone;
        document.getElementById('customerNote').textContent = order.note || '-';
        document.getElementById('productName').textContent = order.product_name || 'Produk';
        document.getElementById('productQty').textContent = order.qty;
        document.getElementById('totalPrice').textContent = Utils.formatCurrency(order.total_price || 0);

        const paymentMethodText = {
            'qris': 'QRIS',
            'transfer': 'Transfer Bank',
            'cod': 'COD'
        };
        document.getElementById('paymentMethod').textContent = paymentMethodText[order.payment_method] || order.payment_method;

        document.getElementById('orderDetails').classList.remove('hidden');
    }

    renderTrackingStatus() {
        if (!this.orderData) return;

        const order = this.orderData;
        this.renderPaymentStatus(order.payment_status);
        this.renderOrderStatus(order.order_status);

        if (order.payment_proof) {
            this.renderPaymentProof(order.payment_proof);
        }
    }

    renderPaymentStatus(status) {
        const statusElement = document.getElementById('paymentStatus');
        const statusTextElement = document.getElementById('paymentStatusText');
        const statusDescElement = document.getElementById('paymentStatusDesc');
        const statusIconElement = document.getElementById('paymentIcon');
        const statusCheckElement = document.getElementById('paymentCheck');

        const statusConfig = {
            'Pending': { text: 'Menunggu Pembayaran', desc: 'Pembayaran belum diterima', bgColor: 'bg-yellow-500', icon: 'clock' },
            'Dibayar': { text: 'Pembayaran Diterima', desc: 'Pembayaran telah dikonfirmasi', bgColor: 'bg-green-500', icon: 'check' },
            'Gagal': { text: 'Pembayaran Gagal', desc: 'Pembayaran tidak dapat diproses', bgColor: 'bg-red-500', icon: 'times' }
        };

        const config = statusConfig[status] || statusConfig['Pending'];

        statusTextElement.textContent = config.text;
        statusDescElement.textContent = config.desc;
        statusIconElement.className = `w-10 h-10 rounded-full flex items-center justify-center mr-3 ${config.bgColor}`;
        statusIconElement.innerHTML = `<i class="fas fa-${config.icon} text-white"></i>`;

        if (status === 'Dibayar') {
            statusCheckElement.classList.remove('hidden');
            statusElement.classList.add('completed');
        } else if (status === 'Gagal') {
            statusCheckElement.classList.add('hidden');
            statusElement.classList.add('pending');
        } else {
            statusCheckElement.classList.add('hidden');
            statusElement.classList.add('active');
        }
    }

    renderOrderStatus(status) {
        const statusSteps = {
            'Pending': [1],
            'Diproses': [1, 2],
            'Dikirim': [1, 2, 3],
            'Selesai': [1, 2, 3, 4]
        };
        const activeSteps = statusSteps[status] || [];

        for (let i = 1; i <= 4; i++) {
            const stepElement = document.getElementById(`step${i}`);
            const stepIcon = stepElement.querySelector('.step-icon');
            const stepCheck = stepElement.querySelector('.step-check');

            if (activeSteps.includes(i)) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active', 'pending');
                stepIcon.className = 'step-icon w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-green-500';
                stepCheck.classList.remove('hidden');
            } else {
                stepElement.classList.add('pending');
                stepElement.classList.remove('completed', 'active');
                stepIcon.className = 'step-icon w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-300';
                stepCheck.classList.add('hidden');
            }
        }
    }

    renderPaymentProof(paymentProof) {
        const proofSection = document.getElementById('paymentProofSection');
        const proofImage = document.getElementById('paymentProofImage');
        if (proofSection && proofImage) {
            proofImage.src = paymentProof;
            proofSection.classList.remove('hidden');
        }
    }

    hideErrorState() {
        document.getElementById('errorState').classList.add('hidden');
    }

    showErrorState() {
        document.getElementById('orderDetails').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => new OrderTracking());
