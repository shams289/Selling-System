// Initialize IndexedDB
const dbName = 'SalesManagementDB';
const dbVersion = 1;

class Dashboard {
    constructor() {
        this.db = null;
        this.init();
    }

    async init() {
        await this.initDatabase();
        this.loadDashboardData();
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('customers')) {
                    db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('inventory')) {
                    db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async loadDashboardData() {
        // Update dashboard cards
        this.updateTotalSales();
        this.updateTotalOrders();
        this.updateActiveCustomers();
        this.updateLowStockItems();
    }

    async updateTotalSales() {
        const orders = await this.getAllData('orders');
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        document.querySelector('#total-sales .number').textContent = 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(totalSales);
    }

    async updateTotalOrders() {
        const orders = await this.getAllData('orders');
        document.querySelector('#total-orders .number').textContent = orders.length;
    }

    async updateActiveCustomers() {
        const customers = await this.getAllData('customers');
        document.querySelector('#active-customers .number').textContent = customers.length;
    }

    async updateLowStockItems() {
        const inventory = await this.getAllData('inventory');
        const lowStock = inventory.filter(item => item.quantity < item.minimumStock).length;
        document.querySelector('#low-stock .number').textContent = lowStock;
    }

    async getAllData(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize dashboard
const dashboard = new Dashboard();
