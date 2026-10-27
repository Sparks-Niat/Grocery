import db from './db.js';
import { categories } from '../src/data/categories.js';
import { products } from '../src/data/products.js';

async function seed() {
  console.log("Seeding categories into PostgreSQL...");
  for (const cat of categories) {
    try {
      await db.runAsync(
        'INSERT INTO categories (id, name, description, image, "iconName") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [cat.id, cat.name, cat.description, cat.image, cat.iconName]
      );
    } catch (e) {
      console.error("Error seeding category:", e.message);
    }
  }

  console.log("Seeding products into PostgreSQL...");
  for (const prod of products) {
    try {
      await db.runAsync(
        'INSERT INTO products (id, name, "categoryId", image, "packSize", price, "inStock", "featured", description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [prod.id, prod.name, prod.categoryId, prod.image, prod.packSize, prod.price, Boolean(prod.inStock), Boolean(prod.featured), prod.description || null]
      );
    } catch (e) {
      console.error("Error seeding product:", e.message);
    }
  }

  // Define some default settings
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

  console.log("Seeding settings into PostgreSQL...");
  for (const [key, value] of Object.entries(defaultSettings)) {
    try {
      await db.runAsync(
        "INSERT INTO website_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
        [key, value]
      );
    } catch (e) {
      console.error("Error seeding setting:", e.message);
    }
  }

  console.log("PostgreSQL seeding complete!");
  process.exit(0);
}

// Allow connection & tables to initialize
setTimeout(() => {
  seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}, 1500);
