import express from 'express';
import cors from 'cors';
import { initializeDatabase, getDb } from './database';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize DB
initializeDatabase().catch(err => {
    console.error('Failed to initialize database:', err);
});

// --- API Routes ---

// GET /api/products
app.get('/api/products', async (req, res) => {
    try {
        const db = getDb();
        const products = await db.all('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST /api/products
app.post('/api/products', async (req, res) => {
    try {
        const { name, cas, purity, molecularFormula, stock } = req.body;
        const db = getDb();
        const result = await db.run(
            'INSERT INTO products (name, cas, purity, molecularFormula, stock) VALUES (?, ?, ?, ?, ?)',
            [name, cas, purity, molecularFormula, stock]
        );
        res.status(201).json({ id: result.lastID, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// GET /api/customers
app.get('/api/customers', async (req, res) => {
    try {
        const db = getDb();
        const customers = await db.all('SELECT * FROM customers');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// GET /api/orders
app.get('/api/orders', async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.all('SELECT * FROM orders ORDER BY date DESC');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req, res) => {
    try {
        const db = getDb();
        const order = await db.get('SELECT * FROM orders WHERE id = ?', req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Fetch associated customer details for the detailed view if needed, 
        // or just return the flattened order structure as the frontend expects simple objects for now.
        // Ideally, we'd do a JOIN here, but let's stick to the simple schema.
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// GET /api/metrics
app.get('/api/metrics', async (req, res) => {
    // Mock aggregation for now, or real if we want to write complex queries
    // For simplicity, returning static/mocked metrics similar to what the frontend expects
    // In a real app, this would be `SELECT SUM(amount)...`
    res.json({
        totalRevenue: "$45,231.89",
        activeOrders: 12,
        pendingShipments: 5,
        lowStockItems: 3
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
