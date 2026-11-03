import fs from 'node:fs';
import path from 'node:path';

const outDir = '/public/assets/commodities';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Curated verified authentic photographic files on Wikimedia Commons
const items = [
  {
    name: 'real_rice.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/WhiteRice.jpg/1280px-WhiteRice.jpg'
  },
  {
    name: 'real_wheat.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Wheat_close-up.JPG/1280px-Wheat_close-up.JPG'
  },
  {
    name: 'real_soybeans.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Soybean.USDA.jpg/1280px-Soybean.USDA.jpg'
  },
  {
    name: 'real_corn.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Corncobs.jpg/1280px-Corncobs.jpg'
  },
  {
    name: 'real_lentils.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/3_types_of_lentil.png/1280px-3_types_of_lentil.png'
  },
  {
    name: 'real_sunflower.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Sunflower_Seeds_Kaldari.jpg/1280px-Sunflower_Seeds_Kaldari.jpg'
  },
  {
    name: 'real_cassava.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Maniok_Wurzelknollen_2.jpg/1280px-Maniok_Wurzelknollen_2.jpg'
  }
];

async function downloadAll() {
  for (const item of items) {
    const dest = path.join(outDir, item.name);
    console.log(`Downloading ${item.name}...`);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'AgrolineApp/1.0 (educational agricultural platform; contact: sikekay13@gmail.com)'
        }
      });
      if (!res.ok) {
        console.error(`Failed ${item.name}: ${res.status} ${res.statusText}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${item.name} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e);
    }
  }
}

downloadAll();
