import fs from 'fs';
import path from 'path';
import { Parser } from '@cooklang/cooklang';

const docsDir = './public/recipes';
const outputFile = './public/recipes.json';

// Read all markdown files in the directory
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('cook'));

const recipes = files.map(file => {
  const slug = file.replace('.cook', '');
  // Capitalize slug words for a fallback title
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const rawRecipe = fs.readFileSync(docsDir + "/" + file).toString()
  const parsedRecipe = new Parser().parse(rawRecipe);

  const time = parsedRecipe.metadata.time;
  let totalTime = "";

  if(typeof(time) === 'number'){
      totalTime = time.toString();
  } else {
      const cookTime = time?.cook_time || 0;
      const prepTime = time?.prep_time || 0;
      totalTime = (cookTime + prepTime).toString();
  }

  return {
    slug,
    title,
    img: parsedRecipe.metadata.images,
    time: totalTime
  };
});

fs.writeFileSync(outputFile, JSON.stringify(recipes, null, 2));
console.log(`Successfully indexed ${recipes.length} recipes!`);
