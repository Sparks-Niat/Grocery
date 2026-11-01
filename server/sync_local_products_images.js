import fs from 'fs';
import { imageMappings } from './update_product_images.js';

let content = fs.readFileSync('src/data/products.js', 'utf8');

let count = 0;
for (const [id, url] of Object.entries(imageMappings)) {
  const targetIdPattern = `id: "${id}"`;
  const idx = content.indexOf(targetIdPattern);
  if (idx !== -1) {
    const nextImgIdx = content.indexOf('image: "', idx);
    if (nextImgIdx !== -1 && nextImgIdx - idx < 200) {
      const quoteEnd = content.indexOf('",', nextImgIdx + 8);
      if (quoteEnd !== -1) {
        content = content.slice(0, nextImgIdx + 8) + url + content.slice(quoteEnd);
        count++;
      }
    }
  }
}

fs.writeFileSync('src/data/products.js', content, 'utf8');
console.log(`Updated ${count} images in src/data/products.js`);
