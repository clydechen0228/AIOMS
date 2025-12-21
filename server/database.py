import sqlite3
from typing import List, Dict, Any

DB_FILE = "./db.sqlite"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Products
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cas TEXT,
      purity TEXT,
      molecularFormula TEXT,
      stock INTEGER DEFAULT 0
    )
    ''')
    
    # Customers
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      contactPerson TEXT,
      totalOrders INTEGER DEFAULT 0
    )
    ''')
    
    # Orders
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      customerName TEXT, 
      productId INTEGER,
      productName TEXT,
      quantity INTEGER,
      amount REAL,
      status TEXT,
      date TEXT,
      FOREIGN KEY(customerId) REFERENCES customers(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )
    ''')
    
    # Agent Logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      agentName TEXT,
      action TEXT,
      details TEXT,
      timestamp TEXT,
      FOREIGN KEY(orderId) REFERENCES orders(id)
    )
    ''')

    conn.commit()
    seed_database(cursor, conn)
    conn.close()

def seed_database(cursor, conn):
    # Check if products exist
    count = cursor.execute('SELECT count(*) as count FROM products').fetchone()['count']
    
    if count == 0:
        print('Seeding database...')

        # Seed Products
        products = [
            ('L-Alanine', '56-41-7', '99.5%', 'C3H7NO2', 1200),
            ('L-Arginine', '74-79-3', '99.0%', 'C6H14N4O2', 800),
            ('Glycine', '56-40-6', '99.8%', 'C2H5NO2', 2500),
            ('L-Lysine HCl', '657-27-2', '98.5%', 'C6H15ClN2O2', 1500),
            ('L-Proline', '147-85-3', '99.0%', 'C5H9NO2', 600)
        ]
        cursor.executemany(
            'INSERT INTO products (name, cas, purity, molecularFormula, stock) VALUES (?, ?, ?, ?, ?)',
            products
        )

        # Seed Customers
        customers = [
            ('BioTech Solutions', 'contact@biotech.com', 'Dr. Sarah Smith', 12),
            ('NutraLab Inc.', 'purchasing@nutralab.com', 'John Doe', 8),
            ('PharmaGreen', 'info@pharmagreen.net', 'Alice Johnson', 5)
        ]
        cursor.executemany(
            'INSERT INTO customers (name, email, contactPerson, totalOrders) VALUES (?, ?, ?, ?)',
            customers
        )

        # Seed Orders
        orders = [
            (1, 'BioTech Solutions', 1, 'L-Alanine', 100, 2500.00, 'Pending', '2025-10-26'),
            (2, 'NutraLab Inc.', 3, 'Glycine', 500, 4200.00, 'Shipped', '2025-10-25'),
            (1, 'BioTech Solutions', 2, 'L-Arginine', 200, 3800.00, 'Delivered', '2025-10-24'),
            (3, 'PharmaGreen', 5, 'L-Proline', 50, 1100.00, 'Processing', '2025-10-24')
        ]
        cursor.executemany(
            'INSERT INTO orders (customerId, customerName, productId, productName, quantity, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            orders
        )
        
        conn.commit()
        print('Database seeded successfully.')
