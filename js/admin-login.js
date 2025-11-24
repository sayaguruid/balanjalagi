// JavaScript for admin-login.html (Admin Login)

class AdminLogin {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
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

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            this.showError('Username dan password harus diisi');
            return;
        }

        try {
            const response = await Utils.apiCall('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (response.success) {
                // Store admin session
                Utils.setAdminSession(response.token, response.name);
                
                Utils.showToast('Login berhasil!', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                this.showError(response.message || 'Login gagal');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.classList.remove('hidden');
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize the admin login when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminLogin();
});