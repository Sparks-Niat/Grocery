import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

import { db } from './db.js';
import { generateToken, authenticateToken, verifyAdminLogin } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Securely initialize or synchronize admin from environment variables safely
function ensureInitialAdmin() {
  try {
    const admins = db.getAdmins();
    const envEmail = (process.env.ADMIN_EMAIL || 'joelramireddy@gmail.com').trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD;

    // Check if an admin account already exists
    if (!admins || admins.length === 0) {
      if (envPassword) {
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(envPassword, salt);
        const newAdmin = {
          id: 'admin-1',
          email: envEmail,
          name: 'Joel Rami Reddy',
          role: 'owner',
          passwordHash,
          createdAt: new Date().toISOString()
        };
        db.saveAdmins([newAdmin]);
        console.log(`[AUTH] Administrator account initialized for ${envEmail}.`);
      } else {
        console.warn('[AUTH WARNING] No admin accounts exist and ADMIN_PASSWORD is not set in environment.');
      }
    } else {
      if (envPassword) {
        let admin = admins.find(a => a.email.toLowerCase() === envEmail);
        if (!admin && admins.length > 0) {
          admin = admins[0];
          admin.email = envEmail;
        }

        if (admin) {
          const matches = bcrypt.compareSync(envPassword, admin.passwordHash);
          if (!matches) {
            const salt = bcrypt.genSaltSync(10);
            admin.passwordHash = bcrypt.hashSync(envPassword, salt);
            admin.updatedAt = new Date().toISOString();
            db.saveAdmins(admins);
            console.log(`[AUTH] Administrator credentials synchronized securely.`);
          }
        }
      }
      console.log(`[AUTH] Existing administrator accounts verified (${admins.length} account(s)).`);
    }
  } catch (err) {
    console.error('[AUTH ERROR] Error initializing administrator account:', err);
  }
}

ensureInitialAdmin();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mime = file.mimetype;
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, and SVG image files are allowed.'));
    }
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Handle admin login (supports both /api/auth/login and /api/admin/login)
const handleAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await verifyAdminLogin(email, password);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const token = generateToken(admin);
    db.addLog('ADMIN_LOGIN', `Admin ${admin.email} logged in successfully`, admin.email);

    return res.json({
      success: true,
      token,
      admin
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

app.post('/api/auth/login', handleAdminLogin);
app.post('/api/admin/login', handleAdminLogin);

// Handle session verification (supports both /api/auth/verify and /api/admin/verify)
const handleAdminVerify = (req, res) => {
  return res.json({
    valid: true,
    user: req.user
  });
};

app.get('/api/auth/verify', authenticateToken, handleAdminVerify);
app.get('/api/admin/verify', authenticateToken, handleAdminVerify);

// POST /api/auth/change-password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admins = db.getAdmins();
    const adminIndex = admins.findIndex(a => a.id === req.user.id);
    if (adminIndex === -1) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, admins[adminIndex].passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const salt = bcrypt.genSaltSync(10);
    admins[adminIndex].passwordHash = bcrypt.hashSync(newPassword, salt);
    admins[adminIndex].updatedAt = new Date().toISOString();
    db.saveAdmins(admins);

    db.addLog('PASSWORD_CHANGED', `Admin ${req.user.email} updated account password`, req.user.email);
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ==========================================
// DASHBOARD STATS
// ==========================================

// GET /api/stats
app.get('/api/stats', authenticateToken, (req, res) => {
  try {
    const products = db.getProducts();
    const categories = db.getCategories();
    const orders = db.getOrders();

    const totalProducts = products.length;
    const inStockCount = products.filter(p => p.inStock && (p.stock === undefined || p.stock > 0)).length;
    const outOfStockCount = products.filter(p => !p.inStock || p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
    const unverifiedPriceCount = products.filter(p => p.priceNote === 'provisional').length;
    const missingImageCount = products.filter(p => !p.image || p.image === '/images/grocery.jpg').length;

    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const inProgressOrders = orders.filter(o => ['Confirmed', 'Preparing', 'Ready for Delivery', 'Out for Delivery'].includes(o.orderStatus)).length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Completed').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    // Real confirmed revenue
    const totalRevenue = orders
      .filter(o => o.orderStatus === 'Completed' || o.paymentStatus === 'Paid Online')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return res.json({
      totalProducts,
      inStockCount,
      outOfStockCount,
      lowStockCount,
      unverifiedPriceCount,
      missingImageCount,
      totalCategories: categories.length,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      totalOrders: orders.length,
      totalRevenue
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to calculate dashboard statistics.' });
  }
});

// ==========================================
// PRODUCT MANAGEMENT (91 ITEMS)
// ==========================================

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    let products = db.getProducts();
    const { category, search, stockStatus, priceStatus, sort } = req.query;

    if (category && category !== 'all') {
      products = products.filter(p => p.categoryId === category);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        p.packSize.toLowerCase().includes(q)
      );
    }

    if (stockStatus) {
      if (stockStatus === 'instock') {
        products = products.filter(p => p.inStock && (p.stock === undefined || p.stock > 0));
      } else if (stockStatus === 'outofstock') {
        products = products.filter(p => !p.inStock || p.stock === 0);
      } else if (stockStatus === 'lowstock') {
        products = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5));
      }
    }

    if (priceStatus) {
      if (priceStatus === 'verified') {
        products = products.filter(p => p.priceNote === 'verified');
      } else if (priceStatus === 'provisional') {
        products = products.filter(p => p.priceNote === 'provisional');
      }
    }

    if (sort) {
      if (sort === 'name-asc') products.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'name-desc') products.sort((a, b) => b.name.localeCompare(a.name));
      if (sort === 'price-asc') products.sort((a, b) => (a.price || 0) - (b.price || 0));
      if (sort === 'price-desc') products.sort((a, b) => (b.price || 0) - (a.price || 0));
      if (sort === 'stock-asc') products.sort((a, b) => (a.stock || 0) - (b.stock || 0));
      if (sort === 'stock-desc') products.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    }

    return res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  return res.json(product);
});

