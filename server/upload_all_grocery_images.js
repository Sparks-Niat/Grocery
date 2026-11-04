import fs from 'fs';
import path from 'path';
import db from './db.js';
import { uploadToCloudinary } from './cloudinary.js';

// Category fallback studio images (all pre-verified 200 OK)
const categoryDefaults = {
  snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  grocery: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  kitchen: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'fresh-produce': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
  'personal-care': 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=600&q=80',
  'home-cleaning': 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=600&q=80',
  stationery: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
  'baby-care': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  'packaged-foods': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
  'household-utilities': 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80',
  'daily-essentials': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
};

// Curated high quality product photography source candidates
export const sourceMappings = {
  // --- 1. Snacks ---
  'snack-bingo-10': [
    'https://images.openfoodfacts.org/images/products/890/172/501/3684/front_en.24.400.jpg',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-lays': [
    'https://images.openfoodfacts.org/images/products/890/149/110/1844/front_en.32.400.jpg',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-lays-5': [
    'https://images.openfoodfacts.org/images/products/890/149/110/1844/front_en.32.400.jpg',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-kurkure': [
    'https://images.openfoodfacts.org/images/products/890/149/100/1168/front_fr.3.400.jpg',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-soyasticks': [
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-moongdal': [
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-batani-packets': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-hyderabad-biryani': [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-papads': [
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-masala-palli': [
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 2. Chocolates ---
  'choc-dairymilk-10': [
    'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-dairymilk-5': [
    'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-dairymilk': [
    'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-5star-5': [
    'https://images.openfoodfacts.org/images/products/762/220/231/8009/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-5star-10': [
    'https://images.openfoodfacts.org/images/products/762/220/231/8009/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-munch-5': [
    'https://images.openfoodfacts.org/images/products/890/105/802/2087/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-ilachi': [
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-coconut': [
    'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-milk': [
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-anjeera': [
    'https://images.unsplash.com/photo-1575372587186-50020445582f?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-coffee': [
    'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80'
  ],
  'choc-mango': [
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 3. Biscuits ---
  'snack-parleg': [
    'https://images.openfoodfacts.org/images/products/890/171/913/4845/front_en.11.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-goodday': [
    'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-goodday-5': [
    'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-goodday-10': [
    'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-momsmagic': [
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-tiger-3': [
    'https://images.openfoodfacts.org/images/products/890/106/302/1037/front_en.9.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-mariegold-5': [
    'https://images.openfoodfacts.org/images/products/890/106/337/1033/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-mariegold-10': [
    'https://images.openfoodfacts.org/images/products/890/106/337/1033/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-bourbon': [
    'https://images.openfoodfacts.org/images/products/890/106/313/9206/front_en.4.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'snack-oreo': [
    'https://images.openfoodfacts.org/images/products/762/230/033/6738/front_en.40.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],
  'bisc-oreo': [
    'https://images.openfoodfacts.org/images/products/762/230/033/6738/front_en.40.400.jpg',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 4. Shampoos ---
  'shamp-clinicplus': [
    'https://images.openbeautyfacts.org/images/products/890/103/098/4709/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
  ],
  'shamp-meera': [
    'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=600&q=80'
  ],
  'shamp-chik': [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
  ],
  'shamp-sunsilk': [
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80'
  ],
  'pers-shamp-dove': [
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
  ],
  'shamp-dove': [
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
  ],
  'shamp-headshoulder': [
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 5. Body Soaps ---
  'soap-mysoresandal': [
    'https://images.openbeautyfacts.org/images/products/890/128/710/0013/front_en.11.400.jpg',
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-santoor': [
    'https://images.openbeautyfacts.org/images/products/890/139/904/9101/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-lifebuoy': [
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],
  'pers-soap-lux': [
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 6. Cloth & Dish Soaps ---
  'soap-xxxl': [
    'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-rin-cloth': [
    'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-rinsurfexcel-cloth': [
    'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-tidesurf': [
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-surf': [
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-vim': [
    'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-vim': [
    'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'
  ],
  'soap-exo': [
    'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-rin-extra': [
    'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-rin-surfexcel': [
    'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-lizol': [
    'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=600&q=80'
  ],
  'clean-harpic': [
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 7. Tea & Coffee ---
  'bev-3roses': [
    'https://images.openfoodfacts.org/images/products/890/103/098/5812/front_en.15.400.jpg',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-tajmahal': [
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-bru': [
    'https://images.openfoodfacts.org/images/products/890/103/051/9017/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-nescafe': [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 8. Cool Drinks & Beverages ---
  'bev-cola': [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-pepsi': [
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-sprite': [
    'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-thumsup': [
    'https://images.openfoodfacts.org/images/products/890/176/404/2911/front_en.41.400.jpg',
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-thumbsup-drink': [
    'https://images.openfoodfacts.org/images/products/890/176/404/2911/front_en.41.400.jpg',
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-maaza': [
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-water': [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-kinleysoda': [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-bislerisoda': [
    'https://images.openfoodfacts.org/images/products/890/601/729/0774/front_en.5.400.jpg',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-saltsoda': [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-tatawater': [
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-milk': [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-milk-local': [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-curd': [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
  ],
  'bev-buttermilk': [
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 9. Pappulu, Ginjalu, Pindilu & Grains ---
  'groc-kandipappu': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-toordal': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-senagavithanalu': [
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-minapappu-pattu': [
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-minapappu-gundlu': [
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-minapappu-sayi': [
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-pesarapappu-pattu': [
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-pesarapappu-sayi': [
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-moong': [
    'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-senagapappu': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-putnalapappu': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-dhaniyalu': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-miriyalu': [
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-dhalchinachekka': [
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-aavalu': [
    'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-gasagasaalu': [
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-geedipappu': [
    'https://images.unsplash.com/photo-1569466896818-335b1bedfcce?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-kissmiss': [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-bhampappu': [
    'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-yalukalu': [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-kobbari': [
    'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-kobbarikayalu': [
    'https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-idlyravva': [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-bombayravva': [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-godhumaravva': [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-godhumapindi': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-atta-ashir': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-maida': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-senagapindi': [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-semyalu': [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-saggubiyyam': [
    'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-biyyam': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-rice-sona': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-sugar': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-salt': [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-allam': [
    'https://images.unsplash.com/photo-1599940859674-a7fef05b94ae?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-vellulli': [
    'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-santoor-handwash': [
    'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=600&q=80'
  ],
  'groc-dettol-handwash': [
    'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=600&q=80'
  ],
  'pers-dettol': [
    'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&w=600&q=80'
  ],

  // --- 10. Powders & Others ---
  'pers-pondspowder': [
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80'
  ],
  'pers-santoorpowder': [
    'https://images.openbeautyfacts.org/images/products/890/139/904/9101/front_en.3.400.jpg',
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80'
  ],
  'pers-bbpowder': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
  ],
  'daily-bangles': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Glass_bangles.jpg/500px-Glass_bangles.jpg',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  ],
  'daily-czitems': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Fresh produce ---
  'fresh-onion': [
    'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
  ],
  'fresh-potato': [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'
  ],
  'fresh-tomato': [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'
  ],
  'fresh-lemon': [
    'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Spices & Kitchen ---
  'kit-chilli': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  ],
  'kit-turmeric': [
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'
  ],
  'kit-garam': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80'
  ],
  'kit-oil-sun': [
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80'
  ],
  'kit-ghee': [
    'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Personal care ---
  'pers-colgate': [
    'https://images.unsplash.com/photo-1559591937-e1032c510861?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Stationery & Utilities ---
  'stat-notebook': [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
  ],
  'stat-pen-link': [
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'
  ],
  'stat-apsara-penc': [
    'https://images.unsplash.com/photo-1585336261026-635b71c26b5c?auto=format&fit=crop&w=600&q=80'
  ],
  'house-battery-aa': [
    'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80'
  ],
  'house-bulb': [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80'
  ],
  'daily-match': [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80'
  ],
  'daily-rope': [
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80'
  ],
  'daily-umbrella': [
    'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Baby care ---
  'baby-pampers': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
  ],
  'baby-wipes': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
  ],

  // --- Packaged Foods ---
  'pack-ketchup': [
    'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80'
  ],
  'pack-maggie': [
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80'
  ]
};

async function fetchBufferWithFallback(id, categoryId) {
  const candidates = sourceMappings[id] || [];
  const defaultFallback = categoryDefaults[categoryId] || categoryDefaults.grocery;
  const listToTry = [...candidates, defaultFallback];

  for (const url of listToTry) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        if (buf.length > 800 && (contentType.includes('image') || url.includes('.jpg') || url.includes('.png'))) {
          return { buffer: buf, sourceUrl: url };
        }
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  // Final fallback to clean default
  const res = await fetch(defaultFallback, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  return { buffer: Buffer.from(await res.arrayBuffer()), sourceUrl: defaultFallback };
}

async function main() {
  console.log('--- Starting Cloudinary Grocery Image Upload Pipeline ---');
  const meta = JSON.parse(fs.readFileSync('./server/products_meta.json', 'utf8'));
  const productIds = Object.keys(meta);
  console.log(`Processing ${productIds.length} total products...`);

  const updatedCloudinaryMap = {};
  let successCount = 0;

  for (let i = 0; i < productIds.length; i++) {
    const id = productIds[i];
    const { name, categoryId } = meta[id];
    console.log(`[${i + 1}/${productIds.length}] Processing ${name} (${id})...`);

    try {
      const { buffer, sourceUrl } = await fetchBufferWithFallback(id, categoryId);
      
      const uploadRes = await uploadToCloudinary(buffer, {
        folder: 'grocery-mart/products',
        public_id: id,
        overwrite: true,
        transformation: [
          { width: 600, height: 600, crop: 'pad', background: 'white' },
          { fetch_format: 'auto', quality: 'auto' }
        ]
      });

      // Construct professional, clean, square 1:1 Cloudinary WebP URL
      const cdnUrl = `https://res.cloudinary.com/rgblfsp8/image/upload/b_white,c_pad,h_600,w_600/f_auto,q_auto/v${uploadRes.version}/grocery-mart/products/${id}.webp`;
      updatedCloudinaryMap[id] = cdnUrl;

      // Update Neon Database
      await db.runAsync('UPDATE products SET image = $1 WHERE id = $2', [cdnUrl, id]);
      successCount++;
      console.log(`  ✓ Uploaded to Cloudinary: ${cdnUrl}`);
    } catch (err) {
      console.error(`  ✗ Error processing ${id}:`, err.message);
    }
  }

  // Save the full map
  fs.writeFileSync('./server/cloudinary_image_map.json', JSON.stringify(updatedCloudinaryMap, null, 2));
  console.log(`\nSuccessfully uploaded and updated ${successCount}/${productIds.length} products in Neon DB.`);

  // Update src/data/products.js
  const productsJsPath = './src/data/products.js';
  let productsJsContent = fs.readFileSync(productsJsPath, 'utf8');
  let localUpdateCount = 0;
  for (const [id, cdnUrl] of Object.entries(updatedCloudinaryMap)) {
    // Replace image property for product with this id
    const regex = new RegExp(`(id:\\s*["']${id}["'][\\s\\S]*?image:\\s*)["'][^"']+["']`, 'g');
    if (regex.test(productsJsContent)) {
      productsJsContent = productsJsContent.replace(regex, `$1"${cdnUrl}"`);
      localUpdateCount++;
    }
  }

  fs.writeFileSync(productsJsPath, productsJsContent, 'utf8');
  console.log(`Synced ${localUpdateCount} product images in src/data/products.js.`);

  console.log('--- Pipeline Completed Successfully ---');
  process.exit(0);
}

// Start after DB initializes
setTimeout(() => {
  main().catch(err => {
    console.error('Fatal pipeline error:', err);
    process.exit(1);
  });
}, 1000);
