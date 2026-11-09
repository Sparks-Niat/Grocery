import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists for offline fallback/cache
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(filename, defaultValue = []) {
  const filePath = path.join(dataDir, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return defaultValue;
  }
}

function writeJson(filename, data) {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
}

// Sync products back to src/data/products.js so the client can also run statically if needed
export function syncProductsToSrc(products) {
  try {
    const srcPath = path.join(__dirname, '..', 'src', 'data', 'products.js');
    const content = `// Auto-synchronized from Sri Manikanta Sai General Store Database
export const products = ${JSON.stringify(products, null, 2)};

export const getFeaturedProducts = () => {
  const featuredIds = [
    "snk-bingo",
    "choc-dairy-milk",
    "bisc-goodday",
    "tea-3roses",
    "dal-kandi",
    "bev-thumsup",
    "soap-santoor",
    "clean-rin-surf"
  ];
  return products.filter(p => featuredIds.includes(p.id));
};
`;
    fs.writeFileSync(srcPath, content, 'utf8');
  } catch (err) {
    console.error('Error syncing products to src/data/products.js:', err.message);
  }
}

// PostgreSQL Connection Pool for Neon
const connectionString = process.env.DATABASE_URL;
let pool = null;
let isPostgresAvailable = false;

if (connectionString) {
  pool = new pg.Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle Neon PostgreSQL client:', err.message);
  });
}

// In-memory runtime cache (seeded from JSON, synced with Neon)
let cache = {
  products: readJson('products.json', []),
  categories: readJson('categories.json', []),
  admins: readJson('admin.json', []),
  settings: readJson('settings.json', {}),
  orders: readJson('orders.json', []),
  inventoryLogs: readJson('inventory_logs.json', []),
  customers: readJson('customers.json', []),
  coupons: readJson('coupons.json', []),
  logs: readJson('logs.json', [])
};

