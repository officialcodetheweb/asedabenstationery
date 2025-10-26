// js/worker.js

// ... (Global variables and other helper functions remain the same) ...

/**
 * 1. CORE FUNCTION: Loads products/services created by Admin from API.
 */
async function loadProductsForWorker() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        // ... (The rest of the logic to calculate total products and render items remains the same) ...

    } catch (error) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '<p style="color: red;">Error loading products: Server offline or API error.</p>';
        console.error('Load Worker Products Error:', error);
    }
}

/**
 * 6. ACTION: Finalizes the sale, saves the receipt, deducts stock via API.
 */
async function processSale() {
    if (receiptCart.length === 0) {
        alert("Cannot finalize sale: Receipt is empty!");
        return;
    }

    const totalAmount = parseFloat(grandTotalDisplay.textContent.replace(CURRENCY, '').trim());
    
    // Package data for the API call
    const saleData = {
        workerName: localStorage.getItem('username') || 'Unknown',
        items: receiptCart.map(item => ({
            id: item.baseId || item.id, // Use baseId for stock lookup if it's a variant
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category,
            total: item.price * item.quantity
        })),
        totalAmount: totalAmount
    };

    try {
        const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData)
        });
        
        const result = await response.json();

        if (result.success) {
            // 3. Clear cart for the next sale
            receiptCart = [];
            
            // 4. Refresh product list (to show new stock level)
            loadProductsForWorker();
            updateReceiptDisplay();
            
            // 5. Print
            alert(`Sale finalized. Receipt #${result.receipt.id} saved to Admin log. Stock deducted. Preparing to print...`);
            printReceipt(result.receipt);
        } else {
            alert(result.message || "Sale failed on the server side.");
        }
    } catch (error) {
        alert("Error connecting to server to process sale.");
        console.error('Process Sale Error:', error);
    }
}

// ... (The rest of the worker.js functions remain the same) ...