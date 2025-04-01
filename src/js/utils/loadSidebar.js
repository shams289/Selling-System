function loadSidebar() {
    fetch('/components/sidebar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('sidebarContainer').innerHTML = html;
            
            // Set active menu item based on current page
            const currentPath = window.location.pathname;
            const menuItems = document.querySelectorAll('.sidebar-menu a');
            
            menuItems.forEach(item => {
                if (item.getAttribute('href') === currentPath) {
                    item.classList.add('active');
                    const parentLi = item.closest('.menu-item');
                    if (parentLi) {
                        parentLi.classList.add('open');
                    }
                }
            });
            
            // Initialize sidebar events
            initSidebarEvents();
        });
}

function initSidebarEvents() {
    // ...existing sidebar.js code...
}

// Load sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', loadSidebar);
