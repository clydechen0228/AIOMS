import express from 'express';
import cors from 'cors';
import { initializeDatabase, getDb } from './database';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

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

// POST /api/orders
app.post('/api/orders', async (req, res) => {
    try {
        const { customerId, productId, quantity, amount, date } = req.body;
        const db = getDb();

        // Fetch names for denormalization (simple approach)
        const customer = await db.get('SELECT name FROM customers WHERE id = ?', customerId);
        const product = await db.get('SELECT name FROM products WHERE id = ?', productId);

        if (!customer || !product) {
            return res.status(400).json({ error: 'Invalid customer or product ID' });
        }

        const result = await db.run(
            'INSERT INTO orders (customerId, customerName, productId, productName, quantity, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [customerId, customer.name, productId, product.name, quantity, `$${amount.toFixed(2)}`, 'Pending', date]
        );
        res.status(201).json({ id: result.lastID, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create order' });
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
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const db = getDb();
        await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// GET /api/metrics
app.get('/api/metrics', async (req, res) => {
    try {
        const db = getDb();
        const productCountResult = await db.get('SELECT count(*) as count FROM products');
        const orderCountResult = await db.get("SELECT count(*) as count FROM orders WHERE status != 'Delivered'");

        // In a real app, revenue would be aggregated from orders.amount
        res.json({
            totalRevenue: "$45,231.89",
            activeOrders: String(orderCountResult.count),
            productsInStock: String(productCountResult.count),
            newCustomers: "+12%"
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
