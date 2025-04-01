/**
 * Buying Module for the Warehouse Management System
 * Handles product purchase functionality and supplier management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the BuyingManager
    const buyingManager = new BuyingManager();
    buyingManager.init();
});

/**
 * BuyingManager Class
 * Handles all buying-related functionality
 */
class BuyingManager {
    constructor() {
        this.databaseManager = new DatabaseManager();
        this.buyForm = document.getElementById('buying-form');
        this.alertContainer = document.querySelector('.alert-container');
        this.supplierSelect = document.getElementById('supplier');
        this.productSelect = document.getElementById('product');
        this.categorySelect = document.getElementById('category');
        
        // Track items added to the current purchase
        this.purchaseItems = [];
        this.total = 0;
    }

    /**
     * Initialize BuyingManager
     */
    init() {
        this.loadSuppliers();
        this.loadProducts();
        this.loadCategories();
        this.initEventListeners();
    }

    /**
     * Initialize Event Listeners
     */
    initEventListeners() {
        // Form submission
        if (this.buyForm) {
            this.buyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Add supplier form
        const addSupplierForm = document.getElementById('add-supplier-form');
        if (addSupplierForm) {
            addSupplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddSupplier();
            });
        }

        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct();
            });
        }

        // Calculate total price
        const quantityInput = document.getElementById('quantity');
        const unitPriceInput = document.getElementById('unit-price');
        const discountInput = document.getElementById('discount');
        
        if (quantityInput && unitPriceInput) {
            [quantityInput, unitPriceInput, discountInput].forEach(input => {
                if (input) {
                    input.addEventListener('input', () => {
                        this.calculateTotalPrice();
                    });
                }
            });
        }

        // Add item to purchase
        const addItemBtn = document.getElementById('add-item-btn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addItemToPurchase();
            });
        }

        // Filter products by category
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => {
                this.filterProductsByCategory();
            });
        }

        // Print receipt button
        const printReceiptBtn = document.getElementById('print-receipt-btn');
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => {
                this.handlePrintReceipt();
            });
        }

        // Mobile-specific event listeners
        this.initMobileListeners();
    }

    /**
     * Initialize Mobile-Specific Event Listeners
     */
    initMobileListeners() {
        // Close overlay when clicking receipt close button on mobile
        const receiptCloseBtn = document.getElementById('receipt-close-btn');
        if (receiptCloseBtn) {
            receiptCloseBtn.addEventListener('click', () => {
                document.querySelector('.overlay').classList.remove('active');
            });
        }

        // Handle mobile form view toggling
        const viewDetailsBtn = document.getElementById('view-details-btn');
        const viewItemsBtn = document.getElementById('view-items-btn');
        
        if (viewDetailsBtn && viewItemsBtn) {
            const detailsSection = document.querySelector('.form-details');
            const itemsSection = document.querySelector('.items-list');
            
            viewDetailsBtn.addEventListener('click', () => {
                detailsSection.classList.add('active');
                itemsSection.classList.remove('active');
                viewDetailsBtn.classList.add('active');
                viewItemsBtn.classList.remove('active');
            });
            
            viewItemsBtn.addEventListener('click', () => {
                itemsSection.classList.add('active');
                detailsSection.classList.remove('active');
                viewItemsBtn.classList.add('active');
                viewDetailsBtn.classList.remove('active');
            });
        }
    }

    /**
     * Load Suppliers from Database
     */
    loadSuppliers() {
        if (!this.supplierSelect) return;
        
        // Clear current options
        this.supplierSelect.innerHTML = '<option value="">--هەڵبژاردنی دابینکەر--</option>';
        
        // Fetch suppliers from database
        this.databaseManager.getSuppliers()
            .then(suppliers => {
                suppliers.forEach(supplier => {
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = supplier.name;
                    this.supplierSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading suppliers:', error);
                this.showAlert('کێشە هەیە لە هێنانی دابینکەرەکان', 'danger');
            });
    }

    /**
     * Load Products from Database
     */
    loadProducts() {
        if (!this.productSelect) return;
        
        // Clear current options
        this.productSelect.innerHTML = '<option value="">--هەڵبژاردنی کاڵا--</option>';
        
        // Fetch products from database
        this.databaseManager.getProducts()
            .then(products => {
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.name;
                    option.dataset.category = product.categoryId;
                    option.dataset.unitPrice = product.buyPrice;
                    this.productSelect.appendChild(option);
                });
                
                // Initialize product selection listener
                this.productSelect.addEventListener('change', () => {
                    this.handleProductSelection();
                });
            })
            .catch(error => {
                console.error('Error loading products:', error);
                this.showAlert('کێشە هەیە لە هێنانی کاڵاکان', 'danger');
            });
    }

    /**
     * Load Categories from Database
     */
    loadCategories() {
        if (!this.categorySelect) return;
        
        // Clear current options
        this.categorySelect.innerHTML = '<option value="">--هەموو پۆلەکان--</option>';
        
        // Fetch categories from database
        this.databaseManager.getCategories()
            .then(categories => {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    this.categorySelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                this.showAlert('کێشە هەیە لە هێنانی پۆلەکان', 'danger');
            });
    }

    /**
     * Handle Product Selection
     */
    handleProductSelection() {
        const selectedProduct = this.productSelect.options[this.productSelect.selectedIndex];
        const unitPriceInput = document.getElementById('unit-price');
        
        if (selectedProduct && selectedProduct.value && unitPriceInput) {
            unitPriceInput.value = selectedProduct.dataset.unitPrice || '';
            this.calculateTotalPrice();
        }
    }

    /**
     * Calculate Total Price
     */
    calculateTotalPrice() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unit-price').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        
        const totalPrice = (quantity * unitPrice) - discount;
        document.getElementById('total-price').value = totalPrice.toFixed(2);
    }

    /**
     * Add Item to Purchase
     */
    addItemToPurchase() {
        // Get form values
        const productSelect = document.getElementById('product');
        const productId = productSelect.value;
        const productName = productSelect.options[productSelect.selectedIndex].textContent;
        const quantity = parseFloat(document.getElementById('quantity').value);
        const unitPrice = parseFloat(document.getElementById('unit-price').value);
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const totalPrice = parseFloat(document.getElementById('total-price').value);
        
        // Validate input
        if (!productId || !quantity || !unitPrice) {
            this.showAlert('تکایە کاڵا، بڕ و نرخ داخل بکە', 'danger');
            return;
        }
        
        // Create item object
        const item = {
            id: Date.now(), // Temporary ID for frontend tracking
            productId,
            productName,
            quantity,
            unitPrice,
            discount,
            totalPrice
        };
        
        // Add to purchase items array
        this.purchaseItems.push(item);
        
        // Update total
        this.total += totalPrice;
        document.getElementById('grand-total').textContent = this.total.toFixed(2);
        
        // Update items table
        this.updateItemsTable();
        
        // Reset product form
        document.getElementById('product').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('unit-price').value = '';
        document.getElementById('discount').value = '';
        document.getElementById('total-price').value = '';
        
        // Show success message
        this.showAlert('کاڵا زیادکرا بۆ لیستی کڕین', 'success');
    }

    /**
     * Update Items Table
     */
    updateItemsTable() {
        const itemsTableBody = document.querySelector('#items-table tbody');
        if (!itemsTableBody) return;
        
        // Clear current items
        itemsTableBody.innerHTML = '';
        
        // Add items to table
        this.purchaseItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${item.discount.toFixed(2)}</td>
                <td>${item.totalPrice.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            itemsTableBody.appendChild(row);
        });
        
        // Add remove item event listeners
        const removeButtons = document.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const itemId = parseInt(button.dataset.id);
                this.removeItemFromPurchase(itemId);
            });
        });
    }

    /**
     * Remove Item from Purchase
     */
    removeItemFromPurchase(itemId) {
        // Find the item in the array
        const itemIndex = this.purchaseItems.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            // Subtract from total
            this.total -= this.purchaseItems[itemIndex].totalPrice;
            
            // Remove from array
            this.purchaseItems.splice(itemIndex, 1);
            
            // Update UI
            this.updateItemsTable();
            document.getElementById('grand-total').textContent = this.total.toFixed(2);
            
            // Show message
            this.showAlert('کاڵا لابرا لە لیستی کڕین', 'info');
        }
    }

    /**
     * Filter Products by Category
     */
    filterProductsByCategory() {
        const categoryId = this.categorySelect.value;
        const allOptions = this.productSelect.querySelectorAll('option');
        
        // Reset product select
        this.productSelect.value = '';
        
        // Show all if no category selected
        if (!categoryId) {
            allOptions.forEach(option => {
                option.style.display = '';
            });
            return;
        }
        
        // Filter options
        allOptions.forEach(option => {
            // Always show the default option
            if (!option.value) {
                option.style.display = '';
                return;
            }
            
            if (option.dataset.category === categoryId) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    }

    /**
     * Handle Adding a New Supplier
     */
    handleAddSupplier() {
        const supplierName = document.getElementById('supplier-name').value;
        const supplierPhone = document.getElementById('supplier-phone').value;
        const supplierAddress = document.getElementById('supplier-address').value;
        
        // Validate input
        if (!supplierName) {
            this.showAlert('تکایە ناوی دابینکەر داخل بکە', 'danger');
            return;
        }
        
        // Create supplier object
        const supplier = {
            id: Date.now(), // Will be replaced by DB
            name: supplierName,
            phone: supplierPhone,
            address: supplierAddress
        };
        
        // Add to database
        this.databaseManager.addSupplier(supplier)
            .then(() => {
                // Reload suppliers
                this.loadSuppliers();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSupplierModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('add-supplier-form').reset();
                
                // Show success message
                this.showAlert('دابینکەر زیادکرا بە سەرکەوتوویی', 'success');
            })
            .catch(error => {
                console.error('Error adding supplier:', error);
                this.showAlert('کێشە هەیە لە زیادکردنی دابینکەر', 'danger');
            });
    }

    /**
     * Handle Adding a New Product
     */
    handleAddProduct() {
        const productName = document.getElementById('product-name').value;
        const productCategory = document.getElementById('product-category').value;
        const productBuyPrice = parseFloat(document.getElementById('product-buy-price').value);
        const productSellPrice = parseFloat(document.getElementById('product-sell-price').value);
        
        // Validate input
        if (!productName || !productCategory || !productBuyPrice || !productSellPrice) {
            this.showAlert('تکایە هەموو زانیاریەکان داخل بکە', 'danger');
            return;
        }
        
        // Create product object
        const product = {
            id: Date.now(), // Will be replaced by DB
            name: productName,
            categoryId: productCategory,
            buyPrice: productBuyPrice,
            sellPrice: productSellPrice,
            stock: 0
        };
        
        // Add to database
        this.databaseManager.addProduct(product)
            .then(() => {
                // Reload products
                this.loadProducts();
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('add-product-form').reset();
                
                // Show success message
                this.showAlert('کاڵا زیادکرا بە سەرکەوتوویی', 'success');
            })
            .catch(error => {
                console.error('Error adding product:', error);
                this.showAlert('کێشە هەیە لە زیادکردنی کاڵا', 'danger');
            });
    }

    /**
     * Handle Form Submission
     */
    handleFormSubmit() {
        // Validate items
        if (this.purchaseItems.length === 0) {
            this.showAlert('تکایە لانی کەم یەک کاڵا زیاد بکە', 'danger');
            return;
        }
        
        // Get supplier
        const supplierId = this.supplierSelect.value;
        if (!supplierId) {
            this.showAlert('تکایە دابینکەر هەڵبژێرە', 'danger');
            return;
        }
        
        // Get payment details
        const paymentType = document.getElementById('payment-type').value;
        const paidAmount = parseFloat(document.getElementById('paid-amount').value) || 0;
        const paymentStatus = document.getElementById('payment-status').value;
        const notes = document.getElementById('notes').value || '';
        
        // Create purchase object
        const purchase = {
            id: Date.now(),
            date: new Date().toISOString(),
            supplierId,
            items: this.purchaseItems,
            total: this.total,
            paymentType,
            paidAmount,
            paymentStatus,
            remainingAmount: this.total - paidAmount,
            notes
        };
        
        // Add to database
        this.databaseManager.addPurchase(purchase)
            .then(() => {
                // Update product stock
                this.updateProductStock();
                
                // Update supplier debt if not fully paid
                if (paidAmount < this.total) {
                    this.updateSupplierDebt(supplierId, this.total - paidAmount);
                }
                
                // Show receipt
                this.showReceipt(purchase);
                
                // Reset form
                this.resetForm();
                
                // Show success message
                this.showAlert('کڕین تۆمار کرا بە سەرکەوتوویی', 'success');
            })
            .catch(error => {
                console.error('Error adding purchase:', error);
                this.showAlert('کێشە هەیە لە تۆمارکردنی کڕین', 'danger');
            });
    }

    /**
     * Update Product Stock
     */
    updateProductStock() {
        // Update stock for each item
        this.purchaseItems.forEach(item => {
            this.databaseManager.getProduct(item.productId)
                .then(product => {
                    // Update stock
                    product.stock += item.quantity;
                    
                    // Save to database
                    this.databaseManager.updateProduct(product)
                        .catch(error => {
                            console.error('Error updating product stock:', error);
                        });
                })
                .catch(error => {
                    console.error('Error getting product:', error);
                });
        });
    }

    /**
     * Update Supplier Debt
     */
    updateSupplierDebt(supplierId, amount) {
        this.databaseManager.getSupplier(supplierId)
            .then(supplier => {
                // Add or update debt field
                supplier.debt = (supplier.debt || 0) + amount;
                
                // Save to database
                this.databaseManager.updateSupplier(supplier)
                    .catch(error => {
                        console.error('Error updating supplier debt:', error);
                    });
            })
            .catch(error => {
                console.error('Error getting supplier:', error);
            });
    }

    /**
     * Show Receipt
     */
    showReceipt(purchase) {
        // Get supplier name
        const supplierName = this.supplierSelect.options[this.supplierSelect.selectedIndex].textContent;
        
        // Prepare receipt content
        const receiptContent = `
            <div class="receipt">
                <div class="receipt-header">
                    <h3>پسوولەی کڕین</h3>
                    <p>ژمارە: ${purchase.id}</p>
                    <p>بەروار: ${new Date().toLocaleDateString('ku')}</p>
                </div>
                
                <div class="receipt-supplier">
                    <h4>دابینکەر</h4>
                    <p>${supplierName}</p>
                </div>
                
                <div class="receipt-items">
                    <h4>کاڵاکان</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>کاڵا</th>
                                <th>بڕ</th>
                                <th>نرخی یەکە</th>
                                <th>داشکاندن</th>
                                <th>کۆی گشتی</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${purchase.items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>${item.unitPrice.toFixed(2)}</td>
                                    <td>${item.discount.toFixed(2)}</td>
                                    <td>${item.totalPrice.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="5" class="text-end"><strong>کۆی گشتی:</strong></td>
                                <td><strong>${purchase.total.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="receipt-payment">
                    <h4>پارەدان</h4>
                    <p>شێوازی پارەدان: ${purchase.paymentType}</p>
                    <p>بڕی پارەی دراو: ${purchase.paidAmount.toFixed(2)}</p>
                    <p>باری پارەدان: ${purchase.paymentStatus}</p>
                    <p>بڕی پارەی ماوە: ${purchase.remainingAmount.toFixed(2)}</p>
                </div>
                
                ${purchase.notes ? `
                <div class="receipt-notes">
                    <h4>تێبینی</h4>
                    <p>${purchase.notes}</p>
                </div>
                ` : ''}
                
                <div class="receipt-footer mt-4 text-center">
                    <p>سوپاس بۆ مامەڵەکردنتان لەگەڵ ئێمە</p>
                </div>
            </div>
        `;
        
        // Show receipt in modal
        const receiptModal = document.getElementById('receiptModal');
        const receiptBody = receiptModal.querySelector('.modal-body');
        receiptBody.innerHTML = receiptContent;
        
        // Show modal
        const modal = new bootstrap.Modal(receiptModal);
        modal.show();
    }

    /**
     * Handle Print Receipt
     */
    handlePrintReceipt() {
        const receiptContent = document.querySelector('.receipt').outerHTML;
        
        // Create print window
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>پسوولەی کڕین</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
                    <link rel="stylesheet" href="css/style.css">
                    <style>
                        body {
                            font-family: 'Zain', Arial, sans-serif;
                            direction: rtl;
                            padding: 20px;
                        }
                        .receipt {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        .receipt-header, .receipt-supplier, .receipt-items, 
                        .receipt-payment, .receipt-notes, .receipt-footer {
                            margin-bottom: 20px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            padding: 8px;
                            border: 1px solid #ddd;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .receipt {
                                border: none;
                                box-shadow: none;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${receiptContent}
                    <div class="text-center mt-4 no-print">
                        <button onclick="window.print()" class="btn btn-primary">چاپکردن</button>
                        <button onclick="window.close()" class="btn btn-secondary ms-2">داخستن</button>
                    </div>
                </body>
            </html>
        `);
        
        // Focus and prepare for printing
        printWindow.document.close();
        printWindow.focus();
    }

    /**
     * Reset Form
     */
    resetForm() {
        // Reset all form fields
        this.buyForm.reset();
        
        // Clear purchase items
        this.purchaseItems = [];
        this.total = 0;
        
        // Update UI
        this.updateItemsTable();
        document.getElementById('grand-total').textContent = '0.00';
    }

    /**
     * Show Alert
     */
    showAlert(message, type = 'info') {
        if (!this.alertContainer) return;
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${type} alert-dismissible fade show`;
        alertElement.setAttribute('role', 'alert');
        
        alertElement.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        this.alertContainer.appendChild(alertElement);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                this.alertContainer.removeChild(alertElement);
            }, 150);
        }, 5000);
    }
} 