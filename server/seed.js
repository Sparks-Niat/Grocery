import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import { products } from '../src/data/products.js';
import { categories } from '../src/data/categories.js';
import { storeInfo } from '../src/data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

console.log('Read products count:', products.length);
console.log('Read categories count:', categories.length);

const fullProducts = products.map((p, idx) => ({
  ...p,
  stock: p.stock !== undefined ? p.stock : (p.inStock ? 25 : 0),
  lowStockThreshold: p.lowStockThreshold || 5,
  isActive: p.isActive !== undefined ? p.isActive : true,
  brand: p.brand || (
    p.name.includes('Britannia') ? 'Britannia' :
    p.name.includes('Cadbury') ? 'Cadbury' :
    p.name.includes('Rin') ? 'Rin' :
    p.name.includes('Mysore') ? 'Mysore Sandal' :
    p.name.includes('Tata') ? 'Tata' :
    p.name.includes('Dove') ? 'Dove' :
    p.name.includes('Sunsilk') ? 'Sunsilk' :
    p.name.includes('Clinic') ? 'Clinic Plus' :
    p.name.includes('Head & Shoulders') ? 'Head & Shoulders' :
    p.name.includes('Bru') ? 'Bru' :
    p.name.includes('Nescafe') ? 'Nescafe' :
    p.name.includes('Thums Up') ? 'Coca-Cola / Thums Up' :
    p.name.includes('Sprite') ? 'Coca-Cola / Sprite' :
    'General'
  ),
  createdAt: new Date().toISOString()
}));

fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(fullProducts, null, 2), 'utf8');
fs.writeFileSync(path.join(dataDir, 'categories.json'), JSON.stringify(categories, null, 2), 'utf8');

// Hash admin password from environment variable
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Joel@2007';
const adminEmail = process.env.ADMIN_EMAIL || 'joelramireddy@gmail.com';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(adminPassword, salt);

const adminUser = {
  id: 'admin-1',
  email: adminEmail,
  name: 'Joel Rami Reddy',
  role: 'owner',
  passwordHash: passwordHash,
  createdAt: new Date().toISOString()
};

fs.writeFileSync(path.join(dataDir, 'admin.json'), JSON.stringify([adminUser], null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify({
  ...storeInfo,
  minOrderValue: 200,
  deliveryCharge: 20,
  freeDeliveryThreshold: 500,
  enableOrders: true,
  currency: '₹'
}, null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify([
  {
    id: "ORD-1001",
    orderDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    customerName: "K. Venkateswara Rao",
    customerPhone: "+91 98480 12345",
    deliveryAddress: "Main Road, Kanchikacherla",
    items: [
      { id: "snk-bingo", name: "Bingo Mad Angles / Ridge", price: 10, quantity: 2, total: 20 },
      { id: "tea-3roses", name: "3 Roses Tea Powder", price: 75, quantity: 1, total: 75 },
      { id: "dal-kandi", name: "Kandi Pappu (Toor Dal)", price: 85, quantity: 2, total: 170 }
    ],
    subtotal: 265,
    deliveryCharge: 20,
    total: 285,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Collected on Delivery",
    orderStatus: "Completed",
    notes: "Regular customer"
  },
  {
    id: "ORD-1002",
    orderDate: new Date(Date.now() - 3600000 * 1).toISOString(),
    customerName: "S. Lakshmi",
    customerPhone: "+91 94401 67890",
    deliveryAddress: "Temple Road, Kanchikacherla",
    items: [
      { id: "bisc-goodday", name: "Britannia Good Day Biscuits", price: 10, quantity: 4, total: 40 },
      { id: "dairy-milk", name: "Milk (Fresh / Packet)", price: 34, quantity: 2, total: 68 },
      { id: "clean-vim", name: "Vim Soap (Dishwash Bar)", price: 10, quantity: 2, total: 20 }
    ],
    subtotal: 128,
    deliveryCharge: 20,
    total: 148,
    paymentMethod: "UPI / QR Code",
    paymentStatus: "Paid Online",
    orderStatus: "Ready for Delivery",
    notes: "Leave with security if not answering"
  }
], null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'inventory_logs.json'), JSON.stringify([
  {
    id: "log-stk-1",
    productId: "snk-bingo",
    productName: "Bingo Mad Angles / Ridge",
    adjustment: "+50",
    previousStock: 0,
    newStock: 50,
    reason: "Initial Store Opening Stock Count",
    admin: "joelramireddy@gmail.com",
    timestamp: new Date().toISOString()
  }
], null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'customers.json'), JSON.stringify([
  {
    id: "cust-1",
    name: "K. Venkateswara Rao",
    phone: "+91 98480 12345",
    address: "Main Road, Kanchikacherla",
    totalOrders: 1,
    lastOrderDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "Active"
  },
  {
    id: "cust-2",
    name: "S. Lakshmi",
    phone: "+91 94401 67890",
    address: "Temple Road, Kanchikacherla",
    totalOrders: 1,
    lastOrderDate: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "Active"
  }
], null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'coupons.json'), JSON.stringify([
  {
    id: 'coup-1',
    code: 'WELCOME50',
    discountType: 'flat',
    discountValue: 50,
    minOrderValue: 300,
    isActive: true,
    expiryDate: '2027-12-31'
  },
  {
    id: 'coup-2',
    code: 'FESTIVE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 500,
    isActive: true,
    expiryDate: '2027-12-31'
  }
], null, 2), 'utf8');

fs.writeFileSync(path.join(dataDir, 'logs.json'), JSON.stringify([
  {
    id: 'log-1',
    action: 'INITIALIZE_CATALOG',
    details: 'Seeded 91 official inventory products for Sri Manikanta Sai General Store',
    admin: 'joelramireddy@gmail.com',
    timestamp: new Date().toISOString()
  }
], null, 2), 'utf8');

console.log('Seeding finished successfully. Products count:', fullProducts.length);
