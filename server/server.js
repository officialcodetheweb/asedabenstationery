const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// --- Initialization ---
const app = express(); 
const PORT = process.env.PORT || 3000; // Uses 3000 locally
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Middleware ---
// This enables connection from your local frontend file:///...
app.use(cors()); 
app.use(bodyParser.json()); 

// --- Data Handler Functions ---

/** Reads the data from the JSON file. */
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        // Handle empty file case
        if (!data) throw new Error("Data file is empty.");
        return JSON.parse(data);
    } catch (error) {
        // Initialize with default structure if file is missing, empty, or corrupted
        console.error("Error reading data file. Initializing with default structure:", error.message);
        return { 
            users: [
                { username: "admin1", password: "adminpassword", role: "admin" },
                { username: "worker1", "password": "workerpassword", role: "worker" }
            ],
            products: [],
            receipts: []
        };
    }
};

/** Writes the current data object to the JSON file. */
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// --- API Endpoints ---

// TEST ROUTE
app.get('/api', (req, res) => {
    res.status(200).json({ message: "Backend is responding successfully!" });
});


// 1. AUTHENTICATION: User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();

    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, message: "Login successful.", role: user.role, username: user.username });
    } else {
        res.status(401).json({ success: false, message: "Invalid username or password." });
    }
});

// 2. INVENTORY: Get All Products (for both Admin and Worker)
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// 3. INVENTORY: Add New Product/Service (Admin)
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    const data = readData();

    newProduct.id = Date.now().toString(); 
    data.products.push(newProduct);
    
    writeData(data);
    res.status(201).json({ success: true, message: "Product added successfully.", product: newProduct });
});

// 4. INVENTORY: Delete Product (Admin)
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const data = readData();
    
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);

    if (data.products.length < initialLength) {
        writeData(data);
        res.json({ success: true, message: "Product deleted." });
    } else {
        res.status(404).json({ success: false, message: "Product not found." });
    }
});

// 5. SALES: Process Sale & Deduct Stock (Worker)
app.post('/api/sales', (req, res) => {
    const saleData = req.body; 
    const data = readData();

    saleData.items.forEach(cartItem => {
        if (cartItem.category === 'product') {
            const product = data.products.find(p => p.id === (cartItem.baseId || cartItem.id));
            if (product) {
                product.quantity -= cartItem.quantity;
            }
        }
    });

    saleData.id = 'ABW-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    saleData.timestamp = Date.now();

    data.receipts.push(saleData);
    
    writeData(data);
    res.json({ success: true, message: "Sale processed successfully.", receipt: saleData });
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 POS Backend running locally on http://localhost:${PORT}`);
    readData(); 
});
