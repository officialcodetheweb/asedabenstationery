// server/server.js

const express = require('express');
// In server/server.js (near the top with other requires)
const cors = require('cors');

// Below where you define 'app = express();'
app.use(cors()); 
// This should allow your GitHub Pages site to talk to Render
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Middleware ---
app.use(cors()); // Allows frontend (different origin) to access the server
app.use(bodyParser.json()); // To parse incoming JSON requests

// --- Data Handler Functions ---

/** Reads the data from the JSON file. */
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading data file:", error.message);
        // Initialize with default structure if file is missing or corrupted
        return { 
            users: [
                { username: "admin1", password: "adminpassword", role: "admin" },
                { username: "worker1", password: "workerpassword", role: "worker" }
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

// 1. AUTHENTICATION: User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();

    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        // Successful login
        res.json({ success: true, message: "Login successful.", role: user.role, username: user.username });
    } else {
        // Failed login
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

    // Simple ID generation for the product
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
    const saleData = req.body; // Includes cart and worker details
    const data = readData();

    // 5a. Deduct Stock from Products
    saleData.items.forEach(cartItem => {
        if (cartItem.category === 'product') {
            const product = data.products.find(p => p.id === (cartItem.baseId || cartItem.id));
            if (product) {
                product.quantity -= cartItem.quantity;
            }
        }
    });

    // 5b. Save Receipt
    saleData.id = 'ABW-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    saleData.timestamp = Date.now();

    data.receipts.push(saleData);
    
    writeData(data);
    res.json({ success: true, message: "Sale processed successfully.", receipt: saleData });
});


// In server/server.js, look for where you set up routes, and make sure this is there:

app.get('/api', (req, res) => {
    // Simple test route to confirm the backend is reachable
    res.status(200).json({ message: "Backend is responding successfully!" });
});

// ... (rest of your code, including login route)

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`🚀 POS Backend running on http://localhost:${PORT}`);
    console.log(`Check the ${DATA_FILE} file for persistent data.`);
    readData(); // Initial read to ensure data.json exists/is initialized
});