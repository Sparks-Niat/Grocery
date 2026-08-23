import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

// Promisify some common methods for easier use
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

async function initDB() {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS website_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      image TEXT,
      iconName TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      categoryId TEXT,
      image TEXT,
      packSize TEXT,
      price REAL,
      inStock INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      description TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      totalAmount REAL,
      status TEXT,
      date TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER,
      productId TEXT,
      quantity INTEGER,
      price REAL,
      FOREIGN KEY (orderId) REFERENCES orders (id)
    )
  `);

  // --- CMS Tables ---
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS navigation_items (
      id TEXT PRIMARY KEY,
      label TEXT,
      path TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS hero_value_tags (
      id TEXT PRIMARY KEY,
      label TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS commitments (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      iconName TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title TEXT,
      image TEXT,
      description TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS footer_links (
      id TEXT PRIMARY KEY,
      label TEXT,
      path TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      platform TEXT,
      url TEXT,
      iconName TEXT,
      isActive INTEGER DEFAULT 1,
      displayOrder INTEGER
    )
  `);

  // Seed default admin
  const admin = await db.getAsync("SELECT * FROM admins WHERE email = 'admin@grocery.com'");
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.runAsync("INSERT INTO admins (email, password, name) VALUES (?, ?, ?)", ['admin@grocery.com', hashedPassword, 'Super Admin']);
    console.log("Seeded default admin (admin@grocery.com / admin123)");
  }

  // --- Seed CMS Tables ---
  const commitments = await db.allAsync("SELECT * FROM commitments");
  if (commitments.length === 0) {
    await db.runAsync("INSERT INTO commitments (id, title, description, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['c1', 'Everyday Essentials', 'From fresh produce to daily household items, we stock everything you need.', 'ShoppingBag', 1]);
    await db.runAsync("INSERT INTO commitments (id, title, description, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['c2', 'Wide Variety', 'A carefully curated selection of local and popular brands.', 'ListTree', 2]);
    await db.runAsync("INSERT INTO commitments (id, title, description, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['c3', 'Convenient Location', 'Right in your neighbourhood, making daily shopping easy and quick.', 'MapPin', 3]);
    await db.runAsync("INSERT INTO commitments (id, title, description, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['c4', 'Friendly Local Service', 'We know our customers and are always here to help you find what you need.', 'HeartHandshake', 4]);
  }

  const navs = await db.allAsync("SELECT * FROM navigation_items");
  if (navs.length === 0) {
    await db.runAsync("INSERT INTO navigation_items (id, label, path, displayOrder) VALUES (?, ?, ?, ?)", ['n1', 'Home', '/', 1]);
    await db.runAsync("INSERT INTO navigation_items (id, label, path, displayOrder) VALUES (?, ?, ?, ?)", ['n2', 'Products', '/products', 2]);
    await db.runAsync("INSERT INTO navigation_items (id, label, path, displayOrder) VALUES (?, ?, ?, ?)", ['n3', 'About', '/about', 3]);
    await db.runAsync("INSERT INTO navigation_items (id, label, path, displayOrder) VALUES (?, ?, ?, ?)", ['n4', 'Gallery', '/gallery', 4]);
    await db.runAsync("INSERT INTO navigation_items (id, label, path, displayOrder) VALUES (?, ?, ?, ?)", ['n5', 'Contact', '/contact', 5]);
  }

  const tags = await db.allAsync("SELECT * FROM hero_value_tags");
  if (tags.length === 0) {
    await db.runAsync("INSERT INTO hero_value_tags (id, label, displayOrder) VALUES (?, ?, ?)", ['t1', 'Everyday Essentials', 1]);
    await db.runAsync("INSERT INTO hero_value_tags (id, label, displayOrder) VALUES (?, ?, ?)", ['t2', 'Convenient Location', 2]);
    await db.runAsync("INSERT INTO hero_value_tags (id, label, displayOrder) VALUES (?, ?, ?)", ['t3', 'Friendly Service', 3]);
  }

  const socials = await db.allAsync("SELECT * FROM social_links");
  if (socials.length === 0) {
    await db.runAsync("INSERT INTO social_links (id, platform, url, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['s1', 'Facebook', '#', 'Facebook', 1]);
    await db.runAsync("INSERT INTO social_links (id, platform, url, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['s2', 'Instagram', '#', 'Instagram', 2]);
    await db.runAsync("INSERT INTO social_links (id, platform, url, iconName, displayOrder) VALUES (?, ?, ?, ?, ?)", ['s3', 'Twitter', '#', 'Twitter', 3]);
  }
}

initDB().catch(console.error);

export default db;
