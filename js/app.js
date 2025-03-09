import { Store } from './store/Store.js';
import { CustomerManager } from './managers/CustomerManager.js';
import { InventoryManager } from './managers/InventoryManager.js';
import { OrderProcessor } from './managers/OrderProcessor.js';
import { AnalyticsEngine } from './managers/AnalyticsEngine.js';

class App {
    constructor() {
        this.store = new Store();
        this.initializeManagers();
        this.initializeUI();
    }

    initializeManagers() {
        this.customerManager = new CustomerManager(this.store);
        this.inventoryManager = new InventoryManager(this.store);
        this.orderProcessor = new OrderProcessor(this.store);
        this.analyticsEngine = new AnalyticsEngine(this.store);
    }

    initializeUI() {
        window.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.initializeDatabase();
        });
    }

    async initializeDatabase() {
        try {
            await this.store.initialize();
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }
}

const app = new App();
