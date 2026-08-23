import db from './db.js';
import { categories } from '../src/data/categories.js';
import { products } from '../src/data/products.js';

async function seed() {
  console.log("Seeding categories...");
  for (const cat of categories) {
    try {
      await db.runAsync(
        "INSERT INTO categories (id, name, description, image, iconName) VALUES (?, ?, ?, ?, ?)",
        [cat.id, cat.name, cat.description, cat.image, cat.iconName]
      );
    } catch (e) {
      // ignore unique constraint errors if already seeded
    }
  }

  console.log("Seeding products...");
  for (const prod of products) {
    try {
      await db.runAsync(
        "INSERT INTO products (id, name, categoryId, image, packSize, price, inStock, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [prod.id, prod.name, prod.categoryId, prod.image, prod.packSize, prod.price, prod.inStock ? 1 : 0, 0]
      );
    } catch (e) {
      // ignore
    }
  }

  // Define some default settings
  const defaultSettings = {
    businessName: "Grocery Mart",
    contactEmail: "support@grocerymart.com",
    contactPhone: "+91 98765 43210",
    currency: "₹",
    deliveryCharge: "50",
    minOrderValue: "500",
    aboutText: "We are your trusted local grocery store, providing fresh and quality products every day.",
    address: "123 Grocery Market, Food Street, City",
    heroHeading: "Fresh Groceries Delivered Fast!",
    heroSubtitle: "Get farm-fresh produce and daily essentials delivered to your doorstep within hours."
  };

  console.log("Seeding settings...");
  for (const [key, value] of Object.entries(defaultSettings)) {
    try {
      await db.runAsync(
        "INSERT INTO website_settings (key, value) VALUES (?, ?)",
        [key, value]
      );
    } catch (e) {
      // ignore
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

// Give DB time to initialize tables first
setTimeout(() => {
  seed();
}, 1000);
