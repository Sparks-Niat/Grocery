import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from './db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-replace-in-production';

app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup static file serving for uploads
app.use('/uploads', express.static(uploadDir));

// Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const admin = await db.getAsync("SELECT * FROM admins WHERE email = $1", [email]);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, name: admin.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- IMAGE UPLOAD API ---
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// --- CATEGORIES API ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.allAsync("SELECT * FROM categories ORDER BY name ASC");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  const { id, name, description, image, iconName } = req.body;
  try {
    await db.runAsync(
      'INSERT INTO categories (id, name, description, image, "iconName") VALUES ($1, $2, $3, $4, $5)',
      [id, name, description, image, iconName]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  const { name, description, image, iconName } = req.body;
  try {
    await db.runAsync(
      'UPDATE categories SET name = $1, description = $2, image = $3, "iconName" = $4 WHERE id = $5',
      [name, description, image, iconName, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    await db.runAsync("DELETE FROM categories WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTS API ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.allAsync("SELECT * FROM products ORDER BY name ASC");
    const formattedProducts = products.map(p => ({
      ...p,
      inStock: Boolean(p.inStock),
      featured: Boolean(p.featured)
    }));
    res.json(formattedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { id, name, categoryId, image, packSize, price, inStock, featured, description } = req.body;
  try {
    await db.runAsync(
      'INSERT INTO products (id, name, "categoryId", image, "packSize", price, "inStock", "featured", description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, name, categoryId, image, packSize, price, Boolean(inStock), Boolean(featured), description]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { name, categoryId, image, packSize, price, inStock, featured, description } = req.body;
  try {
    await db.runAsync(
      'UPDATE products SET name = $1, "categoryId" = $2, image = $3, "packSize" = $4, price = $5, "inStock" = $6, "featured" = $7, description = $8 WHERE id = $9',
      [name, categoryId, image, packSize, price, Boolean(inStock), Boolean(featured), description, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await db.runAsync("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS API ---
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.allAsync("SELECT * FROM website_settings");
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const updates = req.body; // object with key-value pairs
  try {
    for (const [key, value] of Object.entries(updates)) {
      await db.runAsync(
        "INSERT INTO website_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [key, value]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS API ---
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.allAsync("SELECT * FROM orders ORDER BY id DESC");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerName, phone, email, address, totalAmount, items } = req.body;
  try {
    const orderRes = await db.runAsync(
      'INSERT INTO orders ("customerName", phone, email, address, "totalAmount", status, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [customerName, phone, email, address, totalAmount, 'Pending', new Date().toISOString()]
    );
    const orderId = orderRes.lastID || orderRes.rows[0]?.id;
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await db.runAsync(
          'INSERT INTO order_items ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.quantity, item.price]
        );
      }
    }
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    await db.runAsync("UPDATE orders SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DYNAMIC CMS CRUD API ---
const cmsTables = ['navigation_items', 'hero_value_tags', 'commitments', 'gallery_items', 'footer_links', 'social_links'];

cmsTables.forEach(table => {
  // GET all
  app.get(`/api/${table}`, async (req, res) => {
    try {
      const rows = await db.allAsync(`SELECT * FROM ${table} ORDER BY "displayOrder" ASC`);
      res.json(rows.map(r => ({ ...r, isActive: Boolean(r.isActive) })));
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // POST (Create)
  app.post(`/api/${table}`, authenticateToken, async (req, res) => {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body).map(v => typeof v === 'boolean' ? Boolean(v) : v);
    const quotedCols = keys.map(k => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    try {
      await db.runAsync(`INSERT INTO ${table} (${quotedCols}) VALUES (${placeholders})`, values);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // PUT (Update)
  app.put(`/api/${table}/:id`, authenticateToken, async (req, res) => {
    const keys = Object.keys(req.body).filter(k => k !== 'id');
    const values = keys.map(k => typeof req.body[k] === 'boolean' ? Boolean(req.body[k]) : req.body[k]);
    const setString = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const idParamIndex = keys.length + 1;
    
    try {
      await db.runAsync(`UPDATE ${table} SET ${setString} WHERE id = $${idParamIndex}`, [...values, req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  // DELETE
  app.delete(`/api/${table}/:id`, authenticateToken, async (req, res) => {
    try {
      await db.runAsync(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
});

// --- PUBLIC DATA AGGREGATOR ---
app.get('/api/public-data', async (req, res) => {
  try {
    const data = {};
    for (const table of cmsTables) {
      const rows = await db.allAsync(`SELECT * FROM ${table} WHERE "isActive" = true ORDER BY "displayOrder" ASC`);
      data[table] = rows.map(r => ({ ...r, isActive: Boolean(r.isActive) }));
    }
    
    const settings = await db.allAsync("SELECT * FROM website_settings");
    data.settings = {};
    settings.forEach(s => data.settings[s.key] = s.value);
    
    const categories = await db.allAsync("SELECT * FROM categories ORDER BY name ASC");
    data.categories = categories;

    const products = await db.allAsync("SELECT * FROM products ORDER BY name ASC");
    data.products = products.map(p => ({
      ...p,
      inStock: Boolean(p.inStock),
      featured: Boolean(p.featured)
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (PostgreSQL/Neon)`);
});
