// Sales Page JavaScript
let cart = [];

// Reset button state on page load (in case of back navigation or refresh)
window.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('completeSale');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Complete Sale';
    }
    // Clear cart on page load to reset state
    cart = [];
    updateCart();
});

// Prevent caching of page state
window.addEventListener('pageshow', function(event) {
    // Page was loaded from cache (back/forward button)
    const submitBtn = document.getElementById('completeSale');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Complete Sale';
    }
    // Clear cart when page shows
    cart = [];
    updateCart();
});

// Also reset on beforeunload
window.addEventListener('beforeunload', function() {
    const submitBtn = document.getElementById('completeSale');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Complete Sale';
    }
});

// Search products
document.getElementById('searchProduct').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productList tr');
    
    rows.forEach(row => {
        const productName = row.getAttribute('data-name');
        if (productName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Add to cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const productName = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const stock = parseInt(this.getAttribute('data-stock'));
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity < stock) {
                existingItem.quantity++;
                existingItem.subtotal = existingItem.quantity * price;
            } else {
                alert('Cannot add more. Insufficient stock!');
                return;
            }
        } else {
            cart.push({
                productId,
                productName,
                price,
                quantity: 1,
                stock,
                subtotal: price
            });
        }
        
        updateCart();
    });
});

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const completeSaleBtn = document.getElementById('completeSale');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted text-center">No items added</p>';
        subtotalEl.textContent = '₹0.00';
        totalEl.textContent = '₹0.00';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += item.subtotal;
        html += `
            <div class="cart-item mb-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <strong>${item.productName}</strong><br>
                        <small>₹${item.price.toFixed(2)} × ${item.quantity}</small>
                    </div>
                    <div class="text-end">
                        <strong>₹${item.subtotal.toFixed(2)}</strong><br>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-secondary" onclick="decreaseQuantity(${index})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="increaseQuantity(${index})">
                                <i class="bi bi-plus"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger" onclick="removeItem(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    subtotalEl.textContent = '₹' + subtotal.toFixed(2);
    
    // **SECURITY: Call backend to calculate total**
    calculateTotalFromBackend();
}

// **SECURITY: Calculate total from backend API**
async function calculateTotalFromBackend() {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    const discountType = document.getElementById('discountType').value;
    
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    try {
        const response = await fetch('/sales/api/calculate-total', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subtotal: subtotal,
                discount: discountValue,
                discountType: discountType
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            totalEl.textContent = '₹' + data.total.toFixed(2);
            updateDueAmount(data.total);
        } else {
            alert(data.message || 'Error calculating total');
            totalEl.textContent = '₹' + subtotal.toFixed(2);
        }
    } catch (error) {
        console.error('Backend calculation error:', error);
        // Fallback to basic calculation
        totalEl.textContent = '₹' + subtotal.toFixed(2);
    }
}

// Calculate total with discount - Legacy fallback
function calculateTotal() {
    calculateTotalFromBackend();
}

// Update due amount
function updateDueAmount(total) {
    const amountPaidInput = document.getElementById('amountPaid');
    const dueAmountDisplay = document.getElementById('dueAmountDisplay');
    const dueAmountSpan = document.getElementById('dueAmount');
    
    if (amountPaidInput) {
        const amountPaid = parseFloat(amountPaidInput.value) || 0;
        const due = Math.max(0, total - amountPaid);
        
        if (due > 0 && amountPaid > 0) {
            dueAmountDisplay.style.display = 'block';
            dueAmountSpan.textContent = '₹' + due.toFixed(2);
        } else {
            dueAmountDisplay.style.display = 'none';
        }
    }
}

// Discount change listeners - Call backend for calculations
document.getElementById('discountValue').addEventListener('input', calculateTotalFromBackend);
document.getElementById('discountType').addEventListener('change', calculateTotalFromBackend);

// Amount paid listener
const amountPaidInput = document.getElementById('amountPaid');
if (amountPaidInput) {
    amountPaidInput.addEventListener('input', function() {
        const totalText = document.getElementById('total').textContent;
        const total = parseFloat(totalText.replace('₹', ''));
        const amountPaid = parseFloat(this.value) || 0;
        
        // Prevent overpayment - amount paid should not exceed total
        if (amountPaid > total) {
            this.value = total.toFixed(2);
            alert('Amount paid cannot be more than the total bill amount of ₹' + total.toFixed(2));
        }
        
        updateDueAmount(total);
    });
}

// Increase quantity
function increaseQuantity(index) {
    if (cart[index].quantity < cart[index].stock) {
        cart[index].quantity++;
        cart[index].subtotal = cart[index].quantity * cart[index].price;
        updateCart();
    } else {
        alert('Cannot add more. Insufficient stock!');
    }
}

// Decrease quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        cart[index].subtotal = cart[index].quantity * cart[index].price;
        updateCart();
    } else {
        removeItem(index);
    }
}

// Remove item
function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// Phone number validation
const phoneInput = document.getElementById('customerPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Limit to 10 digits
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
    });
}

// Submit form - Backend will validate and calculate everything
document.getElementById('saleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate cart has items
    if (cart.length === 0) {
        alert('⚠️ Please add items to cart before submitting!\n\nYou must add at least one product to complete the sale.');
        return;
    }
    
    // Validate phone number if entered
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput && phoneInput.value.trim() !== '') {
        if (phoneInput.value.length !== 10) {
            alert('⚠️ Phone number must be exactly 10 digits!\n\nPlease enter a valid 10 digit phone number or leave it empty.');
            phoneInput.focus();
            return;
        }
    }
    
    // Show loading state
    const submitBtn = document.getElementById('completeSale');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Processing...';
    
    try {
        // **SECURITY: Validate cart with backend before submitting**
        const validateResponse = await fetch('/sales/api/validate-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: cart })
        });
        
        const validateData = await validateResponse.json();
        
        if (!validateData.success) {
            alert(validateData.message || 'Cart validation failed');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Backend validated cart - proceed with submission
        document.getElementById('cartData').value = JSON.stringify(cart);
        document.getElementById('discountAmount').value = document.getElementById('discountValue').value;
        document.getElementById('discountTypeInput').value = document.getElementById('discountType').value;
        
        // Submit the form
        this.submit();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('Error processing sale. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});
