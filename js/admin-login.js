// admin-login.js
class AdminLogin {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', e => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    checkExistingSession() {
        if (Utils.isAdminLoggedIn()) {
            window.location.href = 'admin-dashboard.html';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('#togglePassword i');

        if (!passwordInput || !toggleIcon) return;

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    async handleLogin() {
        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!username || !password) {
            this.showError('Username dan password harus diisi');
            return;
        }

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.textContent = 'Memproses...';
        }

        try {
            const response = await Utils.apiCall('admin-login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                Utils.setAdminSession(response.token, response.name);
                Utils.showToast('Login berhasil!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                this.showError(response.message || 'Login gagal');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.classList.remove('hidden');

            clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AdminLogin();
});
