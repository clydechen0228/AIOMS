import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export async function initializeDatabase() {
  db = await open({
    filename: './db.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cas TEXT,
      purity TEXT,
      molecularFormula TEXT,
      stock INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      contactPerson TEXT,
      totalOrders INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerId INTEGER,
      customerName TEXT, 
      productId INTEGER,
      productName TEXT,
      quantity INTEGER,
      amount TEXT,
      status TEXT,
      date TEXT,
      FOREIGN KEY(customerId) REFERENCES customers(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    );
  `);

  console.log('Database initialized');
  await seedDatabase();
}

async function seedDatabase() {
  const productsCount = await db.get('SELECT count(*) as count FROM products');

  if (productsCount.count === 0) {
    console.log('Seeding database...');

    // Seed Products
    await db.exec(`
      INSERT INTO products (name, cas, purity, molecularFormula, stock) VALUES
      ('L-Alanine', '56-41-7', '99.5%', 'C3H7NO2', 1200),
      ('L-Arginine', '74-79-3', '99.0%', 'C6H14N4O2', 800),
      ('Glycine', '56-40-6', '99.8%', 'C2H5NO2', 2500),
      ('L-Lysine HCl', '657-27-2', '98.5%', 'C6H15ClN2O2', 1500),
      ('L-Proline', '147-85-3', '99.0%', 'C5H9NO2', 600);
    `);

    // Seed Customers
    await db.exec(`
      INSERT INTO customers (name, email, contactPerson, totalOrders) VALUES
      ('BioTech Solutions', 'contact@biotech.com', 'Dr. Sarah Smith', 12),
      ('NutraLab Inc.', 'purchasing@nutralab.com', 'John Doe', 8),
      ('PharmaGreen', 'info@pharmagreen.net', 'Alice Johnson', 5);
    `);

    // Seed Orders
    await db.exec(`
      INSERT INTO orders (customerId, customerName, productId, productName, quantity, amount, status, date) VALUES
      (1, 'BioTech Solutions', 1, 'L-Alanine', 100, 2500.00, 'Pending', '2025-10-26'),
      (2, 'NutraLab Inc.', 3, 'Glycine', 500, 4200.00, 'Shipped', '2025-10-25'),
      (1, 'BioTech Solutions', 2, 'L-Arginine', 200, 3800.00, 'Delivered', '2025-10-24'),
      (3, 'PharmaGreen', 5, 'L-Proline', 50, 1100.00, 'Processing', '2025-10-24');
    `);

    console.log('Database seeded successfully.');
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}
