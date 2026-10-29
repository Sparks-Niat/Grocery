import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from './db.js';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary.js';
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

// --- Production CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(u => {
    const trimmed = u.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach(u => {
    const trimmed = u.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Server-to-server, mobile, curl
  const normalized = origin.replace(/\/+$/, '');
  if (allowedOrigins.includes(normalized)) return true;

  // Automatically allow all Vercel production and preview deployment URLs
  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app')) return true;
  } catch (_) {}

  // Allow localhost origins in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { hostname } = new URL(origin);
      if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    } catch (_) {}
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' is not authorized.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// --- Health Check & Root Diagnostics ---
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Grocery Store Backend API',
    database: 'Neon PostgreSQL',
    storage: 'Cloudinary',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 as alive');
    const isDbAlive = result?.rows?.[0]?.alive === 1;
    res.json({
      status: 'healthy',
      database: isDbAlive ? 'connected' : 'error',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Backward-compatibility: Create uploads directory and serve static files if local files exist
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer memory storage configuration with validation (5MB limit & image MIME types)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed formats: JPEG, PNG, WEBP, GIF, and AVIF.'));
    }
  }
});

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

// --- CLOUDINARY IMAGE UPLOAD & DELETE API ---
app.post('/api/upload', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds maximum allowed limit of 5MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
      const folderParam = req.body.folder ? `grocery-mart/${req.body.folder}` : 'grocery-mart';
      const result = await uploadToCloudinary(req.file.buffer, { folder: folderParam });
      
      res.json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      });
    } catch (uploadErr) {
      console.error('Cloudinary upload failure:', uploadErr);
      res.status(500).json({ error: uploadErr.message || 'Cloudinary upload failed.' });
    }
  });
});

app.delete('/api/upload', authenticateToken, async (req, res) => {
  const targetId = req.body.public_id || req.body.publicId || req.query.public_id || req.query.publicId;

  if (!targetId || typeof targetId !== 'string') {
    return res.status(400).json({ error: 'Valid public_id is required for deletion.' });
  }

  // Security guard: Only allow deletion within the grocery-mart namespace
  if (!targetId.startsWith('grocery-mart')) {
    return res.status(400).json({ error: 'Deletion restricted to grocery-mart assets only.' });
  }

  try {
    const result = await deleteFromCloudinary(targetId);
    res.json({ success: true, result });
  } catch (deleteErr) {
    console.error('Cloudinary deletion failure:', deleteErr);
    res.status(500).json({ error: deleteErr.message || 'Failed to delete asset from Cloudinary.' });
  }
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
  const { id, name, description, image, iconName, publicId } = req.body;
  try {
    await db.runAsync(
      'INSERT INTO categories (id, name, description, image, "iconName", "publicId") VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, description, image, iconName, publicId || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  const { name, description, image, iconName, publicId } = req.body;
  try {
    if (publicId) {
      const existing = await db.getAsync('SELECT "publicId" FROM categories WHERE id = $1', [req.params.id]);
      if (existing?.publicId && existing.publicId !== publicId && existing.publicId.startsWith('grocery-mart/')) {
        try { await deleteFromCloudinary(existing.publicId); } catch (_) {}
      }
    }

    await db.runAsync(
      'UPDATE categories SET name = $1, description = $2, image = $3, "iconName" = $4, "publicId" = COALESCE($5, "publicId") WHERE id = $6',
      [name, description, image, iconName, publicId || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await db.getAsync('SELECT "publicId" FROM categories WHERE id = $1', [req.params.id]);
    if (existing?.publicId && existing.publicId.startsWith('grocery-mart/')) {
      try { await deleteFromCloudinary(existing.publicId); } catch (_) {}
    }
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
  const { id, name, categoryId, image, packSize, price, inStock, featured, description, publicId } = req.body;
  try {
    await db.runAsync(
      'INSERT INTO products (id, name, "categoryId", image, "packSize", price, "inStock", "featured", description, "publicId") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [id, name, categoryId, image, packSize, price, Boolean(inStock), Boolean(featured), description, publicId || null]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { name, categoryId, image, packSize, price, inStock, featured, description, publicId } = req.body;
  try {
    if (publicId) {
      const existing = await db.getAsync('SELECT "publicId" FROM products WHERE id = $1', [req.params.id]);
      if (existing?.publicId && existing.publicId !== publicId && existing.publicId.startsWith('grocery-mart/')) {
        try { await deleteFromCloudinary(existing.publicId); } catch (_) {}
      }
    }

    await db.runAsync(
      'UPDATE products SET name = $1, "categoryId" = $2, image = $3, "packSize" = $4, price = $5, "inStock" = $6, "featured" = $7, description = $8, "publicId" = COALESCE($9, "publicId") WHERE id = $10',
      [name, categoryId, image, packSize, price, Boolean(inStock), Boolean(featured), description, publicId || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await db.getAsync('SELECT "publicId" FROM products WHERE id = $1', [req.params.id]);
    if (existing?.publicId && existing.publicId.startsWith('grocery-mart/')) {
      try { await deleteFromCloudinary(existing.publicId); } catch (_) {}
    }
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
      if (table === 'gallery_items') {
        const existing = await db.getAsync(`SELECT "publicId" FROM gallery_items WHERE id = $1`, [req.params.id]);
        if (existing?.publicId && existing.publicId.startsWith('grocery-mart/')) {
          try { await deleteFromCloudinary(existing.publicId); } catch (_) {}
        }
      }
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
      try {
        const rows = await db.allAsync(`SELECT * FROM ${table} WHERE "isActive" = true ORDER BY "displayOrder" ASC`);
        data[table] = rows.map(r => ({ ...r, isActive: Boolean(r.isActive) }));
      } catch (cmsErr) {
        console.warn(`Notice: query for CMS table ${table} failed:`, cmsErr.message);
        data[table] = [];
      }
    }
    
    try {
      const settings = await db.allAsync("SELECT * FROM website_settings");
      data.settings = {};
      settings.forEach(s => data.settings[s.key] = s.value);
    } catch (setErr) {
      console.warn("Notice: query for website_settings failed:", setErr.message);
      data.settings = {};
    }
    
    try {
      const categories = await db.allAsync("SELECT * FROM categories ORDER BY name ASC");
      data.categories = categories;
    } catch (catErr) {
      console.error("Error fetching categories for public-data:", catErr.message);
      data.categories = [];
    }

    try {
      const products = await db.allAsync("SELECT * FROM products ORDER BY name ASC");
      data.products = products.map(p => ({
        ...p,
        inStock: Boolean(p.inStock),
        featured: Boolean(p.featured)
      }));
    } catch (prodErr) {
      console.error("Error fetching products for public-data:", prodErr.message);
      data.products = [];
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (PostgreSQL/Neon + Cloudinary)`);
});