// POST /api/products
app.post('/api/products', authenticateToken, (req, res) => {
  try {
    const { name, categoryId, subcategory, brand, packSize, price, priceNote, variants, inStock, stock, lowStockThreshold, image, description } = req.body;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({ error: 'Product name, category, and price are required.' });
    }

    const products = db.getProducts();
    const id = req.body.id || `prod-${Date.now()}`;

    // Check duplicate ID
    if (products.some(p => p.id === id)) {
      return res.status(400).json({ error: 'Product with this ID already exists.' });
    }

    const newProduct = {
      id,
      name: name.trim(),
      categoryId,
      subcategory: subcategory || '',
      brand: brand || 'General',
      packSize: packSize || 'Per Pack',
      price: Number(price),
      priceNote: priceNote || 'verified',
      variants: Array.isArray(variants) ? variants : [],
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      stock: stock !== undefined ? Number(stock) : 25,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      image: image || '/images/grocery.jpg',
      description: description || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    db.saveProducts(products);
    db.addLog('PRODUCT_CREATED', `Added new product: ${newProduct.name} (₹${newProduct.price})`, req.user.email);

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const oldProduct = products[index];
    const updated = {
      ...oldProduct,
      ...req.body,
      id: oldProduct.id, // prevent id tampering
      updatedAt: new Date().toISOString()
    };

    if (req.body.price !== undefined) updated.price = Number(req.body.price);
    if (req.body.stock !== undefined) {
      updated.stock = Number(req.body.stock);
      updated.inStock = updated.stock > 0;
    }

    products[index] = updated;
    db.saveProducts(products);

    // If price changed, log specifically
    if (oldProduct.price !== updated.price) {
      db.addLog('PRICE_UPDATED', `Price changed for "${updated.name}" from ₹${oldProduct.price} to ₹${updated.price}`, req.user.email);
    } else {
      db.addLog('PRODUCT_UPDATED', `Updated product details: "${updated.name}"`, req.user.email);
    }

    return res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const deleted = products.splice(index, 1)[0];
    db.saveProducts(products);
    db.addLog('PRODUCT_DELETED', `Removed product: "${deleted.name}" (ID: ${deleted.id})`, req.user.email);

    return res.json({ success: true, message: `Product "${deleted.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// POST /api/products/bulk
app.post('/api/products/bulk', authenticateToken, (req, res) => {
  try {
    const { action, productIds, payload } = req.body;
    if (!action || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Action and productIds array are required.' });
    }

    const products = db.getProducts();
    let updatedCount = 0;

    products.forEach(p => {
      if (productIds.includes(p.id)) {
        if (action === 'setInStock') {
          p.inStock = Boolean(payload.inStock);
          if (p.inStock && p.stock === 0) p.stock = 10;
          updatedCount++;
        } else if (action === 'setCategory') {
          p.categoryId = payload.categoryId;
          updatedCount++;
        } else if (action === 'setPriceVerified') {
          p.priceNote = 'verified';
          updatedCount++;
        } else if (action === 'setStock') {
          p.stock = Number(payload.stock);
          p.inStock = p.stock > 0;
          updatedCount++;
        }
      }
    });

    db.saveProducts(products);
    db.addLog('BULK_PRODUCT_UPDATE', `Bulk updated ${updatedCount} products with action: ${action}`, req.user.email);

    return res.json({ success: true, updatedCount });
  } catch (err) {
    console.error('Bulk update error:', err);
    return res.status(500).json({ error: 'Failed to perform bulk update.' });
  }
});

// ==========================================
// INVENTORY & STOCK MANAGEMENT
// ==========================================

// POST /api/inventory/adjust
app.post('/api/inventory/adjust', authenticateToken, (req, res) => {
  try {
    const { productId, change, reason, unit } = req.body;
    if (!productId || change === undefined) {
      return res.status(400).json({ error: 'Product ID and change amount are required.' });
    }

    const products = db.getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const prevStock = Number(product.stock) || 0;
    const newStock = Math.max(0, prevStock + Number(change));

    product.stock = newStock;
    product.inStock = newStock > 0;
    db.saveProducts(products);

    const logEntry = db.addInventoryLog({
      productId,
      productName: product.name,
      adjustment: Number(change) >= 0 ? `+${change}` : `${change}`,
      previousStock: prevStock,
      newStock,
      reason: reason || 'Manual adjustment from admin panel',
      unit: unit || product.packSize,
      admin: req.user.email
    });

    db.addLog('STOCK_ADJUSTED', `Adjusted stock for "${product.name}": ${prevStock} -> ${newStock} (${reason || 'Adjustment'})`, req.user.email);

    return res.json({ success: true, product, log: logEntry });
  } catch (err) {
    console.error('Stock adjustment error:', err);
    return res.status(500).json({ error: 'Failed to adjust stock.' });
  }
});

// GET /api/inventory/logs
app.get('/api/inventory/logs', authenticateToken, (req, res) => {
  const logs = db.getInventoryLogs();
  return res.json(logs);
});

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

// GET /api/categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    const products = db.getProducts();

    // Attach product count to each category
    const withCounts = categories.map(cat => ({
      ...cat,
      productCount: products.filter(p => p.categoryId === cat.id).length
    }));

    return res.json(withCounts);
  } catch (err) {
    console.error('Get categories error:', err);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST /api/categories
app.post('/api/categories', authenticateToken, (req, res) => {
  try {
    const { id, name, description, image, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    const categories = db.getCategories();
    const catId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (categories.some(c => c.id === catId)) {
      return res.status(400).json({ error: 'Category with this ID already exists.' });
    }

    const newCategory = {
      id: catId,
      name: name.trim(),
      description: description || '',
      image: image || '/images/grocery.jpg',
      icon: icon || 'ShoppingBag',
      enabled: true
    };

    categories.push(newCategory);
    db.saveCategories(categories);
    db.addLog('CATEGORY_CREATED', `Added category: "${newCategory.name}"`, req.user.email);

    return res.status(201).json(newCategory);
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PUT /api/categories/:id
app.put('/api/categories/:id', authenticateToken, (req, res) => {
  try {
    const categories = db.getCategories();
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found.' });

    const updated = {
      ...categories[index],
      ...req.body,
      id: categories[index].id
    };

    categories[index] = updated;
    db.saveCategories(categories);
    db.addLog('CATEGORY_UPDATED', `Updated category: "${updated.name}"`, req.user.email);

    return res.json(updated);
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id
app.delete('/api/categories/:id', authenticateToken, (req, res) => {
  try {
    const categories = db.getCategories();
    const index = categories.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Category not found.' });

    // Check if any products reference this category
    const products = db.getProducts();
    const attachedCount = products.filter(p => p.categoryId === req.params.id).length;
    if (attachedCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category because ${attachedCount} products are assigned to it. Reassign or remove them first.`
      });
    }

    const deleted = categories.splice(index, 1)[0];
    db.saveCategories(categories);
    db.addLog('CATEGORY_DELETED', `Deleted category: "${deleted.name}"`, req.user.email);

    return res.json({ success: true, message: `Category "${deleted.name}" deleted successfully.` });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

// ==========================================
// ORDER MANAGEMENT
// ==========================================

// GET /api/orders
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    let orders = db.getOrders();
    const { status, search } = req.query;

    if (status && status !== 'all') {
      orders = orders.filter(o => o.orderStatus === status);
    }

    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    }

    return res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const orders = db.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  return res.json(order);
});