// Safe Neon Database Initialization and Non-Destructive Migrations
async function initNeonDB() {
  if (!pool) {
    console.warn('[DATABASE] DATABASE_URL not set; running with local fallback cache.');
    return;
  }

  try {
    const client = await pool.connect();
    isPostgresAvailable = true;
    console.log('[DATABASE] Connected successfully to Neon PostgreSQL.');

    // 1. Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'admin',
        password TEXT,
        "passwordHash" TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT
      );
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
      ALTER TABLE admins ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;
    `);

    // 2. Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        "iconName" TEXT,
        "publicId" TEXT,
        "itemCount" INTEGER DEFAULT 0,
        "displayOrder" INTEGER DEFAULT 0
      );
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS "publicId" TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS "itemCount" INTEGER DEFAULT 0;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER DEFAULT 0;
    `);

    // 3. Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "categoryId" TEXT,
        subcategory TEXT,
        image TEXT,
        "packSize" TEXT,
        price REAL,
        "priceNote" TEXT,
        "inStock" BOOLEAN DEFAULT true,
        stock INTEGER DEFAULT 25,
        "lowStockThreshold" INTEGER DEFAULT 5,
        "isActive" BOOLEAN DEFAULT true,
        featured BOOLEAN DEFAULT false,
        brand TEXT,
        description TEXT,
        "publicId" TEXT,
        "createdAt" TEXT,
        "updatedAt" TEXT
      );
      ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "priceNote" TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 25;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "lowStockThreshold" INTEGER DEFAULT 5;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "publicId" TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "createdAt" TEXT;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS "updatedAt" TEXT;
    `);

    // 4. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        "orderDate" TEXT,
        "customerName" TEXT,
        "customerPhone" TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        "deliveryAddress" TEXT,
        items JSONB,
        subtotal REAL,
        "deliveryCharge" REAL,
        total REAL,
        "totalAmount" REAL,
        "paymentMethod" TEXT,
        "paymentStatus" TEXT,
        "orderStatus" TEXT,
        status TEXT,
        notes TEXT,
        date TEXT,
        "createdAt" TEXT
      );
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal REAL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "deliveryCharge" REAL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS total REAL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderStatus" TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
    `);

    // 5. Website Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS website_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT
      );
    `);

    // 6. Inventory Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id TEXT PRIMARY KEY,
        "productId" TEXT,
        "productName" TEXT,
        change INTEGER,
        reason TEXT,
        unit TEXT,
        "previousStock" INTEGER,
        "newStock" INTEGER,
        admin TEXT,
        timestamp TEXT
      );
    `);

    // 7. Customers Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT UNIQUE,
        address TEXT,
        "totalOrders" INTEGER DEFAULT 0,
        "totalSpent" REAL DEFAULT 0,
        "lastOrderDate" TEXT,
        notes TEXT
      );
    `);

    // 8. Coupons Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        "discountType" TEXT,
        "discountValue" REAL,
        "minOrder" REAL,
        "maxDiscount" REAL,
        "usageLimit" INTEGER,
        "timesUsed" INTEGER DEFAULT 0,
        "expiresAt" TEXT,
        "isActive" BOOLEAN DEFAULT true
      );
    `);

    // 9. Activity Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        action TEXT,
        details TEXT,
        admin TEXT,
        timestamp TEXT
      );
    `);

    // Sync Neon data into cache if Neon already has records
    const prodRes = await client.query('SELECT * FROM products ORDER BY name ASC');
    if (prodRes.rows.length > 0) {
      cache.products = prodRes.rows.map(r => ({
        ...r,
        inStock: Boolean(r.inStock),
        isActive: r.isActive !== false,
        featured: Boolean(r.featured)
      }));
      writeJson('products.json', cache.products);
      syncProductsToSrc(cache.products);
      console.log(`[DATABASE] Loaded ${cache.products.length} products from Neon PostgreSQL.`);
    } else if (cache.products.length > 0) {
      // Seed Neon from cache if Neon was empty
      for (const p of cache.products) {
        await client.query(`
          INSERT INTO products (id, name, "categoryId", subcategory, image, "packSize", price, "priceNote", "inStock", stock, "lowStockThreshold", "isActive", featured, brand, description, "publicId", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING
        `, [
          p.id, p.name, p.categoryId, p.subcategory || null, p.image || null, p.packSize || null,
          p.price != null ? Number(p.price) : null, p.priceNote || 'verified',
          p.inStock !== false, p.stock != null ? Number(p.stock) : 25,
          p.lowStockThreshold != null ? Number(p.lowStockThreshold) : 5,
          p.isActive !== false, Boolean(p.featured), p.brand || 'General',
          p.description || null, p.publicId || null, p.createdAt || new Date().toISOString()
        ]);
      }
      console.log(`[DATABASE] Seeded ${cache.products.length} products to Neon PostgreSQL.`);
    }

    // Categories
    const catRes = await client.query('SELECT * FROM categories ORDER BY "displayOrder" ASC, name ASC');
    if (catRes.rows.length > 0) {
      cache.categories = catRes.rows;
      writeJson('categories.json', cache.categories);
    } else if (cache.categories.length > 0) {
      for (const c of cache.categories) {
        await client.query(`
          INSERT INTO categories (id, name, description, image, "iconName", "publicId", "itemCount", "displayOrder")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING
        `, [c.id, c.name, c.description || null, c.image || null, c.iconName || 'Package', c.publicId || null, c.itemCount || 0, c.displayOrder || 0]);
      }
      console.log(`[DATABASE] Seeded ${cache.categories.length} categories to Neon PostgreSQL.`);
    }

    // Admins
    const adminRes = await client.query('SELECT * FROM admins');
    if (adminRes.rows.length > 0) {
      cache.admins = adminRes.rows.map(a => ({
        id: String(a.id),
        email: a.email,
        name: a.name,
        role: a.role || 'admin',
        passwordHash: a.passwordHash || a.password,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }));
      writeJson('admin.json', cache.admins);
    } else if (cache.admins.length > 0) {
      for (const a of cache.admins) {
        await client.query(`
          INSERT INTO admins (id, email, name, role, "passwordHash", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [String(a.id), a.email, a.name, a.role || 'admin', a.passwordHash, a.createdAt || new Date().toISOString(), a.updatedAt || null]);
      }
    }

    // Settings
    const setRes = await client.query('SELECT key, value FROM website_settings');
    if (setRes.rows.length > 0) {
      const setObj = {};
      setRes.rows.forEach(r => setObj[r.key] = r.value);
      cache.settings = { ...cache.settings, ...setObj };
      writeJson('settings.json', cache.settings);
    }

    client.release();
  } catch (err) {
    isPostgresAvailable = false;
    console.error('[DATABASE ERROR] Failed to initialize Neon PostgreSQL:', err.message);
  }
}

initNeonDB().catch(console.error);

