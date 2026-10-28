import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { categories } from '../src/data/categories.js';
import { products } from '../src/data/products.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_u9f8qhSgGQmM@ep-weathered-hall-b4x80hi0-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

const CAMEL_MAP = {
  categoryid: 'categoryId',
  packsize: 'packSize',
  instock: 'inStock',
  iconname: 'iconName',
  displayorder: 'displayOrder',
  isactive: 'isActive',
  customername: 'customerName',
  totalamount: 'totalAmount',
  orderid: 'orderId',
  productid: 'productId',
  publicid: 'publicId'
};

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  for (const [key, val] of Object.entries(row)) {
    const camel = CAMEL_MAP[key.toLowerCase()];
    if (camel && !(camel in normalized)) {
      normalized[camel] = val;
    }
  }
  return normalized;
}

const db = {
  pool,
  query: (text, params) => pool.query(text, params),
  runAsync: async (text, params = []) => {
    const res = await pool.query(text, params);
    return {
      rowCount: res.rowCount,
      rows: res.rows.map(normalizeRow),
      lastID: res.rows[0]?.id
    };
  },
  allAsync: async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows.map(normalizeRow);
  },
  getAsync: async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows[0] ? normalizeRow(res.rows[0]) : null;
  }
};

async function initDB() {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS website_settings (
      id SERIAL PRIMARY KEY,
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
      "iconName" TEXT,
      "publicId" TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      "categoryId" TEXT REFERENCES categories (id) ON DELETE SET NULL,
      image TEXT,
      "packSize" TEXT,
      price REAL,
      "inStock" BOOLEAN DEFAULT true,
      "featured" BOOLEAN DEFAULT false,
      description TEXT,
      "publicId" TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      "customerName" TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      "totalAmount" REAL,
      status TEXT,
      date TEXT
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      "orderId" INTEGER REFERENCES orders (id) ON DELETE CASCADE,
      "productId" TEXT,
      quantity INTEGER,
      price REAL
    )
  `);

  // --- CMS Tables ---
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS navigation_items (
      id TEXT PRIMARY KEY,
      label TEXT,
      path TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS hero_value_tags (
      id TEXT PRIMARY KEY,
      label TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS commitments (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      "iconName" TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title TEXT,
      image TEXT,
      description TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER,
      "publicId" TEXT
    )
  `);

  // Migrate existing tables to have publicId column if they were created earlier
  try {
    await db.runAsync('ALTER TABLE categories ADD COLUMN IF NOT EXISTS "publicId" TEXT');
    await db.runAsync('ALTER TABLE products ADD COLUMN IF NOT EXISTS "publicId" TEXT');
    await db.runAsync('ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS "publicId" TEXT');
  } catch (migErr) {
    console.error('Column migration note:', migErr.message);
  }

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS footer_links (
      id TEXT PRIMARY KEY,
      label TEXT,
      path TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS social_links (
      id TEXT PRIMARY KEY,
      platform TEXT,
      url TEXT,
      "iconName" TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "displayOrder" INTEGER
    )
  `);

  // Seed default admin
  const admin = await db.getAsync("SELECT * FROM admins WHERE email = $1", ['admin@grocery.com']);
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.runAsync("INSERT INTO admins (email, password, name) VALUES ($1, $2, $3)", ['admin@grocery.com', hashedPassword, 'Super Admin']);
    console.log("Seeded default admin (admin@grocery.com / admin123)");
  }

  // Seed default settings
  const settingsCount = await db.allAsync("SELECT * FROM website_settings");
  if (settingsCount.length === 0) {
    const defaultSettings = {
      businessName: "Grocery Mart",
      contactEmail: "support@grocerymart.com",
      contactPhone: "+91 7675803038",
      currency: "₹",
      deliveryCharge: "50",
      minOrderValue: "500",
      aboutText: "We are your trusted local grocery store, providing fresh and quality products every day.",
      address: "123 Grocery Market, Food Street, City",
      heroHeading: "Fresh Groceries Delivered Fast!",
      heroSubtitle: "Get farm-fresh produce and daily essentials delivered to your doorstep within hours.",
      whatsappNumber: "7675803038"
    };
    for (const [key, value] of Object.entries(defaultSettings)) {
      await db.runAsync(
        "INSERT INTO website_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
        [key, value]
      );
    }
  }

  // Seed categories
  const catCount = await db.allAsync("SELECT * FROM categories");
  if (catCount.length === 0) {
    for (const cat of categories) {
      await db.runAsync(
        'INSERT INTO categories (id, name, description, image, "iconName") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [cat.id, cat.name, cat.description, cat.image, cat.iconName]
      );
    }
  }

  // Seed products
  const prodCount = await db.allAsync("SELECT * FROM products");
  if (prodCount.length === 0) {
    for (const prod of products) {
      await db.runAsync(
        'INSERT INTO products (id, name, "categoryId", image, "packSize", price, "inStock", "featured", description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [prod.id, prod.name, prod.categoryId, prod.image, prod.packSize, prod.price, Boolean(prod.inStock), Boolean(prod.featured), prod.description || null]
      );
    }
  }

  // Seed commitments
  const commitments = await db.allAsync("SELECT * FROM commitments");
  if (commitments.length === 0) {
    await db.runAsync('INSERT INTO commitments (id, title, description, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['c1', 'Everyday Essentials', 'From fresh produce to daily household items, we stock everything you need.', 'ShoppingBag', 1]);
    await db.runAsync('INSERT INTO commitments (id, title, description, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['c2', 'Wide Variety', 'A carefully curated selection of local and popular brands.', 'ListTree', 2]);
    await db.runAsync('INSERT INTO commitments (id, title, description, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['c3', 'Convenient Location', 'Right in your neighbourhood, making daily shopping easy and quick.', 'MapPin', 3]);
    await db.runAsync('INSERT INTO commitments (id, title, description, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['c4', 'Friendly Local Service', 'We know our customers and are always here to help you find what you need.', 'HeartHandshake', 4]);
  }

  // Seed navigation
  const navs = await db.allAsync("SELECT * FROM navigation_items");
  if (navs.length === 0) {
    await db.runAsync('INSERT INTO navigation_items (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['n1', 'Home', '/', 1]);
    await db.runAsync('INSERT INTO navigation_items (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['n2', 'Products', '/products', 2]);
    await db.runAsync('INSERT INTO navigation_items (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['n3', 'About', '/about', 3]);
    await db.runAsync('INSERT INTO navigation_items (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['n4', 'Gallery', '/gallery', 4]);
    await db.runAsync('INSERT INTO navigation_items (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['n5', 'Contact', '/contact', 5]);
  }

  // Seed hero tags
  const tags = await db.allAsync("SELECT * FROM hero_value_tags");
  if (tags.length === 0) {
    await db.runAsync('INSERT INTO hero_value_tags (id, label, "displayOrder") VALUES ($1, $2, $3)', ['t1', 'Everyday Essentials', 1]);
    await db.runAsync('INSERT INTO hero_value_tags (id, label, "displayOrder") VALUES ($1, $2, $3)', ['t2', 'Convenient Location', 2]);
    await db.runAsync('INSERT INTO hero_value_tags (id, label, "displayOrder") VALUES ($1, $2, $3)', ['t3', 'Friendly Service', 3]);
  }

  // Seed social links
  const socials = await db.allAsync("SELECT * FROM social_links");
  if (socials.length === 0) {
    await db.runAsync('INSERT INTO social_links (id, platform, url, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['s1', 'Facebook', '#', 'Facebook', 1]);
    await db.runAsync('INSERT INTO social_links (id, platform, url, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['s2', 'Instagram', '#', 'Instagram', 2]);
    await db.runAsync('INSERT INTO social_links (id, platform, url, "iconName", "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['s3', 'Twitter', '#', 'Twitter', 3]);
  }

  // Seed gallery
  const galleries = await db.allAsync("SELECT * FROM gallery_items");
  if (galleries.length === 0) {
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g1', 'Store Exterior', '/images/store-exterior.jpg', 'Our welcoming storefront on Main Road, Nandigama.', 1]);
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g2', 'Store Interior', '/images/hero-store.jpg', 'Bright and neatly arranged aisles for comfortable shopping.', 2]);
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g3', 'Grocery & Grains Section', '/images/grocery.jpg', 'Fresh rice, lentils, spices, and everyday food staples.', 3]);
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g4', 'Beverage Coolers', '/images/beverages.jpg', 'Chilled mineral water, juices, and soft drinks ready to go.', 4]);
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g5', 'Snacks & Confectionery', '/images/snacks.jpg', 'Biscuits, chocolates, chips, and quick refreshments.', 5]);
    await db.runAsync('INSERT INTO gallery_items (id, title, image, description, "displayOrder") VALUES ($1, $2, $3, $4, $5)', ['g6', 'Stationery & School Supplies', '/images/stationery.jpg', 'Notebooks, pens, registers, and office supplies.', 6]);
  }

  // Seed footer
  const footers = await db.allAsync("SELECT * FROM footer_links");
  if (footers.length === 0) {
    await db.runAsync('INSERT INTO footer_links (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['f1', 'Home', '/', 1]);
    await db.runAsync('INSERT INTO footer_links (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['f2', 'Products', '/products', 2]);
    await db.runAsync('INSERT INTO footer_links (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['f3', 'About Us', '/about', 3]);
    await db.runAsync('INSERT INTO footer_links (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['f4', 'Gallery', '/gallery', 4]);
    await db.runAsync('INSERT INTO footer_links (id, label, path, "displayOrder") VALUES ($1, $2, $3, $4)', ['f5', 'Contact', '/contact', 5]);
  }
}

initDB().catch(console.error);

export default db;