// POST /api/orders (Customer checkout or manual order)
app.post('/api/orders', (req, res) => {
  try {
    const { customerName, customerPhone, deliveryAddress, items, paymentMethod, notes } = req.body;
    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name, phone number, and items are required.' });
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    const settings = db.getSettings();
    const deliveryCharge = subtotal >= (settings.freeDeliveryThreshold || 500) ? 0 : (settings.deliveryCharge || 20);
    const total = subtotal + deliveryCharge;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress || 'Store Pickup',
      items,
      subtotal,
      deliveryCharge,
      total,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'UPI / QR Code' ? 'Pending Verification' : 'Pending',
      orderStatus: 'Pending',
      notes: notes || ''
    };

    const orders = db.getOrders();
    orders.unshift(newOrder);
    db.saveOrders(orders);

    // Update or add customer record
    const customers = db.getCustomers();
    const existingCust = customers.find(c => c.phone === customerPhone.trim());
    if (existingCust) {
      existingCust.totalOrders = (existingCust.totalOrders || 1) + 1;
      existingCust.lastOrderDate = newOrder.orderDate;
    } else {
      customers.push({
        id: `cust-${Date.now()}`,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: deliveryAddress || '',
        totalOrders: 1,
        lastOrderDate: newOrder.orderDate,
        status: 'Active'
      });
    }
    db.saveCustomers(customers);

    db.addLog('ORDER_PLACED', `New order received ${newOrder.id} from ${customerName} (₹${total})`, 'system');

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ error: 'Failed to create order.' });
  }
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  try {
    const { status, paymentStatus, cancelReason } = req.body;
    const orders = db.getOrders();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const prevStatus = order.orderStatus;
    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (cancelReason) order.cancelReason = cancelReason;
    order.updatedAt = new Date().toISOString();

    db.saveOrders(orders);
    db.addLog('ORDER_STATUS_UPDATED', `Order ${order.id} status changed: ${prevStatus} -> ${order.orderStatus}`, req.user.email);

    return res.json(order);
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

// GET /api/customers
app.get('/api/customers', authenticateToken, (req, res) => {
  try {
    let customers = db.getCustomers();
    const { search } = req.query;
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }
    return res.json(customers);
  } catch (err) {
    console.error('Get customers error:', err);
    return res.status(500).json({ error: 'Failed to fetch customers.' });
  }
});