export const db = {
  isPostgresConnected: () => isPostgresAvailable,

  testConnection: async () => {
    if (!pool) return { ok: false, error: 'DATABASE_URL not configured' };
    try {
      const res = await pool.query('SELECT 1 as alive');
      return { ok: res.rows[0]?.alive === 1 };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  // Products
  getProducts: () => cache.products,
  saveProducts: async (products) => {
    cache.products = products;
    writeJson('products.json', products);
    syncProductsToSrc(products);

    if (pool && isPostgresAvailable) {
      try {
        for (const p of products) {
          await pool.query(`
            INSERT INTO products (id, name, "categoryId", subcategory, image, "packSize", price, "priceNote", "inStock", stock, "lowStockThreshold", "isActive", featured, brand, description, "publicId", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              "categoryId" = EXCLUDED."categoryId",
              subcategory = EXCLUDED.subcategory,
              image = EXCLUDED.image,
              "packSize" = EXCLUDED."packSize",
              price = EXCLUDED.price,
              "priceNote" = EXCLUDED."priceNote",
              "inStock" = EXCLUDED."inStock",
              stock = EXCLUDED.stock,
              "lowStockThreshold" = EXCLUDED."lowStockThreshold",
              "isActive" = EXCLUDED."isActive",
              featured = EXCLUDED.featured,
              brand = EXCLUDED.brand,
              description = EXCLUDED.description,
              "publicId" = EXCLUDED."publicId",
              "updatedAt" = EXCLUDED."updatedAt"
          `, [
            p.id, p.name, p.categoryId, p.subcategory || null, p.image || null, p.packSize || null,
            p.price != null ? Number(p.price) : null, p.priceNote || 'verified',
            p.inStock !== false, p.stock != null ? Number(p.stock) : 25,
            p.lowStockThreshold != null ? Number(p.lowStockThreshold) : 5,
            p.isActive !== false, Boolean(p.featured), p.brand || 'General',
            p.description || null, p.publicId || null, new Date().toISOString()
          ]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving products to Neon:', err.message);
      }
    }
    return true;
  },

  deleteProductFromDb: async (id) => {
    if (pool && isPostgresAvailable) {
      try {
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
      } catch (err) {
        console.error('[DATABASE] Error deleting product from Neon:', err.message);
      }
    }
  },

  // Categories
  getCategories: () => cache.categories,
  saveCategories: async (categories) => {
    cache.categories = categories;
    writeJson('categories.json', categories);

    if (pool && isPostgresAvailable) {
      try {
        for (const c of categories) {
          await pool.query(`
            INSERT INTO categories (id, name, description, image, "iconName", "publicId", "itemCount", "displayOrder")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              image = EXCLUDED.image,
              "iconName" = EXCLUDED."iconName",
              "publicId" = EXCLUDED."publicId",
              "itemCount" = EXCLUDED."itemCount",
              "displayOrder" = EXCLUDED."displayOrder"
          `, [c.id, c.name, c.description || null, c.image || null, c.iconName || 'Package', c.publicId || null, c.itemCount || 0, c.displayOrder || 0]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving categories to Neon:', err.message);
      }
    }
    return true;
  },

  deleteCategoryFromDb: async (id) => {
    if (pool && isPostgresAvailable) {
      try {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      } catch (err) {
        console.error('[DATABASE] Error deleting category from Neon:', err.message);
      }
    }
  },

  // Admins
  getAdmins: () => cache.admins,
  saveAdmins: async (admins) => {
    cache.admins = admins;
    writeJson('admin.json', admins);

    if (pool && isPostgresAvailable) {
      try {
        for (const a of admins) {
          await pool.query(`
            INSERT INTO admins (id, email, name, role, "passwordHash", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              role = EXCLUDED.role,
              "passwordHash" = EXCLUDED."passwordHash",
              "updatedAt" = EXCLUDED."updatedAt"
          `, [String(a.id), a.email, a.name, a.role || 'admin', a.passwordHash, a.createdAt || new Date().toISOString(), new Date().toISOString()]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving admins to Neon:', err.message);
      }
    }
    return true;
  },

  // Settings
  getSettings: () => cache.settings,
  saveSettings: async (settings) => {
    cache.settings = settings;
    writeJson('settings.json', settings);

    if (pool && isPostgresAvailable) {
      try {
        for (const [key, value] of Object.entries(settings)) {
          await pool.query(`
            INSERT INTO website_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
          `, [key, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving settings to Neon:', err.message);
      }
    }
    return true;
  },

  // Orders
  getOrders: () => cache.orders,
  saveOrders: async (orders) => {
    cache.orders = orders;
    writeJson('orders.json', orders);

    if (pool && isPostgresAvailable) {
      try {
        for (const o of orders) {
          await pool.query(`
            INSERT INTO orders (id, "orderDate", "customerName", "customerPhone", "deliveryAddress", items, subtotal, "deliveryCharge", total, "paymentMethod", "paymentStatus", "orderStatus", notes, "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              "customerName" = EXCLUDED."customerName",
              "customerPhone" = EXCLUDED."customerPhone",
              "deliveryAddress" = EXCLUDED."deliveryAddress",
              items = EXCLUDED.items,
              subtotal = EXCLUDED.subtotal,
              "deliveryCharge" = EXCLUDED."deliveryCharge",
              total = EXCLUDED.total,
              "paymentMethod" = EXCLUDED."paymentMethod",
              "paymentStatus" = EXCLUDED."paymentStatus",
              "orderStatus" = EXCLUDED."orderStatus",
              notes = EXCLUDED.notes
          `, [
            o.id, o.orderDate, o.customerName, o.customerPhone || o.phone || null,
            o.deliveryAddress || o.address || null, JSON.stringify(o.items || []),
            o.subtotal != null ? Number(o.subtotal) : 0,
            o.deliveryCharge != null ? Number(o.deliveryCharge) : 0,
            o.total != null ? Number(o.total) : 0,
            o.paymentMethod || 'Cash on Delivery',
            o.paymentStatus || 'Pending',
            o.orderStatus || 'Pending',
            o.notes || null,
            new Date().toISOString()
          ]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving orders to Neon:', err.message);
      }
    }
    return true;
  },

  // Inventory Logs
  getInventoryLogs: () => cache.inventoryLogs,
  addInventoryLog: async (log) => {
    const newLog = {
      id: `log-stk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    cache.inventoryLogs.unshift(newLog);
    writeJson('inventory_logs.json', cache.inventoryLogs);

    if (pool && isPostgresAvailable) {
      try {
        await pool.query(`
          INSERT INTO inventory_logs (id, "productId", "productName", change, reason, unit, "previousStock", "newStock", admin, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO NOTHING
        `, [
          newLog.id, newLog.productId, newLog.productName, newLog.change,
          newLog.reason, newLog.unit || 'packets', newLog.previousStock,
          newLog.newStock, newLog.admin || 'admin', newLog.timestamp
        ]);
      } catch (err) {
        console.error('[DATABASE] Error saving inventory log to Neon:', err.message);
      }
    }
    return newLog;
  },

  // Customers
  getCustomers: () => cache.customers,
  saveCustomers: async (customers) => {
    cache.customers = customers;
    writeJson('customers.json', customers);

    if (pool && isPostgresAvailable) {
      try {
        for (const c of customers) {
          await pool.query(`
            INSERT INTO customers (id, name, phone, address, "totalOrders", "totalSpent", "lastOrderDate", notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              address = EXCLUDED.address,
              "totalOrders" = EXCLUDED."totalOrders",
              "totalSpent" = EXCLUDED."totalSpent",
              "lastOrderDate" = EXCLUDED."lastOrderDate",
              notes = EXCLUDED.notes
          `, [c.id, c.name, c.phone, c.address || null, c.totalOrders || 0, c.totalSpent || 0, c.lastOrderDate || null, c.notes || null]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving customers to Neon:', err.message);
      }
    }
    return true;
  },

  // Coupons
  getCoupons: () => cache.coupons,
  saveCoupons: async (coupons) => {
    cache.coupons = coupons;
    writeJson('coupons.json', coupons);

    if (pool && isPostgresAvailable) {
      try {
        for (const cp of coupons) {
          await pool.query(`
            INSERT INTO coupons (id, code, description, "discountType", "discountValue", "minOrder", "maxDiscount", "usageLimit", "timesUsed", "expiresAt", "isActive")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
              code = EXCLUDED.code,
              description = EXCLUDED.description,
              "discountType" = EXCLUDED."discountType",
              "discountValue" = EXCLUDED."discountValue",
              "minOrder" = EXCLUDED."minOrder",
              "maxDiscount" = EXCLUDED."maxDiscount",
              "usageLimit" = EXCLUDED."usageLimit",
              "timesUsed" = EXCLUDED."timesUsed",
              "expiresAt" = EXCLUDED."expiresAt",
              "isActive" = EXCLUDED."isActive"
          `, [
            cp.id, cp.code, cp.description || null, cp.discountType,
            cp.discountValue, cp.minOrder || 0, cp.maxDiscount || null,
            cp.usageLimit || null, cp.timesUsed || 0, cp.expiresAt || null,
            cp.isActive !== false
          ]);
        }
      } catch (err) {
        console.error('[DATABASE] Error saving coupons to Neon:', err.message);
      }
    }
    return true;
  },

  deleteCouponFromDb: async (id) => {
    if (pool && isPostgresAvailable) {
      try {
        await pool.query('DELETE FROM coupons WHERE id = $1', [id]);
      } catch (err) {
        console.error('[DATABASE] Error deleting coupon from Neon:', err.message);
      }
    }
  },

  // Logs
  getLogs: () => cache.logs,
  addLog: async (action, details, admin = 'admin') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      admin,
      timestamp: new Date().toISOString()
    };
    cache.logs.unshift(newLog);
    if (cache.logs.length > 500) cache.logs.length = 500;
    writeJson('logs.json', cache.logs);

    if (pool && isPostgresAvailable) {
      try {
        await pool.query(`
          INSERT INTO activity_logs (id, action, details, admin, timestamp)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [newLog.id, newLog.action, newLog.details, newLog.admin, newLog.timestamp]);
      } catch (err) {
        console.error('[DATABASE] Error saving activity log to Neon:', err.message);
      }
    }
    return newLog;
  }
};

export default db;
