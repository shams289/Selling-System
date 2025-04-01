/**
 * Warehouse Management System - Dashboard JavaScript
 * Handles charts, data visualization, filtering, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Dashboard
    const dashboard = new Dashboard();
    dashboard.init();
    
    // Initialize UI Manager
    const uiManager = new UIManager();
    
    // Initialize charts
    initializeCharts();

    // Mobile search toggle
    const searchToggle = document.getElementById('searchToggle');
    const mobileSearch = document.querySelector('.mobile-search');
    
    if (searchToggle && mobileSearch) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            mobileSearch.classList.toggle('active');
            
            // Focus the search input when opened
            if (mobileSearch.classList.contains('active')) {
                mobileSearch.querySelector('input').focus();
            }
        });
    }

    // Close mobile search when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileSearch?.contains(e.target) && !searchToggle?.contains(e.target)) {
            mobileSearch?.classList.remove('active');
        }
    });
});

/**
 * Dashboard Class
 * Manages all dashboard-related functionality
 */
class Dashboard {
    constructor() {
        // Chart instances
        this.charts = {};
        
        // Theme
        this.currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // References to DOM elements
        this.themeToggleBtn = document.getElementById('themeToggle');
        this.sidebar = document.getElementById('sidebar');
        this.categoryFilters = document.querySelectorAll('.filter-card');
        
        // State
        this.activeTimeFrame = 'monthly'; // default time frame
        this.sidebarState = localStorage.getItem('sidebarState') === 'active' ? 'active' : 'inactive';
    }

