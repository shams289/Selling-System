/**
 * Add Product Page JavaScript
 * Handles tab navigation, form validation, image uploads, and other interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const addProductForm = document.getElementById('addProductForm');
    const productImageInput = document.getElementById('productImage');
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const purchasePriceInput = document.getElementById('purchasePrice');
    const sellingPriceInput = document.getElementById('sellingPrice');
    const nextTabBtn = document.getElementById('nextTabBtn');
    const prevTabBtn = document.getElementById('prevTabBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Get CSS variables for consistent styling in JS
    const style = getComputedStyle(document.documentElement);
    const primaryColor = style.getPropertyValue('--primary-color').trim();
    const primaryLight = style.getPropertyValue('--primary-light').trim();
    const lightGray = style.getPropertyValue('--light-gray').trim();
    const borderColor = style.getPropertyValue('--border-color').trim();
    
    // Current tab tracking
    let currentTabIndex = 0;
    const tabIds = ['basic-info', 'price-info', 'location-info'];
    
    // Toggle sidebar on mobile
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Handle clicks outside sidebar to close it on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnToggleBtn = toggleSidebarBtn && toggleSidebarBtn.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnToggleBtn && window.innerWidth < 992 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Tab navigation - clicking on tab headers
    if (tabItems.length > 0) {
        tabItems.forEach(item => {
            item.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchToTab(tabId);
            });
        });
    }
    
    // Next tab button
    if (nextTabBtn) {
        nextTabBtn.addEventListener('click', function() {
            if (currentTabIndex < tabIds.length - 1) {
                // Validate current tab before proceeding
                if (validateCurrentTab()) {
                    goToNextTab();
                }
            }
        });
    }
    
    // Previous tab button
    if (prevTabBtn) {
        prevTabBtn.addEventListener('click', function() {
            if (currentTabIndex > 0) {
                goToPrevTab();
            }
        });
    }
    
    // Form validation and submission
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate all tabs before submission
            if (validateAllTabs()) {
                // Get form values
                const productName = document.getElementById('productName').value;
                const productCode = document.getElementById('productCode').value;
                const purchasePrice = purchasePriceInput ? purchasePriceInput.value : '';
                const sellingPrice = sellingPriceInput ? sellingPriceInput.value : '';
                
                // In a real application, you would submit the form data to a server here
                // For this demo, we'll just show a success message
                showSuccessMessage();
                
                // Reset form
                addProductForm.reset();
                resetImageUpload();
                switchToTab('basic-info'); // Go back to first tab
            }
        });
    }
    
    // Image upload functionality
    if (productImageInput) {
        productImageInput.addEventListener('change', handleImageUpload);
    }
    
    // Auto-calculate profit when prices change
    if (purchasePriceInput && sellingPriceInput) {
        purchasePriceInput.addEventListener('input', updateProfit);
        sellingPriceInput.addEventListener('input', updateProfit);
        
        // Add visual feedback
        purchasePriceInput.addEventListener('change', function() {
            addHighlightEffect(this);
        });
        
        sellingPriceInput.addEventListener('change', function() {
            addHighlightEffect(this);
        });
    }
    
    // Functions
    
    // Switch to a specific tab
    function switchToTab(tabId) {
        // Update currentTabIndex
        currentTabIndex = tabIds.indexOf(tabId);
        
        // Update tab headers
        tabItems.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update tab contents
        tabContents.forEach(content => {
            if (content.id === tabId + '-content') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
        
        // Update buttons
        updateNavigationButtons();
    }
    
    // Go to next tab
    function goToNextTab() {
        if (currentTabIndex < tabIds.length - 1) {
            switchToTab(tabIds[currentTabIndex + 1]);
        }
    }
    
    // Go to previous tab
    function goToPrevTab() {
        if (currentTabIndex > 0) {
            switchToTab(tabIds[currentTabIndex - 1]);
        }
    }
    
    // Update navigation buttons based on current tab
    function updateNavigationButtons() {
        // Update previous button
        if (currentTabIndex > 0) {
            prevTabBtn.style.display = 'block';
        } else {
            prevTabBtn.style.display = 'none';
        }
        
        // Update next/submit buttons
        if (currentTabIndex === tabIds.length - 1) {
            nextTabBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextTabBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
    
    // Validate current tab
    function validateCurrentTab() {
        let isValid = true;
        const currentTabId = tabIds[currentTabIndex];
        
        // Basic info tab validation
        if (currentTabId === 'basic-info') {
            const productName = document.getElementById('productName').value;
            const productCode = document.getElementById('productCode').value;
            
            if (!productName) {
                showValidationError('productName', 'تکایە ناوی کاڵا بنووسە');
                isValid = false;
            } else {
                clearValidationError('productName');
            }
            
            if (!productCode) {
                showValidationError('productCode', 'تکایە کۆدی کاڵا بنووسە');
                isValid = false;
            } else {
                clearValidationError('productCode');
            }
        }
        
        // Price info tab validation
        else if (currentTabId === 'price-info') {
            const purchasePrice = document.getElementById('purchasePrice').value;
            const sellingPrice = document.getElementById('sellingPrice').value;
            
            if (!purchasePrice) {
                showValidationError('purchasePrice', 'تکایە نرخی کڕین بنووسە');
                isValid = false;
            } else {
                clearValidationError('purchasePrice');
            }
            
            if (!sellingPrice) {
                showValidationError('sellingPrice', 'تکایە نرخی فرۆشتن بنووسە');
                isValid = false;
            } else {
                clearValidationError('sellingPrice');
            }
        }
        
        // Location info tab validation
        else if (currentTabId === 'location-info') {
            const warehouseSection = document.getElementById('warehouseSection').value;
            
            if (!warehouseSection) {
                showValidationError('warehouseSection', 'تکایە بەشی کۆگا دیاری بکە');
                isValid = false;
            } else {
                clearValidationError('warehouseSection');
            }
        }
        
        return isValid;
    }
    
    // Validate all tabs
    function validateAllTabs() {
        // Store current tab
        const originalTabIndex = currentTabIndex;
        
        // Check each tab
        let isValid = true;
        for (let i = 0; i < tabIds.length; i++) {
            currentTabIndex = i;
            if (!validateCurrentTab()) {
                isValid = false;
                switchToTab(tabIds[i]); // Switch to the first invalid tab
                break;
            }
        }
        
        // If all tabs are valid, restore original tab
        if (isValid) {
            currentTabIndex = originalTabIndex;
        }
        
        return isValid;
    }
    
    // Show validation error for a field
    function showValidationError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Add error class
        field.classList.add('is-invalid');
        
        // Check if error message element already exists
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
            // Create error message element
            errorElement = document.createElement('div');
            errorElement.classList.add('invalid-feedback');
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        // Set error message
        errorElement.textContent = message;
        
        // Scroll to error field
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Clear validation error for a field
    function clearValidationError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Remove error class
        field.classList.remove('is-invalid');
        
        // Remove error message element if it exists
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('invalid-feedback')) {
            errorElement.remove();
        }
    }
    
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.match('image.*')) {
            alert('تکایە تەنها فایلی وێنە هەڵبژێرە');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('قەبارەی وێنە دەبێت کەمتر بێت لە 5 مێگابایت');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageUpload = document.querySelector('.image-upload');
            
            // Create image preview
            imageUpload.innerHTML = `
                <div style="position: relative; width: 100%; height: 200px; display: flex; align-items: center; justify-content: center;">
                    <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; object-fit: contain;">
                    <button type="button" id="removeImage" style="position: absolute; top: 0; right: 0; background: ${lightGray}; border: none; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Re-add the file input
            const newInput = document.createElement('input');
            newInput.type = 'file';
            newInput.accept = 'image/*';
            newInput.id = 'productImage';
            newInput.style.display = 'none';
            imageUpload.appendChild(newInput);
            
            // Add event listener to new input
            newInput.addEventListener('change', handleImageUpload);
            
            // Add event listener to remove button
            const removeBtn = document.getElementById('removeImage');
            if (removeBtn) {
                removeBtn.addEventListener('click', resetImageUpload);
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    function resetImageUpload() {
        const imageUpload = document.querySelector('.image-upload');
        if (!imageUpload) return;
        
        imageUpload.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <p>دەتوانیت وێنەیەک بۆ کاڵاکە هەڵبژێریت یان ڕایبکێشیت بۆ ئێرە</p>
            <input type="file" accept="image/*" id="productImage">
        `;
        
        // Re-add event listener
        const newInput = document.getElementById('productImage');
        if (newInput) {
            newInput.addEventListener('change', handleImageUpload);
        }
    }
    
    function updateProfit() {
        const purchasePrice = parseFloat(purchasePriceInput.value) || 0;
        const sellingPrice = parseFloat(sellingPriceInput.value) || 0;
        
        // Calculate profit amount
        const profitAmount = sellingPrice - purchasePrice;
        
        // Calculate profit margin as percentage
        let profitMargin = 0;
        if (purchasePrice > 0) {
            profitMargin = (profitAmount / purchasePrice) * 100;
        }
        
        // Update profit fields if they exist
        const profitAmountField = document.getElementById('profitAmount');
        const profitMarginField = document.getElementById('profitMargin');
        
        if (profitAmountField) {
            profitAmountField.value = profitAmount.toFixed(2);
            addHighlightEffect(profitAmountField);
        }
        
        if (profitMarginField) {
            profitMarginField.value = profitMargin.toFixed(2);
            addHighlightEffect(profitMarginField);
        }
    }
    
    function addHighlightEffect(element) {
        // Add a CSS class that has the animation
        element.classList.add('highlight-field');
        
        // Remove it after the animation completes
        setTimeout(() => {
            element.classList.remove('highlight-field');
        }, 1000);
    }
    
    function showSuccessMessage() {
        // Create success alert
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show';
        successAlert.role = 'alert';
        successAlert.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            کاڵاکە بە سەرکەوتوویی زیاد کرا
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insert at the top of the form
        const formCard = addProductForm.closest('.card-body');
        formCard.insertBefore(successAlert, formCard.firstChild);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            successAlert.classList.remove('show');
            setTimeout(() => successAlert.remove(), 300);
        }, 3000);
    }
    
    // Handle drag and drop for image upload
    const imageUploadArea = document.querySelector('.image-upload');
    if (imageUploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            imageUploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            imageUploadArea.classList.add('highlight');
            imageUploadArea.style.borderColor = primaryColor;
            imageUploadArea.style.backgroundColor = primaryLight;
        }
        
        function unhighlight() {
            imageUploadArea.classList.remove('highlight');
            imageUploadArea.style.borderColor = borderColor;
            imageUploadArea.style.backgroundColor = lightGray;
        }
        
        imageUploadArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const fileInput = document.getElementById('productImage');
                fileInput.files = files;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        }
    }
    
    // Initialize by making sure we're on the correct tab and buttons are set up
    switchToTab('basic-info');
}); 