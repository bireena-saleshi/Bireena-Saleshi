// Sales Page JavaScript
let cart = [];

// Calculate item total with discount
function calculateItemTotal(item) {
    const baseAmount = item.price * item.quantity;
    let discountAmount = 0;
    
    if (item.discountType === 'percentage') {
        discountAmount = (baseAmount * item.discount) / 100;
    } else {
        discountAmount = parseFloat(item.discount) || 0;
    }
    
    return Math.max(0, baseAmount - discountAmount);
}

// Update item discount
function updateItemDiscount(index, value) {
    cart[index].discount = parseFloat(value) || 0;
    cart[index].subtotal = calculateItemTotal(cart[index]);
    updateCart();
}

// Update item discount type
function updateItemDiscountType(index, type) {
    cart[index].discountType = type;
    cart[index].subtotal = calculateItemTotal(cart[index]);
    updateCart();
}

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
    
    // Handle customer type change for GST fields
    const customerTypeSelect = document.getElementById('customerType');
    const gstinField = document.getElementById('gstinField');
    const placeOfSupplyField = document.getElementById('placeOfSupplyField');
    
    if (customerTypeSelect) {
        customerTypeSelect.addEventListener('change', function() {
            if (this.value === 'B2B') {
                gstinField.style.display = 'block';
                placeOfSupplyField.style.display = 'block';
                document.getElementById('customerGSTIN').required = true;
            } else {
                gstinField.style.display = 'none';
                placeOfSupplyField.style.display = 'none';
                document.getElementById('customerGSTIN').required = false;
                document.getElementById('customerGSTIN').value = '';
                document.getElementById('placeOfSupply').value = '';
            }
            // Recalculate when customer type changes
            if (cart.length > 0) {
                calculateTotalFromBackend();
            }
        });
    }
    
    // Recalculate when GSTIN changes
    const gstinInput = document.getElementById('customerGSTIN');
    if (gstinInput) {
        gstinInput.addEventListener('input', function() {
            if (this.value.length >= 2 && cart.length > 0) {
                calculateTotalFromBackend();
            }
        });
    }
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
                existingItem.subtotal = calculateItemTotal(existingItem);
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
                subtotal: price,
                discount: 0,
                discountType: 'fixed'
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
        const baseAmount = item.price * item.quantity;
        const itemTotal = calculateItemTotal(item);
        const itemDiscount = baseAmount - itemTotal;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item mb-3 p-2 border rounded">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <strong>${item.productName}</strong><br>
                        <small class="text-muted">₹${item.price.toFixed(2)} × ${item.quantity} = ₹${baseAmount.toFixed(2)}</small>
                        ${itemDiscount > 0 ? `<br><small class="text-success">Discount: -₹${itemDiscount.toFixed(2)}</small>` : ''}
                    </div>
                    <div class="text-end">
                        <strong>₹${itemTotal.toFixed(2)}</strong><br>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeItem(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12 mb-2">
                        <label class="form-label mb-1" style="font-size: 0.875rem;">Quantity:</label>
                        <div class="input-group input-group-sm">
                            <button type="button" class="btn btn-outline-secondary" onclick="decreaseQuantity(${index})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <input type="number" class="form-control text-center" min="1" max="${item.stock}" value="${item.quantity}" 
                                   onchange="updateQuantity(${index}, this.value)" 
                                   onblur="updateQuantity(${index}, this.value)"
                                   style="flex: 0 0 80px;">
                            <button type="button" class="btn btn-outline-secondary" onclick="increaseQuantity(${index})">
                                <i class="bi bi-plus"></i>
                            </button>
                            <span class="input-group-text">/ ${item.stock} available</span>
                        </div>
                    </div>
                    <div class="col-12">
                        <label class="form-label mb-1" style="font-size: 0.875rem;">Item Discount:</label>
                        <div class="input-group input-group-sm">
                            <input type="text" class="form-control discount-input" min="0" step="0.01" value="${item.discount}" 
                                   onchange="updateItemDiscount(${index}, this.value)" 
                                   onblur="updateItemDiscount(${index}, this.value)"
                                   placeholder="Enter discount" style="flex: 1;">
                            <select class="form-select" style="flex: 0 0 70px;" onchange="updateItemDiscountType(${index}, this.value)">
                                <option value="fixed" ${item.discountType === 'fixed' ? 'selected' : ''}>&#8377;</option>
                                <option value="percentage" ${item.discountType === 'percentage' ? 'selected' : ''}>&#37;</option>
                            </select>
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
    const customerType = document.getElementById('customerType').value;
    const customerGSTIN = document.getElementById('customerGSTIN').value;
    
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Update subtotal display
    subtotalEl.textContent = '₹' + subtotal.toFixed(2);
    
    try {
        const response = await fetch('/sales/api/calculate-total', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subtotal: subtotal,
                discount: discountValue,
                discountType: discountType,
                customerType: customerType,
                customerGSTIN: customerGSTIN
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update total with GST if applicable
            let totalDisplay = '₹' + data.total.toFixed(2);
            
            // Show GST breakdown if applicable
            if (data.hasGST && data.gstAmount > 0) {
                if (data.igst > 0) {
                    totalDisplay += ' <small class="text-muted">(incl. IGST ₹' + data.igst.toFixed(2) + ')</small>';
                } else if (data.cgst > 0 && data.sgst > 0) {
                    totalDisplay += ' <small class="text-muted">(incl. CGST ₹' + data.cgst.toFixed(2) + ' + SGST ₹' + data.sgst.toFixed(2) + ')</small>';
                }
            }
            
            totalEl.innerHTML = totalDisplay;
            updateDueAmount(data.total);
        } else {
            alert(data.message || 'Error calculating total');
            totalEl.textContent = '₹' + subtotal.toFixed(2);
        }
    } catch (error) {
        console.error('Calculation error:', error);
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
        cart[index].subtotal = calculateItemTotal(cart[index]);
        updateCart();
    } else {
        alert('Cannot add more. Insufficient stock!');
    }
}