    /**
     * Initialize the dashboard
     */
    init() {
        this.initThemeToggle();
        this.initSidebar();
        this.initCharts();
        this.initCategoryFilters();
        this.initNotifications();
        this.initUserDropdown();
        
        // Add window resize handler for responsive charts
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Initialize sidebar functionality
     */
    initSidebar() {
        // Set initial sidebar state
        if (this.sidebarState === 'active') {
            this.sidebar.classList.add('active');
        } else {
            this.sidebar.classList.remove('active');
        }
        
        // Toggle sidebar on button click
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Handle menu item clicks
        const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
        if (menuItems) {
            menuItems.forEach(item => {
                const link = item.querySelector('a');
                if (link) {
                    link.addEventListener('click', (e) => {
                        // If it has dropdown, toggle submenu
                        if (link.classList.contains('has-dropdown')) {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent click from bubbling
                            
                            // Toggle submenu
                            const isOpen = item.classList.contains('open');
                            
                            // First close all other open submenus
                            menuItems.forEach(menuItem => {
                                if (menuItem !== item && menuItem.classList.contains('open')) {
                                    hideSubmenu(menuItem);
                                }
                            });
                            
                            // Toggle current submenu - only when clicked on same item
                            if (isOpen) {
                                hideSubmenu(item);
                            } else {
                                showSubmenu(item);
                            }
                        } else {
                            // Regular menu item, set active
                            menuItems.forEach(mi => {
                                const miLink = mi.querySelector('a');
                                if (miLink) miLink.classList.remove('active');
                            });
                            
                            // Remove active class from all other submenu items
                            document.querySelectorAll('.submenu a').forEach(subLink => {
                                subLink.classList.remove('active');
                            });
                            
                            // Add active class to clicked link
                            link.classList.add('active');
                            
                            // If on mobile, close sidebar
                            if (window.innerWidth < 768) {
                                this.sidebar.classList.remove('active');
                                this.sidebarState = 'inactive';
                                localStorage.setItem('sidebarState', 'inactive');
                            }
                        }
                    });
                }
            });
            
            // Handle submenu item clicks with better event handling
            const submenuLinks = document.querySelectorAll('.submenu a');
            submenuLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent click from bubbling
                    
                    // Remove active class from all menu links
                    document.querySelectorAll('.sidebar-menu .menu-item > a').forEach(menuLink => {
                        menuLink.classList.remove('active');
                    });
                    
                    // Remove active class from all submenu links
                    submenuLinks.forEach(sl => sl.classList.remove('active'));
                    
                    // Add active class to clicked submenu link
                    link.classList.add('active');
                    
                    // Create ripple effect on click
                    createRippleEffect(link);
                    
                    // If on mobile, close sidebar after a slight delay to show the active state
                    if (window.innerWidth < 768) {
                        setTimeout(() => {
                            this.sidebar.classList.remove('active');
                            this.sidebarState = 'inactive';
                            localStorage.setItem('sidebarState', 'inactive');
                        }, 300);
                    }
                    
                    console.log('Submenu item clicked:', link.textContent.trim());
                    // Here you would handle navigation or content loading
                });
            });
        }
        
        // Remove document click handler that closes submenus
        // Submenus will only close when explicitly clicked
        
        // Update escape key handler to close the most recently opened submenu only
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openMenus = document.querySelectorAll('.menu-item.open');
                if (openMenus.length > 0) {
                    // Just close the most recently opened submenu
                    const lastOpenMenu = openMenus[openMenus.length - 1];
                    hideSubmenu(lastOpenMenu);
                    e.preventDefault(); // Prevent other escape key handlers
                }
            }
        });
    }
    
    /**
     * Toggle sidebar open/closed state
     */
    toggleSidebar() {
        if (this.sidebar.classList.contains('active')) {
            this.sidebar.classList.remove('active');
            this.sidebarState = 'inactive';
        } else {
            this.sidebar.classList.add('active');
            this.sidebarState = 'active';
        }
        
        localStorage.setItem('sidebarState', this.sidebarState);
        
        // Trigger window resize to adjust charts
        window.dispatchEvent(new Event('resize'));
    }
    
    /**
     * Initialize theme toggle functionality
     */
    initThemeToggle() {
        if (this.themeToggleBtn) {
            // Set initial icon based on current theme
            this.updateThemeIcon();
            
            // Add click event listener to toggle theme
            this.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        this.updateThemeIcon();
        
        // Redraw charts for theme change
        this.refreshCharts();
    }
    
    /**
     * Update theme toggle icon based on current theme
     */
    updateThemeIcon() {
        if (this.themeToggleBtn) {
            const icon = this.themeToggleBtn.querySelector('i');
            if (icon) {
                if (this.currentTheme === 'dark') {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
            }
        }
    }

    /**
     * Initialize all charts on the dashboard
     */
    initCharts() {
        this.initSalesChart();
        this.initFulfillmentChart();
    }
    
    /**
     * Initialize sales line chart
     */
    initSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        // Chart data
        const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        const data = [1200, 1900, 1200, 2400, 3100, 2900, 1800, 2800, 2600, 3200, 2400, 4100];
        
        // Chart gradients
        const canvas = ctx.getContext('2d');
        const gradient = canvas.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(77, 119, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(77, 119, 255, 0.1)');
        
        // Create chart
        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'مانگانە',
                    data: data,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: '#4d77ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4d77ff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toLocaleString()} $`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: this.getTextColorForTheme()
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            color: this.getTextColorForTheme(),
                            callback: function(value) {
                                if (value >= 1000) {
                                    return value / 1000 + 'k';
                                }
                                return value;
                            }
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Initialize fulfillment doughnut chart
     */
    initFulfillmentChart() {
        const ctx = document.getElementById('fulfillmentChart');
        if (!ctx) return;
        
        // Transaction counts
        const sellingTransactions = 422; // Number of selling transactions
        const buyingTransactions = 296;  // Number of buying transactions
        
        // Chart data - now based on transaction counts
        const data = {
            labels: ['فرۆشتن', 'کڕین'],
            datasets: [{
                data: [sellingTransactions, buyingTransactions],
                backgroundColor: [
                    '#0047D0', // Selling color
                    '#85C1FF'  // Buying color
                ],
                borderWidth: 0,
                cutout: '80%',
                borderRadius: 5
            }]
        };
        
        // Create chart
        this.charts.fulfillment = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true, // Show legend to display transaction types
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: true, // Enable tooltips
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000,
                    easing: 'easeOutCubic'
                },
                rotation: -90, // Start from top instead of right
                circumference: 360, // Full circle
            }
        });
        
        // Update the center text
        const centerText = document.createElement('div');
        centerText.className = 'chart-center-text';
        centerText.innerHTML = `
            <div class="total-transactions">${sellingTransactions + buyingTransactions}</div>
            <div class="transactions-label">کۆی مامەڵەکان</div>
        `;
        
        // Add center text to parent of canvas
        const chartContent = ctx.parentElement;
        if (chartContent) {
            chartContent.style.position = 'relative';
            centerText.style.position = 'absolute';
            centerText.style.top = '50%';
            centerText.style.left = '50%';
            centerText.style.transform = 'translate(-50%, -50%)';
            centerText.style.textAlign = 'center';
            
            // Only add if it doesn't exist yet
            if (!chartContent.querySelector('.chart-center-text')) {
                chartContent.appendChild(centerText);
            }
        }
    }
    
    /**
     * Initialize category filter functionality
     */
    initCategoryFilters() {
        if (this.categoryFilters) {
            this.categoryFilters.forEach(filter => {
                filter.addEventListener('click', () => {
                    // Remove active class from all filters
                    this.categoryFilters.forEach(f => f.classList.remove('active'));
                    
                    // Add active class to clicked filter
                    filter.classList.add('active');
                    
                    // Here you would typically load data for the selected category
                    const filterType = filter.querySelector('.filter-text').textContent;
                    console.log(`Filter selected: ${filterType}`);
                    
                    // For demonstration, we'll just refresh the charts
                    this.refreshCharts();
                });
            });
        }
    }
    
    /**
     * Initialize notification system
     */
    initNotifications() {
        // Toggle notification panel
        const notificationToggle = document.getElementById('notificationToggle');
        const notificationPanel = document.querySelector('.notification-panel');
        
        if (notificationToggle && notificationPanel) {
            notificationToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationPanel.classList.toggle('show');
            });
            
            // Mark notifications as read when clicked
            const notifications = document.querySelectorAll('.notification-item');
            notifications.forEach(notification => {
                notification.addEventListener('click', () => {
                    notification.classList.remove('unread');
                    this.updateNotificationBadge();
                });
            });
            
            // Close notification panel when clicking elsewhere
            document.addEventListener('click', (e) => {
                if (!notificationPanel.contains(e.target) && e.target !== notificationToggle) {
                    notificationPanel.classList.remove('show');
                }
            });
            
            // Close button in notification panel
            const closeBtn = document.querySelector('.btn-close-panel');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notificationPanel.classList.remove('show');
                });
            }
            
            // Initialize notification badge
            this.updateNotificationBadge();
        }
        
        // Initialize search functionality
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }
    }
    
    /**
     * Update notification badge count
     */
    updateNotificationBadge() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const badge = document.querySelector('.notification-badge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    /**
     * Handle search functionality
     */
    handleSearch(query) {
        if (!query.trim()) return;
        
        console.log(`Searching for: ${query}`);
        // Implement actual search functionality here
        
        // For demonstration, let's just show an alert
        alert(`گەڕان بۆ: ${query}`);
    }
    
    /**
     * Initialize user dropdown menu
     */
    initUserDropdown() {
        const userDropdown = document.getElementById('userDropdown');
        
        if (userDropdown) {
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Create dropdown menu if it doesn't exist
                let menu = document.querySelector('.user-dropdown-menu');
                
                if (!menu) {
                    menu = document.createElement('div');
                    menu.className = 'user-dropdown-menu';
                    menu.innerHTML = `
                        <div class="dropdown-user-info">
                            <div class="dropdown-user-avatar">
                                <img src="img/user-avatar.jpg" alt="User Profile">
                            </div>
                            <div class="dropdown-user-details">
                                <h4>ئاشکان مەحمود</h4>
                                <p>admin@ashkan.com</p>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <ul class="dropdown-menu-items">
                            <li><a href="#"><i class="fas fa-user"></i> پڕۆفایل</a></li>
                            <li><a href="#"><i class="fas fa-cog"></i> ڕێکخستنەکان</a></li>
                            <li><a href="#"><i class="fas fa-chart-line"></i> چالاکیەکان</a></li>
                            <li><a href="#"><i class="fas fa-question-circle"></i> یارمەتی</a></li>
                        </ul>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-footer">
                            <a href="#" class="btn-sign-out"><i class="fas fa-sign-out-alt"></i> دەرچوون</a>
                        </div>
                    `;
                    document.body.appendChild(menu);
                    
                    // Position the menu
                    const rect = userDropdown.getBoundingClientRect();
                    menu.style.top = `${rect.bottom + 5}px`;
                    menu.style.left = `${rect.left - menu.offsetWidth + rect.width}px`;
                    
                    // Add event listeners to menu items
                    menu.querySelectorAll('a').forEach(link => {
                        link.addEventListener('click', (e) => {
                            e.preventDefault();
                            menu.classList.remove('show');
                            
                            if (link.classList.contains('btn-sign-out')) {
                                // Handle logout
                                console.log('Logging out...');
                                // Implement actual logout functionality here
                            }
                        });
                    });
                    
                    // Close menu when clicking outside
                    document.addEventListener('click', (event) => {
                        if (menu && !menu.contains(event.target) && event.target !== userDropdown) {
                            menu.classList.remove('show');
                        }
                    });
                }
                
                // Toggle menu visibility
                menu.classList.toggle('show');
            });
        }
    }
    
    /**
     * Refresh all charts
     */
    refreshCharts() {
        if (this.charts.sales) {
            // Update colors based on theme
            this.charts.sales.options.scales.x.ticks.color = this.getTextColorForTheme();
            this.charts.sales.options.scales.y.ticks.color = this.getTextColorForTheme();
            this.charts.sales.update();
        }
        
        if (this.charts.fulfillment) {
            this.charts.fulfillment.update();
        }
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        this.refreshCharts();
        
        // Auto collapse sidebar on small screens
        if (window.innerWidth < 768 && this.sidebar.classList.contains('active')) {
            // On mobile, only keep sidebar open if user explicitly opened it
            if (this.sidebarState !== 'active') {
                this.sidebar.classList.remove('active');
            }
        } else if (window.innerWidth >= 768) {
            // On desktop, restore sidebar state from localStorage
            if (this.sidebarState === 'active') {
                this.sidebar.classList.add('active');
            } else {
                this.sidebar.classList.remove('active');
            }
        }
    }
    
    /**
     * Get appropriate text color based on current theme
     */
    getTextColorForTheme() {
        return this.currentTheme === 'dark' ? '#e2e8f0' : '#718096';
    }
}

