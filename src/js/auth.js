/**
 * Authentication Module
 * Handles user login, logout, and access control
 */

// Default admin user
const DEFAULT_USERS = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'بەڕێوەبەر'
    },
    {
        username: 'staff',
        password: 'staff123',
        role: 'staff',
        name: 'کارمەند'
    }
];

// User permissions based on role
const PERMISSIONS = {
    admin: ['dashboard', 'product-entry', 'add-product', 'product-exit', 'debt-supplier', 'debt-customer', 
            'supplier', 'customer', 'transactions', 'employee-payment', 'shipping-cost', 'expenses', 'reports'],
    staff: ['dashboard', 'product-entry', 'product-exit', 'customer', 'reports']
};

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Check if user is already logged in
        this.checkAuthStatus();
    }
    
    initEventListeners() {
        // Login form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        
        // Logout button
        document.getElementById('logout').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }
    
    checkAuthStatus() {
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.isAuthenticated = true;
            this.updateUI();
        } else {
            this.showLoginModal();
        }
    }
    
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Get users from localStorage or use default
        const users = JSON.parse(localStorage.getItem('users')) || DEFAULT_USERS;
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store user info without password
            const userInfo = {
                username: user.username,
                role: user.role,
                name: user.name
            };
            
            this.currentUser = userInfo;
            this.isAuthenticated = true;
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
            
            // Hide login modal
            this.loginModal.hide();
            
            // Update UI based on user role
            this.updateUI();
            
            // Show success message
            showAlert('چوونە ژوورەوە سەرکەوتوو بوو', 'success');
        } else {
            // Show error message
            showAlert('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە', 'danger');
        }
    }
    
    logout() {
        // Clear user data
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        
        // Show login modal
        this.showLoginModal();
        
        // Show logout message
        showAlert('بە سەرکەوتوویی دەرچوویت', 'info');
    }
    
    showLoginModal() {
        // Clear form
        document.getElementById('login-form').reset();
        
        // Show modal
        this.loginModal.show();
    }
    
    updateUI() {
        if (!this.isAuthenticated) return;
        
        const userRole = this.currentUser.role;
        const allowedSections = PERMISSIONS[userRole];
        
        // Hide sections based on permissions
        document.querySelectorAll('[data-section]').forEach(element => {
            const section = element.getAttribute('data-section');
            
            if (!allowedSections.includes(section)) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });
    }
    
    hasPermission(section) {
        if (!this.isAuthenticated) return false;
        
        const userRole = this.currentUser.role;
        const allowedSections = PERMISSIONS[userRole];
        
        return allowedSections.includes(section);
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

// Helper function to show alerts
function showAlert(message, type = 'info') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to document
    const container = document.querySelector('main .container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Initialize authentication
const authManager = new AuthManager(); 