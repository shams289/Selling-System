/**
 * Product Gallery Module
 * Handles product image gallery functionality including thumbnails, zoom, and user interactions
 */
class ProductGallery {
    constructor() {
        // Main elements
        this.thumbnails = document.querySelectorAll('.product-thumbnail');
        this.mainImage = document.getElementById('currentImage');
        this.productMainImage = document.getElementById('productMainImage');
        this.zoomLens = document.querySelector('.zoom-lens');
        this.zoomResult = document.querySelector('.zoom-result');
        
        // Controls
        this.decreaseBtn = document.getElementById('decreaseQuantity');
        this.increaseBtn = document.getElementById('increaseQuantity');
        this.quantityInput = document.getElementById('quantityInput');
        this.wishlistBtn = document.getElementById('wishlistToggle');
        this.colorOptions = document.querySelectorAll('.color-option');
        
        // States
        this.zoomActive = false;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.initThumbnails();
        this.initQuantityControls();
        this.initWishlistToggle();
        this.initColorOptions();
        
        // Initialize zoom when image is loaded
        this.mainImage.onload = () => this.initZoom();
        
        // Only enable zoom on desktop/large screens
        if (window.innerWidth > 1200) {
            this.initZoomEvents();
        }
        
        // Initialize zoom right away for first load
        this.initZoom();
    }
    
    initThumbnails() {
        this.thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                // Remove active class from all thumbnails
                this.thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                thumbnail.classList.add('active');
                
                // Update main image
                const imagePath = thumbnail.getAttribute('data-image');
                this.mainImage.src = imagePath;
                
                // Reset zoom if active
                if (this.zoomActive) {
                    this.moveZoomLens(null);
                }
            });
        });
    }
    
    initQuantityControls() {
        this.decreaseBtn.addEventListener('click', () => {
            let quantity = parseInt(this.quantityInput.value);
            if (quantity > 1) {
                this.quantityInput.value = quantity - 1;
            }
        });
        
        this.increaseBtn.addEventListener('click', () => {
            let quantity = parseInt(this.quantityInput.value);
            this.quantityInput.value = quantity + 1;
        });
    }
    
    initWishlistToggle() {
        this.wishlistBtn.addEventListener('click', () => {
            this.wishlistBtn.classList.toggle('active');
            
            // Toggle heart icon
            const heartIcon = this.wishlistBtn.querySelector('i');
            if (this.wishlistBtn.classList.contains('active')) {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
            } else {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
            }
        });
    }
    
    initColorOptions() {
        this.colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                this.colorOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
            });
        });
    }
    
    initZoom() {
        const cx = 3; // Zoom ratio
        this.zoomResult.style.backgroundImage = `url('${this.mainImage.src}')`;
        this.zoomResult.style.backgroundSize = `${this.mainImage.width * cx}px ${this.mainImage.height * cx}px`;
        
        const lensSizeX = this.zoomResult.offsetWidth / cx;
        const lensSizeY = this.zoomResult.offsetHeight / cx;
        
        this.zoomLens.style.width = `${lensSizeX}px`;
        this.zoomLens.style.height = `${lensSizeY}px`;
    }
    
    initZoomEvents() {
        this.productMainImage.addEventListener('mouseenter', () => {
            this.zoomLens.style.display = "block";
            this.zoomResult.style.display = "block";
            this.zoomActive = true;
        });
        
        this.productMainImage.addEventListener('mouseleave', () => {
            this.zoomLens.style.display = "none";
            this.zoomResult.style.display = "none";
            this.zoomActive = false;
        });
        
        this.productMainImage.addEventListener('mousemove', (e) => this.moveZoomLens(e));
    }
    
    moveZoomLens(e) {
        if (!e && this.zoomActive) {
            this.zoomLens.style.display = "none";
            this.zoomResult.style.display = "none";
            this.zoomActive = false;
            return;
        }
        
        let pos, x, y;
        e.preventDefault();
        pos = this.getCursorPos(e);
        x = pos.x - (this.zoomLens.offsetWidth / 2);
        y = pos.y - (this.zoomLens.offsetHeight / 2);
        
        // Prevent the lens from being positioned outside the image
        if (x > this.mainImage.width - this.zoomLens.offsetWidth) {
            x = this.mainImage.width - this.zoomLens.offsetWidth;
        }
        if (x < 0) {x = 0;}
        if (y > this.mainImage.height - this.zoomLens.offsetHeight) {
            y = this.mainImage.height - this.zoomLens.offsetHeight;
        }
        if (y < 0) {y = 0;}
        
        // Set the position of the lens
        this.zoomLens.style.left = `${x}px`;
        this.zoomLens.style.top = `${y}px`;
        
        // Display what the lens "sees"
        this.zoomResult.style.backgroundPosition = `-${x * 3}px -${y * 3}px`;
    }
    
    getCursorPos(e) {
        let a, x = 0, y = 0;
        e = e || window.event;
        a = this.mainImage.getBoundingClientRect();
        x = e.pageX - a.left - window.pageXOffset;
        y = e.pageY - a.top - window.pageYOffset;
        return {x, y};
    }
}

// Initialize the product gallery when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProductGallery();
    
    // Add to cart animation
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // Show success feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check me-2"></i> زیادکرا بۆ سەبەتە';
            this.classList.add('btn-success');
            
            // Reset after animation
            setTimeout(() => {
                this.innerHTML = originalText;
                this.classList.remove('btn-success');
            }, 2000);
        });
    }
}); 