/**
 * Data Fetcher Class
 * Handles all data-related operations
 */
class DataFetcher {
    constructor() {
        // Base API URL - replace with your actual API endpoint
        this.apiBase = '/api';
    }
    
    /**
     * Fetch dashboard KPI data
     */
    async fetchKpiData() {
        try {
            const response = await fetch(`${this.apiBase}/kpi`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching KPI data:', error);
            return null;
        }
    }
    
    /**
     * Fetch products data with optional filtering
     */
    async fetchProducts(filter = null) {
        try {
            let url = `${this.apiBase}/products`;
            if (filter) {
                url += `?filter=${filter}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }
    
    /**
     * Fetch sales data for a specific time period
     */
    async fetchSalesData(timeframe = 'monthly') {
        try {
            const response = await fetch(`${this.apiBase}/sales?timeframe=${timeframe}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching sales data:', error);
            return null;
        }
    }
}

/**
 * Additional utility methods
 */

/**
 * Format currency value
 */
function formatCurrency(value, locale = 'ku') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Format number with thousands separator
 */
function formatNumber(value, locale = 'ku') {
    return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format date to localized string
 */
function formatDate(date, locale = 'ku') {
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Generate shade variants of a color
 */
function generateColorShades(baseColor, count = 5) {
    const shades = [];
    const color = parseColor(baseColor);
    
    for (let i = 0; i < count; i++) {
        const factor = 0.15 * i;
        const shade = lightenDarkenColor(color, -factor);
        shades.push(shade);
    }
    
    return shades;
}

/**
 * Parse color string to RGB values
 */
function parseColor(color) {
    // Handle hex
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return { r, g, b };
    }
    
    // Handle rgb/rgba
    if (color.startsWith('rgb')) {
        const values = color.match(/\d+/g).map(Number);
        return { r: values[0], g: values[1], b: values[2] };
    }
    
    // Default
    return { r: 0, g: 0, b: 0 };
}

/**
 * Lighten or darken a color by a factor
 */
function lightenDarkenColor(color, factor) {
    const r = Math.max(0, Math.min(255, Math.round(color.r + (factor * 255))));
    const g = Math.max(0, Math.min(255, Math.round(color.g + (factor * 255))));
    const b = Math.max(0, Math.min(255, Math.round(color.b + (factor * 255))));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// UI Manager for sidebar and responsive elements
class UIManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.content = document.getElementById('content');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.overlay = document.querySelector('.overlay');
        this.dashboardContainer = document.querySelector('.dashboard-container');
        this.tables = document.querySelectorAll('.product-table');
        
        this.setupEventListeners();
        this.initialSetup();
        
        // Listen for orientation change
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
    }
    
    initialSetup() {
        // Set initial state based on screen size and saved preference
        const isMobile = window.innerWidth <= 768;
        const savedState = localStorage.getItem('sidebarActive');
        
        if (isMobile) {
            // Always start with sidebar closed on mobile
            this.sidebar.classList.remove('active');
            if (this.overlay) this.overlay.classList.remove('active');
            document.body.classList.remove('sidebar-active');
        } else {
            // On desktop, respect user's saved preference
            if (savedState === 'true') {
                this.sidebar.classList.add('active');
                this.applySidebarActiveState(true);
            } else if (savedState === 'false') {
                this.sidebar.classList.remove('active');
                this.applySidebarActiveState(false);
            } else {
                // Default to open sidebar if no preference saved
                this.sidebar.classList.add('active');
                this.applySidebarActiveState(true);
            }
        }
        
        // Adjust all responsive elements after setting sidebar state
        this.adjustResponsiveElements();
    }
    
    setupEventListeners() {
        // Toggle sidebar when button is clicked
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Close sidebar when overlay is clicked (mobile only)
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
            this.adjustResponsiveElements();
        });
        
        // Close mobile sidebar when clicking on a link
        if (this.sidebar) {
            const sidebarLinks = this.sidebar.querySelectorAll('a:not(.has-dropdown)');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeSidebar();
                    }
                });
            });
        }
        
        // Setup submenu toggling
        this.setupSubmenuToggle();
        
        // Add escape key handler to close sidebar on mobile
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.innerWidth <= 768 && this.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });
        
        // Stop propagation on sidebar clicks to prevent document click handlers from closing it
        if (this.sidebar) {
            this.sidebar.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Quick access buttons
        const quickAccessItems = document.querySelectorAll('.quick-access-item');
        if (quickAccessItems.length > 0) {
            quickAccessItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    // Remove active class from all items
                    quickAccessItems.forEach(btn => {
                        const icon = btn.querySelector('.quick-access-icon');
                        if (icon) icon.classList.remove('active');
                    });
                    
                    // Add active class to clicked item
                    const clickedIcon = this.querySelector('.quick-access-icon');
                    if (clickedIcon && !clickedIcon.classList.contains('bordered')) {
                        clickedIcon.classList.add('active');
                    }
                    
                    // Special handling for the "add" button (bordered)
                    if (clickedIcon && clickedIcon.classList.contains('bordered')) {
                        e.preventDefault();
                        // Show a modal or dropdown for adding new items
                        const options = [
                            { icon: 'fa-file-invoice', text: 'فاتورە' },
                            { icon: 'fa-truck-loading', text: 'بەرهەم' },
                            { icon: 'fa-user-plus', text: 'کڕیار' },
                            { icon: 'fa-tag', text: 'پۆل' }
                        ];
                        
                        showQuickAddMenu(clickedIcon, options);
                    }
                });
            });
        }
    }
    
    setupSubmenuToggle() {
        const dropdownLinks = document.querySelectorAll('.has-dropdown');
        
        // Restore previously open submenus from session storage
        document.querySelectorAll('.menu-item').forEach(menuItem => {
            if (menuItem.id && sessionStorage.getItem(`submenu-${menuItem.id}`) === 'open') {
                // Use a small timeout to ensure DOM is ready
                setTimeout(() => showSubmenu(menuItem), 100);
            }
        });
        
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const menuItem = link.closest('.menu-item');
                const isOpen = menuItem.classList.contains('open');
                
                // First close all other open submenus
                document.querySelectorAll('.menu-item.open').forEach(item => {
                    if (item !== menuItem) {
                        hideSubmenu(item);
                    }
                });
                
                // Toggle current submenu - only toggle when clicked again
                if (isOpen) {
                    hideSubmenu(menuItem);
                } else {
                    showSubmenu(menuItem);
                    
                    // Focus on the first submenu item for better accessibility
                    setTimeout(() => {
                        const firstSubmenuLink = menuItem.querySelector('.submenu a');
                        if (firstSubmenuLink) {
                            firstSubmenuLink.focus();
                        }
                    }, 300);
                }
            });
            
            // Add keyboard support for dropdown toggle
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const menuItem = link.closest('.menu-item');
                    if (!menuItem.classList.contains('open')) {
                        showSubmenu(menuItem);
                        
                        // Focus on first submenu item
                        setTimeout(() => {
                            const firstSubmenuLink = menuItem.querySelector('.submenu a');
                            if (firstSubmenuLink) {
                                firstSubmenuLink.focus();
                            }
                        }, 300);
                    }
                } else if (e.key === 'ArrowLeft' && link.closest('.menu-item').classList.contains('open')) {
                    e.preventDefault();
                    hideSubmenu(link.closest('.menu-item'));
                }
            });
        });

        // Don't close submenus when clicking outside
        // Only close when clicking on another menu item or explicitly closing
        
        // Handle submenu item clicks with better event handling
        const submenuLinks = document.querySelectorAll('.submenu a');
        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent click from bubbling
                
                // Remove active class from all submenu links
                document.querySelectorAll('.submenu a').forEach(a => {
                    a.classList.remove('active');
                });
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Create ripple effect on click
                createRippleEffect(link);
                
                // Save active link in session storage
                const menuItem = link.closest('.menu-item');
                if (menuItem && menuItem.id) {
                    sessionStorage.setItem(`active-submenu-link-${menuItem.id}`, link.textContent.trim());
                }
                
                console.log('Submenu item clicked:', link.textContent.trim());
                // Here you would handle navigation or content loading
            });
            
            // Add keyboard navigation within submenu
            link.addEventListener('keydown', (e) => {
                const submenu = link.closest('.submenu');
                const links = Array.from(submenu.querySelectorAll('a'));
                const currentIndex = links.indexOf(link);
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextLink = links[currentIndex + 1] || links[0];
                    nextLink.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevLink = links[currentIndex - 1] || links[links.length - 1];
                    prevLink.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    const parentLink = link.closest('.menu-item').querySelector('.has-dropdown');
                    if (parentLink) {
                        parentLink.focus();
                        hideSubmenu(link.closest('.menu-item'));
                    }
                }
            });
        });
        
        // Prevent submenu closing when clicking inside submenu
        const submenus = document.querySelectorAll('.submenu');
        submenus.forEach(submenu => {
            submenu.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent click from bubbling up to document
            });
        });
    }
    
    toggleSidebar() {
        const isActive = this.sidebar.classList.contains('active');
        this.sidebar.classList.toggle('active');
        
        // Apply blur effect on mobile when sidebar is active
        this.applySidebarActiveState(!isActive);
        
        // Show/hide overlay on mobile
        if (window.innerWidth <= 768 && this.overlay) {
            this.overlay.classList.toggle('active');
            document.body.style.overflow = !isActive ? 'hidden' : ''; // Toggle scroll lock
        }
        
        // Save state to localStorage
        localStorage.setItem('sidebarActive', !isActive);
        
        // Adjust responsive elements
        this.adjustResponsiveElements();
    }
    
    closeSidebar() {
        if (this.sidebar.classList.contains('active')) {
            this.sidebar.classList.remove('active');
            if (this.overlay) this.overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
            
            // Remove blur effect
            this.applySidebarActiveState(false);
            
            // Save state to localStorage
            localStorage.setItem('sidebarActive', false);
            
            // Adjust responsive elements
            this.adjustResponsiveElements();
        }
    }
    
    applySidebarActiveState(isActive) {
        if (window.innerWidth <= 768) {
            // Only apply blur effect on mobile
            if (isActive) {
                document.body.classList.add('sidebar-active');
            } else {
                document.body.classList.remove('sidebar-active');
            }
        } else {
            document.body.classList.remove('sidebar-active');
            
            // Update dashboard container class for desktop
            if (this.dashboardContainer) {
                if (isActive) {
                    this.dashboardContainer.classList.add('with-sidebar');
                } else {
                    this.dashboardContainer.classList.remove('with-sidebar');
                }
            }
        }
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // Ensure sidebar has correct mobile positioning
            if (this.sidebar.classList.contains('active')) {
                // Show overlay and apply blur when sidebar is active on mobile
                if (this.overlay) this.overlay.classList.add('active');
                document.body.classList.add('sidebar-active');
            }
        } else {
            // On desktop
            if (this.overlay) this.overlay.classList.remove('active');
            document.body.style.overflow = ''; // Ensure scrolling is enabled
            document.body.classList.remove('sidebar-active');
        }
        
        // Handle tables on resize
        this.adjustTableResponsiveness();
    }
    
    adjustTableResponsiveness() {
        if (this.tables) {
            this.tables.forEach(table => {
                // Check if table needs horizontal scrolling
                const container = table.closest('.product-table-container');
                if (container && table.offsetWidth > container.offsetWidth) {
                    container.style.overflowX = 'auto';
                }
            });
        }
    }
    
    handleOrientationChange() {
        // Special handling for orientation changes
        setTimeout(() => {
            this.handleResize();
            this.adjustResponsiveElements();
            
            // Force chart resize on orientation change
            this.resizeCharts();
        }, 300); // Small delay to ensure DOM has updated
    }
    
    adjustResponsiveElements() {
        // Update container class based on sidebar state
        if (this.dashboardContainer) {
            if (window.innerWidth > 768) {
                if (this.sidebar.classList.contains('active')) {
                    this.dashboardContainer.classList.add('with-sidebar');
                } else {
                    this.dashboardContainer.classList.remove('with-sidebar');
                }
            } else {
                // Always remove the with-sidebar class on mobile
                this.dashboardContainer.classList.remove('with-sidebar');
            }
        }
        
        // Resize charts
        this.resizeCharts();
    }
    
    resizeCharts() {
        // Trigger chart resizing
        setTimeout(() => {
            // Resize any chart instances
            if (window.Chart) {
                const charts = Chart.instances;
                if (charts && charts.length) {
                    charts.forEach(chart => {
                        if (chart && typeof chart.resize === 'function') {
                            chart.resize();
                        }
                    });
                }
            }
            
            // Dispatch a resize event for other components
            const resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
        }, 100);
    }
}

