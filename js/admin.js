// js/admin.js

// ... (toggleQuantityField, createVariantInput, addVariantInput remain the same) ...

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-dashboard.html')) {
        toggleQuantityField(); 
        loadInventory();
        loadNotifications();
        document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    }
});


/**
 * 1. ADMIN ACTION: Handles creation of new product/service.
 */
async function handleProductSubmit(event) {
    event.preventDefault();
    
    // ... (logic to gather name, category, pricing/variants, and image remains the same) ...

    // --- NEW: Save to API ---
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const result = await response.json();
        
        if (result.success) {
            messageDisplay.textContent = 'Product/Service created successfully!';
            messageDisplay.style.color = 'green';
            document.getElementById('product-form').reset();
            document.getElementById('variant-list').innerHTML = '';
            toggleQuantityField();
            loadInventory();
        } else {
            messageDisplay.textContent = result.message || "Failed to save product.";
            messageDisplay.style.color = 'red';
        }

    } catch (error) {
        messageDisplay.textContent = "Error connecting to server to save product.";
        messageDisplay.style.color = 'red';
        console.error('Save Product Error:', error);
    }
    // --- END NEW ---
}


/**
 * 3. DISPLAY: Loads and renders the inventory list (Index) from API.
 */
async function loadInventory() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        // ... (The rest of the rendering logic remains the same, using 'products') ...

    } catch (error) {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = `<tr><td colspan="6" style="color: red;">Error loading inventory: Server offline or API error.</td></tr>`;
        console.error('Load Inventory Error:', error);
    }
}

/**
 * 4. ADMIN ACTION: Deletes a product via API.
 */
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();

        if (result.success) {
            loadInventory(); // Refresh list on success
        } else {
            alert(result.message || "Failed to delete product.");
        }
    } catch (error) {
        alert("Error connecting to server to delete product.");
        console.error('Delete Product Error:', error);
    }
}

/**
 * 5. DISPLAY: Loads and renders the receipt audit trail (Notifications) from API.
 */
async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/receipts`);
        let receipts = await response.json();
        
        // ... (The rest of the rendering logic remains the same) ...

    } catch (error) {
        const notificationList = document.getElementById('notification-list');
        notificationList.innerHTML = '<li>Error loading receipts: Server offline.</li>';
        console.error('Load Notifications Error:', error);
    }
}