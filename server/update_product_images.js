import db from './db.js';

export const imageMappings = {
  // --- 1. Snacks ---
  'snack-bingo-10': 'https://images.openfoodfacts.org/images/products/890/172/501/3684/front_en.24.400.jpg',
  'snack-lays': 'https://images.openfoodfacts.org/images/products/890/149/110/1844/front_en.32.400.jpg',
  'snack-lays-5': 'https://images.openfoodfacts.org/images/products/890/149/110/1844/front_en.32.400.jpg',
  'snack-kurkure': 'https://images.openfoodfacts.org/images/products/890/149/100/1168/front_fr.3.400.jpg',
  'snack-soyasticks': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hurricane_shelter_in_LaPlace%2C_Louisiana_at_the_Saint_John_the_Baptist_Parish_Community_Center_-_Zapp%27s_Spicy_Cajun_Crawtator_Potato_Chips.jpg/500px-Hurricane_shelter_in_LaPlace%2C_Louisiana_at_the_Saint_John_the_Baptist_Parish_Community_Center_-_Zapp%27s_Spicy_Cajun_Crawtator_Potato_Chips.jpg',
  'snack-moongdal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'snack-batani-packets': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Split_Chickpeas.jpg/500px-Split_Chickpeas.jpg',
  'snack-hyderabad-biryani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Hyderabadi_Chicken_Biryani.jpg/500px-Hyderabadi_Chicken_Biryani.jpg',
  'snack-papads': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Papadum_-_Urad_Dal.jpg/500px-Papadum_-_Urad_Dal.jpg',
  'snack-masala-palli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bowl_of_Cashews_and_Almonds_%2848140118636%29.jpg/500px-Bowl_of_Cashews_and_Almonds_%2848140118636%29.jpg',

  // --- 2. Chocolates ---
  'choc-dairymilk-10': 'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
  'choc-dairymilk-5': 'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
  'snack-dairymilk': 'https://res.cloudinary.com/rgblfsp8/image/upload/v1793552086/grocery-mart/products/choc_dairy_milk_test.jpg',
  'choc-5star-5': 'https://images.openfoodfacts.org/images/products/762/220/231/8009/front_en.3.400.jpg',
  'choc-5star-10': 'https://images.openfoodfacts.org/images/products/762/220/231/8009/front_en.3.400.jpg',
  'choc-munch-5': 'https://images.openfoodfacts.org/images/products/890/105/802/2087/front_en.3.400.jpg',
  'choc-ilachi': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500',
  'choc-coconut': 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500',
  'choc-milk': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500',
  'choc-anjeera': 'https://images.unsplash.com/photo-1575372587186-50020445582f?w=500',
  'choc-coffee': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
  'choc-mango': 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=500',

  // --- 3. Biscuits ---
  'snack-parleg': 'https://images.openfoodfacts.org/images/products/890/171/913/4845/front_en.11.400.jpg',
  'snack-goodday': 'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
  'bisc-goodday-5': 'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
  'bisc-goodday-10': 'https://images.openfoodfacts.org/images/products/890/106/309/2822/front_en.4.400.jpg',
  'bisc-momsmagic': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
  'bisc-tiger-3': 'https://images.openfoodfacts.org/images/products/890/106/302/1037/front_en.9.400.jpg',
  'bisc-mariegold-5': 'https://images.openfoodfacts.org/images/products/890/106/337/1033/front_en.4.400.jpg',
  'bisc-mariegold-10': 'https://images.openfoodfacts.org/images/products/890/106/337/1033/front_en.4.400.jpg',
  'bisc-bourbon': 'https://images.openfoodfacts.org/images/products/890/106/313/9206/front_en.4.400.jpg',
  'snack-oreo': 'https://images.openfoodfacts.org/images/products/762/230/033/6738/front_en.40.400.jpg',
  'bisc-oreo': 'https://images.openfoodfacts.org/images/products/762/230/033/6738/front_en.40.400.jpg',

  // --- 4. Shampoos ---
  'shamp-clinicplus': 'https://images.openbeautyfacts.org/images/products/890/103/098/4709/front_en.3.400.jpg',
  'shamp-meera': 'https://images.openbeautyfacts.org/images/products/890/297/900/2035/front_en.4.400.jpg',
  'shamp-chik': 'https://images.openbeautyfacts.org/images/products/890/297/900/2035/front_en.4.400.jpg',
  'shamp-sunsilk': 'https://images.openbeautyfacts.org/images/products/890/103/046/9183/front_en.4.400.jpg',
  'pers-shamp-dove': 'https://images.openbeautyfacts.org/images/products/871/716/327/9473/front_en.7.400.jpg',
  'shamp-dove': 'https://images.openbeautyfacts.org/images/products/871/716/327/9473/front_en.7.400.jpg',
  'shamp-headshoulder': 'https://images.openbeautyfacts.org/images/products/408/450/074/3165/front_en.11.400.jpg',

  // --- 5. Body Soaps ---
  'soap-mysoresandal': 'https://images.openbeautyfacts.org/images/products/890/128/710/0013/front_en.11.400.jpg',
  'soap-santoor': 'https://images.openbeautyfacts.org/images/products/890/139/904/9101/front_en.3.400.jpg',
  'soap-lifebuoy': 'https://images.openbeautyfacts.org/images/products/890/103/038/4127/front_en.4.400.jpg',
  'pers-soap-lux': 'https://images.openbeautyfacts.org/images/products/890/103/068/1714/front_en.4.400.jpg',

  // --- 6. Cloth & Dish Soaps ---
  'soap-xxxl': 'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
  'soap-rin-cloth': 'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
  'clean-rin-extra': 'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
  'clean-rin-surfexcel': 'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
  'soap-rinsurfexcel-cloth': 'https://images.openfoodfacts.org/images/products/890/103/073/9552/front_en.5.400.jpg',
  'clean-tidesurf': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500',
  'clean-surf': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500',
  'soap-vim': 'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
  'clean-vim': 'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
  'soap-exo': 'https://images.openfoodfacts.org/images/products/890/910/600/0230/front_en.3.400.jpg',
  'clean-lizol': 'https://images.openproductsfacts.org/images/products/890/139/611/3003/front_en.4.400.jpg',
  'clean-harpic': 'https://images.openproductsfacts.org/images/products/890/139/615/2804/front_en.4.400.jpg',

  // --- 7. Tea & Coffee ---
  'bev-3roses': 'https://images.openfoodfacts.org/images/products/890/103/098/5812/front_en.15.400.jpg',
  'bev-tajmahal': 'https://images.openfoodfacts.org/images/products/890/103/009/4750/front_en.4.400.jpg',
  'bev-bru': 'https://images.openfoodfacts.org/images/products/890/103/051/9017/front_en.3.400.jpg',
  'bev-nescafe': 'https://images.openfoodfacts.org/images/products/761/303/498/0878/front_en.14.400.jpg',

  // --- 8. Cool Drinks & Beverages ---
  'bev-cola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/15-09-26-RalfR-WLC-0098_-_Coca-Cola_glass_bottle_%28Germany%29.jpg/500px-15-09-26-RalfR-WLC-0098_-_Coca-Cola_glass_bottle_%28Germany%29.jpg',
  'bev-pepsi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_bottle.jpg/500px-Pepsi_bottle.jpg',
  'bev-sprite': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sprite_bottle.jpg/500px-Sprite_bottle.jpg',
  'bev-thumsup': 'https://images.openfoodfacts.org/images/products/890/176/404/2911/front_en.41.400.jpg',
  'bev-thumbsup-drink': 'https://images.openfoodfacts.org/images/products/890/176/404/2911/front_en.41.400.jpg',
  'bev-maaza': 'https://images.openfoodfacts.org/images/products/890/176/405/1005/front_en.4.400.jpg',
  'bev-water': 'https://images.openfoodfacts.org/images/products/890/176/407/2277/front_en.33.400.jpg',
  'bev-kinleysoda': 'https://images.openfoodfacts.org/images/products/890/176/407/2277/front_en.33.400.jpg',
  'bev-bislerisoda': 'https://images.openfoodfacts.org/images/products/890/601/729/0774/front_en.5.400.jpg',
  'bev-saltsoda': 'https://images.openfoodfacts.org/images/products/890/176/407/2277/front_en.33.400.jpg',
  'bev-tatawater': 'https://images.openfoodfacts.org/images/products/890/375/400/0086/front_en.3.400.jpg',
  'bev-milk': 'https://images.openfoodfacts.org/images/products/890/408/991/6134/front_en.4.400.jpg',
  'bev-milk-local': 'https://images.openfoodfacts.org/images/products/890/126/215/0217/front_en.4.400.jpg',
  'bev-curd': 'https://images.openfoodfacts.org/images/products/890/126/220/0011/front_en.4.400.jpg',
  'bev-buttermilk': 'https://images.openfoodfacts.org/images/products/890/126/220/0196/front_en.4.400.jpg',

  // --- 9. Pappulu, Ginjalu, Pindilu & Grains ---
  'groc-kandipappu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'groc-toordal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'groc-senagavithanalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Split_Chickpeas.jpg/500px-Split_Chickpeas.jpg',
  'groc-minapappu-pattu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Papadum_-_Urad_Dal.jpg/500px-Papadum_-_Urad_Dal.jpg',
  'groc-minapappu-gundlu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Papadum_-_Urad_Dal.jpg/500px-Papadum_-_Urad_Dal.jpg',
  'groc-minapappu-sayi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Papadum_-_Urad_Dal.jpg/500px-Papadum_-_Urad_Dal.jpg',
  'groc-pesarapappu-pattu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'groc-pesarapappu-sayi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'groc-moong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Chana_Ko_Dal.jpg/500px-Chana_Ko_Dal.jpg',
  'groc-senagapappu': 'https://images.openfoodfacts.org/images/products/890/404/392/6643/front_en.3.400.jpg',
  'groc-putnalapappu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Split_Chickpeas.jpg/500px-Split_Chickpeas.jpg',
  'groc-dhaniyalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Coriander_Seeds.jpg/500px-Coriander_Seeds.jpg',
  'groc-miriyalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Black_peppercorns_gn.jpg/500px-Black_peppercorns_gn.jpg',
  'groc-dhalchinachekka': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Canelle_Cinnamomum_burmanni_Luc_Viatour.jpg/500px-Canelle_Cinnamomum_burmanni_Luc_Viatour.jpg',
  'groc-aavalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Senf-Variationen.jpg/500px-Senf-Variationen.jpg',
  'groc-gasagasaalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Poppy-seeds.jpg/500px-Poppy-seeds.jpg',
  'groc-geedipappu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bowl_of_Cashews_and_Almonds_%2848140118636%29.jpg/500px-Bowl_of_Cashews_and_Almonds_%2848140118636%29.jpg',
  'groc-kissmiss': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Raisins_01.jpg/500px-Raisins_01.jpg',
  'groc-bhampappu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Liat_Portal_for_Foodie_Disorder_-_Raw_almonds_in_a_bowl.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Raw_almonds_in_a_bowl.jpg',
  'groc-yalukalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Green_Cardamom_Pods.jpg/500px-Green_Cardamom_Pods.jpg',
  'groc-kobbari': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Copra_full.JPG/500px-Copra_full.JPG',
  'groc-kobbarikayalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Coconuts_-_single_and_cracked_open.jpg/500px-Coconuts_-_single_and_cracked_open.jpg',
  'groc-idlyravva': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-bombayravva': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-godhumaravva': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-godhumapindi': 'https://images.openfoodfacts.org/images/products/890/172/512/1129/front_en.30.400.jpg',
  'groc-atta-ashir': 'https://images.openfoodfacts.org/images/products/890/172/512/1129/front_en.30.400.jpg',
  'groc-maida': 'https://images.openfoodfacts.org/images/products/890/172/512/1129/front_en.30.400.jpg',
  'groc-senagapindi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Split_Chickpeas.jpg/500px-Split_Chickpeas.jpg',
  'groc-semyalu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-saggubiyyam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-biyyam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-rice-sona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Thai_jasmine_rice_uncooked.jpg/500px-Thai_jasmine_rice_uncooked.jpg',
  'groc-sugar': 'https://images.openfoodfacts.org/images/products/890/602/690/0022/front_en.4.400.jpg',
  'groc-salt': 'https://images.openfoodfacts.org/images/products/890/404/390/1015/front_en.34.400.jpg',
  'groc-allam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Fresh_ginger_rhizome_01.jpg/500px-Fresh_ginger_rhizome_01.jpg',
  'groc-vellulli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Garlic_bulbs_and_cloves.jpg/500px-Garlic_bulbs_and_cloves.jpg',
  'groc-santoor-handwash': 'https://images.openbeautyfacts.org/images/products/890/128/720/8894/front_en.3.400.jpg',
  'groc-dettol-handwash': 'https://images.openfoodfacts.org/images/products/890/139/631/3106/front_en.10.400.jpg',
  'pers-dettol': 'https://images.openfoodfacts.org/images/products/890/139/631/3106/front_en.10.400.jpg',

  // --- 10. Powders & Others ---
  'pers-pondspowder': 'https://images.openbeautyfacts.org/images/products/890/103/086/9112/front_en.3.400.jpg',
  'pers-santoorpowder': 'https://images.openbeautyfacts.org/images/products/890/139/904/9101/front_en.3.400.jpg',
  'pers-bbpowder': 'https://images.openbeautyfacts.org/images/products/890/103/086/9112/front_en.3.400.jpg',
  'daily-bangles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Glass_bangles.jpg/500px-Glass_bangles.jpg',
  'daily-czitems': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/PXL_20231218_152223456_Victoria_and_Albert_Museum_Artefacts_01_ancient_South_Indian_jewelry%2C_possibly_from_Tamil_Nadu%2C_with_one_type_of_necklace_identified_as_a_traditional_marriage_necklace.jpg/500px-PXL_20231218_152223456_Victoria_and_Albert_Museum_Artefacts_01_ancient_South_Indian_jewelry%2C_possibly_from_Tamil_Nadu%2C_with_one_type_of_necklace_identified_as_a_traditional_marriage_necklace.jpg',
  'daily-match': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',

  // --- Fresh produce ---
  'fresh-onion': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/500px-Onion_on_White.JPG',
  'fresh-potato': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Patates.jpg/500px-Patates.jpg',
  'fresh-tomato': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/500px-Tomato_je.jpg',
  'fresh-lemon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Lemon.jpg/500px-Lemon.jpg',

  // --- Spices & Kitchen ---
  'kit-chilli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Chilli_powder_for_sale.JPG/500px-Chilli_powder_for_sale.JPG',
  'kit-turmeric': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Curcuma_longa_roots.jpg/500px-Curcuma_longa_roots.jpg',
  'kit-garam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Gewuerze_004_2024_08_10.jpg/500px-Gewuerze_004_2024_08_10.jpg',
  'kit-oil-sun': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
  'kit-ghee': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500',

  // --- Packaged Foods ---
  'pack-ketchup': 'https://images.openfoodfacts.org/images/products/890/103/065/7849/front_en.4.400.jpg',
  'pack-maggie': 'https://images.openfoodfacts.org/images/products/890/105/800/6292/front_en.4.400.jpg',

  // --- Personal care ---
  'pers-colgate': 'https://images.openbeautyfacts.org/images/products/890/131/401/0520/front_en.4.400.jpg',

  // --- Stationery & Utilities ---
  'stat-notebook': 'https://images.openproductsfacts.org/images/products/890/251/900/2020/front_en.4.400.jpg',
  'stat-pen-link': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500',
  'stat-apsara-penc': 'https://images.unsplash.com/photo-1585336261026-635b71c26b5c?w=500',
  'house-battery-aa': 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=500',
  'house-bulb': 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500',

  // --- Baby care ---
  'baby-pampers': 'https://images.openproductsfacts.org/images/products/800/184/104/1041/front_en.4.400.jpg',
  'baby-wipes': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'
};

async function updateDatabase() {
  console.log('Connecting to PostgreSQL database to update product images...');
  let updatedCount = 0;
  for (const [id, imageUrl] of Object.entries(imageMappings)) {
    try {
      const res = await db.runAsync(
        'UPDATE products SET image = $1 WHERE id = $2',
        [imageUrl, id]
      );
      if (res.rowCount > 0) updatedCount++;
    } catch (err) {
      console.error('Failed to update product ' + id + ':', err.message);
    }
  }

  console.log('Successfully updated images for ' + updatedCount + ' products in Neon DB.');
  process.exit(0);
}

// Allow DB pool to connect
setTimeout(() => {
  updateDatabase().catch(err => {
    console.error('Update script failed:', err);
    process.exit(1);
  });
}, 1000);