// Decrease quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        cart[index].subtotal = calculateItemTotal(cart[index]);
        updateCart();
    } else {
        removeItem(index);
    }
}

// Update quantity directly from input
function updateQuantity(index, value) {
    const newQuantity = parseInt(value) || 1;
    const maxStock = cart[index].stock;
    
    // Validate quantity
    if (newQuantity < 1) {
        cart[index].quantity = 1;
        alert('Quantity cannot be less than 1');
    } else if (newQuantity > maxStock) {
        cart[index].quantity = maxStock;
        alert(`Cannot add more than ${maxStock}. Insufficient stock!`);
    } else {
        cart[index].quantity = newQuantity;
    }
    
    cart[index].subtotal = calculateItemTotal(cart[index]);
    updateCart();
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
    
    // Validate B2B GST fields
    const customerType = document.getElementById('customerType').value;
    if (customerType === 'B2B') {
        const gstin = document.getElementById('customerGSTIN').value.trim();
        if (!gstin) {
            alert('⚠️ Customer GSTIN is required for B2B transactions!');
            document.getElementById('customerGSTIN').focus();
            return;
        }
        
        // Validate GSTIN format (15 characters)
        if (gstin.length !== 15) {
            alert('⚠️ Invalid GSTIN format!\n\nGSTIN must be 15 characters long.');
            document.getElementById('customerGSTIN').focus();
            return;
        }
        
        // Basic GSTIN format validation
        const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinPattern.test(gstin)) {
            alert('⚠️ Invalid GSTIN format!\n\nFormat: 22AAAAA0000A1Z5\n\nExample: 27AAPFU0939F1ZV');
            document.getElementById('customerGSTIN').focus();
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
        alert('Error processing sale. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
});
