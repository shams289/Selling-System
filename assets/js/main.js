import { initDatabase } from './services/DatabaseService.js';
import { initAuth } from './services/AuthService.js';

// Initialize the application
async function initApp() {
    try {
        // Initialize IndexedDB
        await initDatabase();
        
        // Initialize authentication
        await initAuth();
        
        // Load initial data
        await loadDashboard();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showErrorMessage('Failed to load application. Please refresh the page.');
    }
}

// Load dashboard data
async function loadDashboard() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;

    // Add dashboard widgets
    dashboardContent.innerHTML = `
        <div class="dashboard-grid">
            <div class="widget sales-summary">
                <h3>Sales Summary</h3>
                <div class="widget-content">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
            <div class="widget recent-orders">
                <h3>Recent Orders</h3>
                <div class="widget-content">
                    <div id="ordersList"></div>
                </div>
            </div>
            <div class="widget inventory-alerts">
                <h3>Low Stock Alerts</h3>
                <div class="widget-content">
                    <div id="alertsList"></div>
                </div>
            </div>
        </div>
    `;
}

// Error handling
function showErrorMessage(message) {
    // Implementation for showing error messages
    console.error(message);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 