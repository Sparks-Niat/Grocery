import db from './db.js';

export const newGroceryItems = [
  // --- 1. Snacks (8 items) ---
  {
    id: "snack-bingo-10",
    name: "Bingo",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "10",
    price: 10,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-lays-5",
    name: "Lays",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-soyasticks",
    name: "Soya sticks",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-moongdal",
    name: "Moong dal",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-batani-packets",
    name: "Batani packets",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-hyderabad-biryani",
    name: "Hyderabad biryani",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-papads",
    name: "Papads",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },
  {
    id: "snack-masala-palli",
    name: "Masala palli",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Snacks"
  },

  // --- 2. Chocolates (9 items) ---
  {
    id: "choc-dairymilk-10",
    name: "Dairy Milk",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "10",
    price: 10,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-dairymilk-5",
    name: "Dairy Milk",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-5star-5",
    name: "5 Star",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-5star-10",
    name: "5 Star",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "10",
    price: 10,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-munch-5",
    name: "Munch",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-ilachi",
    name: "Ilachi chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-coconut",
    name: "Coconut chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-milk",
    name: "Milk chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-anjeera",
    name: "Anjeera chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-coffee",
    name: "Coffee chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },
  {
    id: "choc-mango",
    name: "Mango chocolate",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Chocolates"
  },

  // --- 3. Biscuits (6 items) ---
  {
    id: "bisc-goodday-5",
    name: "Good Day biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-goodday-10",
    name: "Good Day biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "10",
    price: 10,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-momsmagic",
    name: "Moms Magic biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-tiger-3",
    name: "Tiger biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "3",
    price: 3,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-mariegold-5",
    name: "Marie Gold biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "5",
    price: 5,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-mariegold-10",
    name: "Marie Gold biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: "10",
    price: 10,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-bourbon",
    name: "Bourbon biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Biscuits"
  },
  {
    id: "bisc-oreo",
    name: "Oreo biscuits",
    categoryId: "snacks",
    image: "/images/snacks.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Biscuits"
  },

  // --- 4. Shampoos (6 items) ---
  {
    id: "shamp-clinicplus",
    name: "Clinic Plus shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },
  {
    id: "shamp-meera",
    name: "Meera shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },
  {
    id: "shamp-chik",
    name: "Chik shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },
  {
    id: "shamp-sunsilk",
    name: "Sunsilk shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },
  {
    id: "shamp-dove",
    name: "Dove shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },
  {
    id: "shamp-headshoulder",
    name: "Head & Shoulder shampoo",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Shampoos"
  },

  // --- 5. Body Soaps (3 items) ---
  {
    id: "soap-mysoresandal",
    name: "Mysore Sandal soap",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Body Soaps"
  },
  {
    id: "soap-santoor",
    name: "Santoor soap",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Body Soaps"
  },
  {
    id: "soap-lifebuoy",
    name: "Lifebuoy soap",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Body Soaps"
  },

  // --- 6. Cloth & Dish Soaps (8 items) ---
  {
    id: "soap-xxxl",
    name: "XXXL cloth soap",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "soap-rin-cloth",
    name: "Rin cloth soap",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "soap-rinsurfexcel-cloth",
    name: "Rin Surf Excel cloth soap",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "clean-tidesurf",
    name: "Tide Surf",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "soap-vim",
    name: "Vim soap",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "soap-exo",
    name: "Exo soap",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "clean-rin-extra",
    name: "Rin (extra)",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },
  {
    id: "clean-rin-surfexcel",
    name: "Rin Surf Excel",
    categoryId: "home-cleaning",
    image: "/images/home-cleaning.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cloth & Dish Soaps"
  },

  // --- 7. Tea & Coffee (4 items) ---
  {
    id: "bev-3roses",
    name: "3 Roses tea powder",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Tea & Coffee"
  },
  {
    id: "bev-tajmahal",
    name: "Taj Mahal tea powder",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Tea & Coffee"
  },
  {
    id: "bev-bru",
    name: "Bru coffee powder",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Tea & Coffee"
  },
  {
    id: "bev-nescafe",
    name: "Nescafe coffee powder",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Tea & Coffee"
  },

  // --- 8. Pappulu, Ginjalu, Pindilu (33 items) ---
  {
    id: "groc-kandipappu",
    name: "Kandi pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-senagavithanalu",
    name: "Senaga vithanalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-minapappu-pattu",
    name: "Mina pappu - Pattu pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-minapappu-gundlu",
    name: "Mina pappu - Gundlu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-minapappu-sayi",
    name: "Mina pappu - Sayi pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-pesarapappu-pattu",
    name: "Pesara pappu - Pattu pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-pesarapappu-sayi",
    name: "Pesara pappu - Sayi pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-senagapappu",
    name: "Senaga pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-dhaniyalu",
    name: "Dhaniyalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-putnalapappu",
    name: "Putnala pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-miriyalu",
    name: "Miriyalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-dhalchinachekka",
    name: "Dhalchina chekka",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-aavalu",
    name: "Aavalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-gasagasaalu",
    name: "Gasagasaalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-geedipappu",
    name: "Geedipappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-kissmiss",
    name: "Kissmiss",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-bhampappu",
    name: "Bham pappu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-yalukalu",
    name: "Yalukalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-kobbari",
    name: "Kobbari",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-kobbarikayalu",
    name: "Kobbarikayalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-idlyravva",
    name: "Idly ravva",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-bombayravva",
    name: "Bombay ravva",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-godhumaravva",
    name: "Godhuma ravva",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-godhumapindi",
    name: "Godhuma pindi",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-maida",
    name: "Maida",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-senagapindi",
    name: "Senaga pindi",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-semyalu",
    name: "Semyalu",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-saggubiyyam",
    name: "Saggubiyyam",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-biyyam",
    name: "Biyyam",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-allam",
    name: "Allam",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-vellulli",
    name: "Vellulli",
    categoryId: "grocery",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-santoor-handwash",
    name: "Santoor handwash",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },
  {
    id: "groc-dettol-handwash",
    name: "Dettol handwash",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Pappulu, Ginjalu, Pindilu"
  },

  // --- 9. Cool Drinks & Liquids (9 items) ---
  {
    id: "bev-thumbsup-drink",
    name: "ThumbsUp",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  // Note: Sprite already exists as id 'bev-sprite' in beverages
  {
    id: "bev-kinleysoda",
    name: "Kinley Soda",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-bislerisoda",
    name: "Bisleri Soda",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-saltsoda",
    name: "Salt Soda",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-tatawater",
    name: "Tata Water",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-milk-local",
    name: "Milk",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-curd",
    name: "Curd",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },
  {
    id: "bev-buttermilk",
    name: "Buttermilk",
    categoryId: "beverages",
    image: "/images/beverages.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Cool Drinks & Liquids"
  },

  // --- 10. Powders & Others (5 items) ---
  {
    id: "pers-pondspowder",
    name: "Ponds powder",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Powders & Others"
  },
  {
    id: "pers-santoorpowder",
    name: "Santoor powder",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Powders & Others"
  },
  {
    id: "pers-bbpowder",
    name: "BB powder",
    categoryId: "personal-care",
    image: "/images/personal-care.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Powders & Others"
  },
  {
    id: "daily-bangles",
    name: "Bangles",
    categoryId: "daily-essentials",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Powders & Others"
  },
  {
    id: "daily-czitems",
    name: "CZ items",
    categoryId: "daily-essentials",
    image: "/images/grocery.jpg",
    packSize: null,
    price: null,
    inStock: true,
    description: "Powders & Others"
  }
];

async function insertItems() {
  console.log("Checking existing database products...");
  const existingRows = await db.allAsync('SELECT id, name FROM products');
  const existingIds = new Set(existingRows.map(r => r.id));
  const existingNames = new Set(existingRows.map(r => r.name.toLowerCase()));

  console.log(`Found ${existingRows.length} existing products in database.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const item of newGroceryItems) {
    if (existingIds.has(item.id)) {
      console.log(`Skipping (ID already exists): ${item.name} [${item.id}]`);
      skippedCount++;
      continue;
    }

    try {
      await db.runAsync(
        'INSERT INTO products (id, name, "categoryId", image, "packSize", price, "inStock", "featured", description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
        [
          item.id,
          item.name,
          item.categoryId,
          item.image,
          item.packSize,
          item.price,
          Boolean(item.inStock),
          false,
          item.description || null
        ]
      );
      insertedCount++;
    } catch (err) {
      console.error(`Failed to insert ${item.name}:`, err.message);
    }
  }

  console.log(`Database insertion complete: ${insertedCount} inserted, ${skippedCount} skipped.`);
  const totalAfter = await db.allAsync('SELECT count(*) as count FROM products');
  console.log(`Total products now in database: ${totalAfter[0]?.count}`);
  process.exit(0);
}

// Give DB client time to establish pool
setTimeout(() => {
  insertItems().catch(err => {
    console.error("Insert script error:", err);
    process.exit(1);
  });
}, 1000);
