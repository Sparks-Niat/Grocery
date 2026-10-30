import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

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
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJson(filename, data) {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
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
    console.error('Error syncing products to src/data/products.js:', err);
  }
}

export const db = {
  getProducts: () => readJson('products.json', []),
  saveProducts: (products) => {
    const ok = writeJson('products.json', products);
    if (ok) syncProductsToSrc(products);
    return ok;
  },

  getCategories: () => readJson('categories.json', []),
  saveCategories: (categories) => writeJson('categories.json', categories),

  getAdmins: () => readJson('admin.json', []),
  saveAdmins: (admins) => writeJson('admin.json', admins),

  getSettings: () => readJson('settings.json', {}),
  saveSettings: (settings) => writeJson('settings.json', settings),

  getOrders: () => readJson('orders.json', []),
  saveOrders: (orders) => writeJson('orders.json', orders),

  getInventoryLogs: () => readJson('inventory_logs.json', []),
  addInventoryLog: (log) => {
    const logs = readJson('inventory_logs.json', []);
    const newLog = {
      id: `log-stk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    logs.unshift(newLog);
    writeJson('inventory_logs.json', logs);
    return newLog;
  },

  getCustomers: () => readJson('customers.json', []),
  saveCustomers: (customers) => writeJson('customers.json', customers),

  getCoupons: () => readJson('coupons.json', []),
  saveCoupons: (coupons) => writeJson('coupons.json', coupons),

  getLogs: () => readJson('logs.json', []),
  addLog: (action, details, admin = 'admin') => {
    const logs = readJson('logs.json', []);
    const newLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      admin,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep last 500 logs
    if (logs.length > 500) logs.length = 500;
    writeJson('logs.json', logs);
    return newLog;
  }
};
