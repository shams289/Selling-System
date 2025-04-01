/**
 * Main JavaScript file for the Warehouse Management System
 * Handles UI interactions, sidebar functionality, and page navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the UI Manager
    const uiManager = new UIManager();
    uiManager.init();
});

/**
 * UIManager Class
 * Handles UI interactions and navigation
 */
class UIManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.content = document.getElementById('content');
        this.overlay = document.querySelector('.overlay');
        this.sidebarCollapse = document.getElementById('sidebarCollapse');
        this.languageDropdown = document.getElementById('languageDropdown');
        this.navLinks = document.querySelectorAll('#sidebar .components a');
        this.currentSection = 'dashboard'; // Default section
        this.charts = []; // Store chart instances if any
    }

    /**
     * Initialize UI Manager
     */
    init() {
        this.initSidebar();
        this.initNavigation();
        this.initDropdowns();
        this.initLanguageSwitcher();
        this.setInitialActiveState();
        this.handleWindowResize();
        
        // Run initial setup
        this.initialSetup();
    }

    /**
     * Initial Setup based on screen size
     */
    initialSetup() {
        const savedState = localStorage.getItem('sidebarActive');
        
        // On desktop (initial load)
        if (window.innerWidth > 768) {
            if (savedState === 'false') {
                this.sidebar.classList.remove('active');
            } else {
                this.sidebar.classList.add('active');
            }
            if (this.overlay) {
                this.overlay.classList.remove('active');
            }
            this.content.classList.remove('active');
        } 
        // On mobile (initial load)
        else {
            this.sidebar.classList.remove('active');
            if (this.overlay) {
                this.overlay.classList.remove('active');
            }
            this.content.classList.remove('active');
        }
        
        // Initial adjustments
        setTimeout(() => this.adjustResponsiveElements(), 300);
    }

    /**
     * Initialize Sidebar Toggle
     */
    initSidebar() {
        // Toggle sidebar on button click
        if (this.sidebarCollapse) {
            this.sidebarCollapse.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Close sidebar when clicking on overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Close sidebar when clicking on a link (mobile only)
        const menuLinks = document.querySelectorAll('#sidebar a:not([data-bs-toggle]):not([data-bs-target])');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
    }

    /**
     * Initialize Dropdown Menus
     */
    initDropdowns() {
        // Add click handlers for dropdown toggles
        const dropdownToggles = document.querySelectorAll('#sidebar a[data-bs-toggle="collapse"]');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Rotate chevron icon
                const chevron = toggle.querySelector('.chevron-icon');
                if (chevron) {
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        });
    }

    /**
     * Toggle Sidebar
     */
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        
        // Toggle overlay and content blur on mobile
        if (window.innerWidth <= 768) {
            this.content.classList.toggle('active');
            if (this.overlay) {
                this.overlay.classList.toggle('active');
            }
        }

        // Save preference to localStorage
        const isActive = this.sidebar.classList.contains('active');
        localStorage.setItem('sidebarActive', isActive);
        
        // Trigger window resize event to ensure all elements adapt
        window.dispatchEvent(new Event('resize'));
        
        // Update responsive elements
        this.adjustResponsiveElements();
    }

    /**
     * Close Sidebar
     */
    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.content.classList.remove('active');
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        // Trigger window resize event to ensure all elements adapt
        window.dispatchEvent(new Event('resize'));
        
        // Update responsive elements
        this.adjustResponsiveElements();
    }

    /**
     * Handle Window Resize
     */
    handleWindowResize() {
        // Handle resize events
        window.addEventListener('resize', () => {
            // On desktop
            if (window.innerWidth > 768) {
                if (this.overlay) {
                    this.overlay.classList.remove('active');
                }
                this.content.classList.remove('active');
                
                // Apply saved state from localStorage
                const savedState = localStorage.getItem('sidebarActive');
                if (savedState !== null) {
                    if (savedState === 'true' && !this.sidebar.classList.contains('active')) {
                        this.sidebar.classList.add('active');
                    } else if (savedState === 'false' && this.sidebar.classList.contains('active')) {
                        this.sidebar.classList.remove('active');
                    }
                } else {
                    // Default: sidebar is open on desktop
                    this.sidebar.classList.add('active');
                }
                
                // Adjust any responsive elements
                this.adjustResponsiveElements();
            } 
            // On mobile size change
            else {
                // Don't auto-close on resize, let user control the state
                // Just make sure overlay matches the sidebar state
                if (this.sidebar.classList.contains('active')) {
                    if (this.overlay) {
                        this.overlay.classList.add('active');
                    }
                } else {
                    if (this.overlay) {
                        this.overlay.classList.remove('active');
                    }
                }
            }
        });
    }

    /**
     * Adjust Responsive Elements after layout changes
     */
    adjustResponsiveElements() {
        // This function can be used to resize any charts or tables
        // that need to be adjusted when the layout changes
        
        // If there are any charts, resize them
        if (this.charts.length > 0) {
            this.charts.forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
        
        // Alternatively, if window.charts is defined
        if (window.charts) {
            for (const chart in window.charts) {
                if (window.charts[chart] && typeof window.charts[chart].resize === 'function') {
                    window.charts[chart].resize();
                }
            }
        }
        
        // If there are any tables with DataTables
        const dataTables = document.querySelectorAll('.dataTable');
        if (dataTables.length > 0) {
            dataTables.forEach(table => {
                const dtInstance = $.fn.dataTable.Api(table);
                if (dtInstance) {
                    dtInstance.columns.adjust();
                }
            });
        }
        
        // Adjust any responsive grids if needed
        const grids = document.querySelectorAll('.masonry-grid');
        if (grids.length > 0 && window.Masonry) {
            grids.forEach(grid => {
                const msnry = new Masonry(grid);
                msnry.layout();
            });
        }
    }

    /**
     * Initialize Navigation
     */
    initNavigation() {
        const pageLinks = document.querySelectorAll('#sidebar a:not([data-bs-toggle]):not([data-bs-target])');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Only prevent default for links that should be handled by JS
                // (exclude external links or links with specific targets)
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && href !== '#') {
                    e.preventDefault();
                    
                    // Set active state
                    this.setActiveLink(link);
                    
                    // Load section content
                    const section = this.getSectionFromLink(link);
                    if (section) {
                        this.loadSection(section);
                    }
                }
            });
        });
    }

    /**
     * Initialize Language Switcher
     */
    initLanguageSwitcher() {
        const languageLinks = document.querySelectorAll('.dropdown-menu a');
        languageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const language = link.textContent.trim();
                
                // Update dropdown button text
                if (this.languageDropdown) {
                    const buttonText = this.languageDropdown.querySelector('span');
                    if (buttonText) {
                        buttonText.textContent = language;
                    }
                }
                
                // Save language preference
                localStorage.setItem('preferredLanguage', language);
                
                // Show alert
                this.showAlert(`زمان گۆڕدرا بۆ ${language}`, 'success');
            });
        });
    }

    /**
     * Set Active Navigation Link
     */
    setActiveLink(activeLink) {
        // Remove active class from all navigation links
        const allLinks = document.querySelectorAll('#sidebar a:not([data-bs-toggle]):not([data-bs-target])');
        allLinks.forEach(link => {
            link.classList.remove('active');
            if (link.parentElement) {
                link.parentElement.classList.remove('active');
            }
        });
        
        // Add active class to clicked link
        if (activeLink) {
            activeLink.classList.add('active');
            if (activeLink.parentElement) {
                activeLink.parentElement.classList.add('active');
            }
            
            // If this is in a dropdown, expand the dropdown
            const parentCollapse = activeLink.closest('.collapse');
            if (parentCollapse) {
                // Ensure the collapse is shown
                const bsCollapse = new bootstrap.Collapse(parentCollapse, {
                    toggle: false
                });
                bsCollapse.show();
                
                // Add active class to the toggle
                const toggle = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
                if (toggle) {
                    toggle.classList.add('active');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            }
        }
    }

    /**
     * Set Initial Active State based on current page
     */
    setInitialActiveState() {
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html';
        
        const links = document.querySelectorAll('#sidebar a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === pageName) {
                this.setActiveLink(link);
            }
        });
    }

    /**
     * Get Section from Navigation Link
     */
    getSectionFromLink(link) {
        const href = link.getAttribute('href');
        if (href) {
            // Remove file extension and use as section name
            return href.split('.')[0];
        }
        return null;
    }

    /**
     * Load Section Content
     */
    loadSection(section) {
        this.currentSection = section;
        
        // Here you would load the content for the section
        // For now, we'll just log it
        console.log(`Loading section: ${section}`);
        
        // Update URL without page reload
        const url = `${section}.html`;
        window.history.pushState({ section: section }, '', url);
    }

    /**
     * Show Alert
     */
    showAlert(message, type = 'info') {
        const alertContainer = document.querySelector('.alert-container');
        if (!alertContainer) {
            return;
        }
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.role = 'alert';
        
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alertElement);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 150);
        }, 5000);
    }
} 