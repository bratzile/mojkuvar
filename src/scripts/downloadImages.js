import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sastojciData from '../data/sastojci.json\' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`❌ Failed to download ${filename}: ${response.status}`);
      return false;
    }
    
    const buffer = await response.arrayBuffer();
    const imagePath = path.join(__dirname, '../../public/images/ingredients', filename);
    
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    console.log(`✅ Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.log(`❌ Error downloading ${filename}:`, error.message);
    return false;
  }
}

async function downloadAllImages() {
  console.log('🚀 Starting image download...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const ingredient of sastojciData.Sastojci) {
    const cleanName = ingredient.sastojakNAME.replace(/\s+/g, '%20').replace(/[^a-zA-Z0-9%]/g, '');
    const url = `https://www.themealdb.com/images/ingredients/${cleanName}-small.png`;
    const filename = `${ingredient.sastojakNAME.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`;
    
    const success = await downloadImage(url, filename);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Download Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Images saved to: public/images/ingredients/`);
}

downloadAllImages().catch(console.error);