// ==========================================
// OFFERS & COUPONS
// ==========================================

// GET /api/coupons
app.get('/api/coupons', (req, res) => {
  const coupons = db.getCoupons();
  return res.json(coupons);
});

// POST /api/coupons
app.post('/api/coupons', authenticateToken, (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, expiryDate, isActive } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Coupon code and discount value are required.' });
    }

    const coupons = db.getCoupons();
    const cleanCode = code.trim().toUpperCase();

    if (coupons.some(c => c.code === cleanCode)) {
      return res.status(400).json({ error: 'Coupon code already exists.' });
    }

    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: cleanCode,
      discountType: discountType || 'flat',
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      expiryDate: expiryDate || '2027-12-31',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString()
    };

    coupons.push(newCoupon);
    db.saveCoupons(coupons);
    db.addLog('COUPON_CREATED', `Created coupon: "${newCoupon.code}" (${newCoupon.discountValue})`, req.user.email);

    return res.status(201).json(newCoupon);
  } catch (err) {
    console.error('Create coupon error:', err);
    return res.status(500).json({ error: 'Failed to create coupon.' });
  }
});

// DELETE /api/coupons/:id
app.delete('/api/coupons/:id', authenticateToken, (req, res) => {
  try {
    const coupons = db.getCoupons();
    const index = coupons.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Coupon not found.' });

    const deleted = coupons.splice(index, 1)[0];
    db.saveCoupons(coupons);
    db.addLog('COUPON_DELETED', `Deleted coupon: "${deleted.code}"`, req.user.email);

    return res.json({ success: true, message: `Coupon "${deleted.code}" deleted.` });
  } catch (err) {
    console.error('Delete coupon error:', err);
    return res.status(500).json({ error: 'Failed to delete coupon.' });
  }
});

// ==========================================
// STORE SETTINGS
// ==========================================

// GET /api/settings
app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();
  return res.json(settings);
});

// PUT /api/settings
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = db.getSettings();
    const updated = {
      ...settings,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    db.saveSettings(updated);
    db.addLog('SETTINGS_UPDATED', `Updated store configuration and contact details`, req.user.email);

    return res.json(updated);
  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ error: 'Failed to update store settings.' });
  }
});

// ==========================================
// ADMIN ACTIVITY LOGS
// ==========================================

// GET /api/logs
app.get('/api/logs', authenticateToken, (req, res) => {
  const logs = db.getLogs();
  return res.json(logs);
});

// ==========================================
// IMAGE UPLOAD
// ==========================================

// POST /api/upload
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    db.addLog('IMAGE_UPLOADED', `Uploaded image: ${req.file.filename}`, req.user.email);

    return res.json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload image.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'Sri Manikanta Sai General Store API', timestamp: new Date().toISOString() });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Sri Manikanta Sai General Store — Backend API`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  Status: Running and Ready for Admin Operations`);
  console.log(`====================================================`);
});