// Chart Initialization
function initializeCharts() {
    // Sales Trends Line Chart
    const trendsCtx = document.getElementById('salesTrendChart');
    if (trendsCtx) {
        window.salesTrendChart = new Chart(trendsCtx, {
            type: 'line',
            data: {
                labels: ['ژانوار', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەموز'],
                datasets: [
                    {
                        label: 'فرۆشتن',
                        data: [65, 59, 80, 81, 56, 55, 72],
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                        backgroundColor: hexToRgba(getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(), 0.1),
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'کڕین',
                        data: [28, 48, 40, 19, 86, 27, 50],
                        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
                        backgroundColor: hexToRgba(getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(), 0.1),
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                        pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim(),
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        displayColors: true,
                        padding: 10,
                        boxPadding: 5,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + ' دانە';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // Stock Availability Donut Chart
    const stockCtx = document.getElementById('stockDonutChart');
    if (stockCtx) {
        window.stockDonutChart = new Chart(stockCtx, {
            type: 'doughnut',
            data: {
                labels: ['زۆر', 'مامناوەند', 'کەم'],
                datasets: [{
                    data: [63, 25, 12],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim(),
                        getComputedStyle(document.documentElement).getPropertyValue('--warning-color').trim(),
                        getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim()
                    ],
                    borderWidth: 0,
                    hoverOffset: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const label = context.label;
                                return label + ': ' + value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        // Update center text
        updateDonutCenterText();
    }
}

// Update donut chart center text
function updateDonutCenterText() {
    const donutLabel = document.querySelector('.donut-label');
    if (donutLabel) {
        const totalInStock = 85; // This would be calculated from your actual data
        donutLabel.innerHTML = `
            <div class="donut-value">${totalInStock}%</div>
            <div class="donut-text">بەردەستی</div>
        `;
    }
}

// Set up event listeners for user interactions
function setupEventListeners() {
    // Notification panel toggle
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPanel = document.querySelector('.notification-panel');
    const closePanelBtn = document.querySelector('.btn-close-panel');
    
    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            notificationPanel.classList.toggle('active');
        });
    }
    
    if (closePanelBtn && notificationPanel) {
        closePanelBtn.addEventListener('click', function() {
            notificationPanel.classList.remove('active');
        });
    }
    
    // Close panels when clicking outside
    document.addEventListener('click', function(e) {
        if (notificationPanel && notificationPanel.classList.contains('active')) {
            if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        }
    });
    
    // Category filter buttons
    const filterBtns = document.querySelectorAll('.category-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Helper function to convert hex to rgba
function hexToRgba(hex, alpha = 1) {
    if (!hex) return 'rgba(0, 0, 0, ' + alpha + ')';
    
    // Remove the hash if it exists
    hex = hex.replace('#', '');
    
    // Parse the hex values
    let r = parseInt(hex.length === 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
    let g = parseInt(hex.length === 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
    let b = parseInt(hex.length === 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
    
    // Return the rgba value
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

/**
 * Show a quick add menu with options
 */
function showQuickAddMenu(targetElement, options) {
    // Remove any existing menus
    const existingMenu = document.querySelector('.quick-add-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create the menu
    const menu = document.createElement('div');
    menu.className = 'quick-add-menu';
    
    // Add options to the menu
    options.forEach(option => {
        const item = document.createElement('a');
        item.href = '#';
        item.className = 'quick-add-item';
        item.innerHTML = `
            <span class="quick-add-icon">
                <i class="fas ${option.icon}"></i>
            </span>
            <span class="quick-add-text">${option.text}</span>
        `;
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Selected option: ${option.text}`);
            menu.remove();
            
            // Here you would typically navigate to the appropriate page
            // or open a modal for the selected option
        });
        
        menu.appendChild(item);
    });
    
    // Position the menu
    document.body.appendChild(menu);
    const rect = targetElement.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 10}px`;
    menu.style.left = `${rect.left - (menu.offsetWidth / 2) + (rect.width / 2)}px`;
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== targetElement) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
    
    // Add some simple animation
    setTimeout(() => {
        menu.classList.add('show');
    }, 10);
}

/**
 * Show submenu with enhanced animation
 * @param {HTMLElement} menuItem - The menu item containing the submenu
 */
function showSubmenu(menuItem) {
    const submenu = menuItem.querySelector('.submenu');
    const dropdownIcon = menuItem.querySelector('.dropdown-icon');
    
    if (!submenu) return;
    
    // Force layout recalculation before any animations
    void submenu.offsetHeight;
    
    // Immediately make the submenu visible before calculating height
    submenu.style.display = 'block';
    submenu.style.visibility = 'visible';
    
    // Add open class to menu item
    menuItem.classList.add('open');
    
    // Create ripple effect
    createRippleEffect(menuItem.querySelector('a'));
    
    // Animate dropdown icon
    if (dropdownIcon) {
        dropdownIcon.style.transform = 'rotate(180deg)';
        dropdownIcon.style.color = 'var(--primary-color)';
    }
    
    // Forcefully expand submenu with precise timing
    requestAnimationFrame(() => {
        // Set initial state
        submenu.style.opacity = '0';
        submenu.style.transform = 'translateY(-8px)';
        submenu.style.maxHeight = '0px';
        
        // Force layout recalculation again
        void submenu.offsetHeight;
        
        // Trigger animation with a slight delay for better visual effect
        requestAnimationFrame(() => {
            submenu.style.opacity = '1';
            submenu.style.transform = 'translateY(0)';
            submenu.style.maxHeight = `${submenu.scrollHeight + 30}px`; // Extra padding for safety
            
            // Apply a highlight effect to the parent item
            const parentLink = menuItem.querySelector('a');
            if (parentLink) {
                parentLink.classList.add('active-parent');
                // Create a pulsing effect on the parent menu item
                parentLink.style.backgroundColor = 'rgba(237, 242, 255, 0.9)';
                setTimeout(() => {
                    parentLink.style.backgroundColor = 'rgba(237, 242, 255, 0.8)';
                }, 300);
            }
        });
    });
    
    // Store the open state in session storage to persist it
    const menuId = menuItem.id || `menu-item-${Math.random().toString(36).substr(2, 9)}`;
    if (!menuItem.id) menuItem.id = menuId;
    sessionStorage.setItem(`submenu-${menuId}`, 'open');
    
    // Mark all link items as visible for keyboard navigation
    const submenuLinks = submenu.querySelectorAll('a');
    submenuLinks.forEach((link, index) => {
        link.setAttribute('tabindex', '0');
        // Staggered fade-in animation
        link.style.transitionDelay = `${50 + (index * 50)}ms`;
    });
}

/**
 * Hide submenu with enhanced animation
 * @param {HTMLElement} menuItem - The menu item containing the submenu
 */
function hideSubmenu(menuItem) {
    const submenu = menuItem.querySelector('.submenu');
    const dropdownIcon = menuItem.querySelector('.dropdown-icon');
    
    if (!submenu) return;
    
    // Force layout recalculation
    void submenu.offsetHeight;
    
    // Remove open class from menu item
    menuItem.classList.remove('open');
    
    // Animate dropdown icon
    if (dropdownIcon) {
        dropdownIcon.style.transform = 'rotate(0deg)';
        dropdownIcon.style.color = '';
    }
    
    // Animate submenu closing with a slight highlight effect
    const parentLink = menuItem.querySelector('a');
    if (parentLink) {
        parentLink.classList.remove('active-parent');
        // Brief highlight effect before closing
        parentLink.style.backgroundColor = 'rgba(237, 242, 255, 0.5)';
        setTimeout(() => {
            parentLink.style.backgroundColor = '';
        }, 300);
    }
    
    // Prepare links for exit animation
    const submenuLinks = submenu.querySelectorAll('a');
    submenuLinks.forEach((link, index) => {
        link.setAttribute('tabindex', '-1');
        link.style.transitionDelay = `${(submenuLinks.length - index - 1) * 30}ms`;
    });
    
    // Start collapsing animation
    submenu.style.maxHeight = '0';
    submenu.style.opacity = '0';
    submenu.style.transform = 'translateY(-8px)';
    
    // Hide submenu after animation completes
    setTimeout(() => {
        if (!menuItem.classList.contains('open')) {
            submenu.style.visibility = 'hidden';
            submenu.style.display = 'none';
            
            // Reset any transition delays
            submenuLinks.forEach(link => {
                link.style.transitionDelay = '';
            });
        }
    }, 300);
    
    // Remove from session storage
    if (menuItem.id) {
        sessionStorage.removeItem(`submenu-${menuItem.id}`);
    }
}

/**
 * Create ripple effect on element click
 * @param {HTMLElement} element - The element to create the ripple on
 */
function createRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    element.appendChild(ripple);
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    
    // Position the ripple
    ripple.style.left = `${0}px`;
    ripple.style.top = `${0}px`;
    
    // Add active class to start animation
    ripple.classList.add('active');
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}