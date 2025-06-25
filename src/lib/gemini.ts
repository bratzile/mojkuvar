import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Recipe } from '../types';

// Dodaj svoj Gemini API ključ ovde
const GEMINI_API_KEY = 'AIzaSyArfBbvVJSo4InD5OTmoP4TLUYCNKx2hvg';

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyArfBbvVJSo4InD5OTmoP4TLUYCNKx2hvg') {
  console.warn('⚠️ Gemini API ključ nije postavljen. Molimo dodajte vaš API ključ u src/lib/gemini.ts');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Basic ingredients that don't count as "missing"
const basicIngredients = [
  'so', 'salt', 'biber', 'pepper', 'ulje', 'oil', 'maslinovo ulje', 'olive oil',
  'voda', 'water', 'belo sirće', 'vinegar', 'limunov sok', 'lemon juice'
];

// 🔥 GLOBALNA VARIJABLA ZA ČUVANJE KONTEKSTA RECEPATA
let currentRecipeContext: string[] = [];

export async function generateRecipesStreaming(
  ingredients: string[], 
  prompt: string, 
  servings: number = 2,
  targetCount: number = 5,
  onRecipeReceived: (recipe: Recipe) => void
): Promise<Recipe[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 🧠 PAMETNO KREIRANJE PROMPTA NA OSNOVU KONTEKSTA
    let systemPrompt = '';
    
    if (currentRecipeContext.length > 0) {
      // Ako imamo postojeće recepte, generiši slične
      systemPrompt = `Ti si Receptomat, AI kulinarska čarobnica koja pomaže u kreiranju recepata. 

KRITIČNO VAŽNO: 
- Generiši TAČNO ${targetCount} različitih recepata
- SVAKI odgovor MORA počinjati sa ###1
- NE DODAVAJ nikakav tekst pre prvog recepta
- NE OBJAŠNJAVAJ šta radiš
- SVI RECEPTI MORAJU BITI ZA ${servings} ${servings === 1 ? 'OSOBU' : servings < 5 ? 'OSOBE' : 'OSOBA'}

🔥 VAŽNO - GENERIŠI SLIČNE RECEPTE:
Već postojeći recepti: ${currentRecipeContext.join(', ')}

ZADATAK: Generiši ${targetCount} NOVIH recepata koji su SLIČNI postojećima po:
- Stilu kuvanja (npr. ako su postojeći pečeni, generiši još pečenih)
- Vrsti jela (npr. ako su postojeći deserti, generiši još deserata)
- Glavnim sastojcima (koristi slične sastojke)
- Složenosti (održi sličan nivo težine)

Format odgovora (OBAVEZNO):
${Array.from({length: targetCount}, (_, i) => `###${i + 1}
[Naziv recepta - SLIČAN postojećima]
Opis: [detaljniji i zanimljiviji opis recepta - 2-3 rečenice o ukusu, teksturi i načinu pripreme]
Način pripreme: [glavne tehnike]
Vreme pripreme: [vreme]
Težina: [lako/srednje/teško]
Porcije: ${servings}
Nedostaju: [glavni sastojci koji fale, ili "ništa" ako imaš sve - NE RAČUNAJ so, biber, ulje, vodu kao nedostajuće]`).join('\n\n')}

Recepti treba da budu različiti ali SLIČNI postojećima po stilu i vrsti.`;
    } else {
      // Prvi put - generiši nove recepte
      systemPrompt = `Ti si Receptomat, AI kulinarska čarobnica koja pomaže u kreiranju recepata. 

KRITIČNO VAŽNO: 
- Generiši TAČNO ${targetCount} različitih recepata
- SVAKI odgovor MORA počinjati sa ###1
- NE DODAVAJ nikakav tekst pre prvog recepta
- NE OBJAŠNJAVAJ šta radiš
- SVI RECEPTI MORAJU BITI ZA ${servings} ${servings === 1 ? 'OSOBU' : servings < 5 ? 'OSOBE' : 'OSOBA'}
- PRIORITET: Prvo daj recepte gde ne nedostaju sastojci (osim osnovnih kao so, biber, ulje)

Format odgovora (OBAVEZNO):
${Array.from({length: targetCount}, (_, i) => `###${i + 1}
[Naziv recepta]
Opis: [detaljniji i zanimljiviji opis recepta - 2-3 rečenice o ukusu, teksturi i načinu pripreme]
Način pripreme: [glavne tehnike]
Vreme pripreme: [vreme]
Težina: [lako/srednje/teško]
Porcije: ${servings}
Nedostaju: [glavni sastojci koji fale, ili "ništa" ako imaš sve - NE RAČUNAJ so, biber, ulje, vodu kao nedostajuće]`).join('\n\n')}

Recepti treba da budu različiti po načinu pripreme i ukusu.`;
    }

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContentStream(fullPrompt);
    
    let accumulatedText = '';
    let processedRecipes = 0;
    const allRecipes: Recipe[] = [];

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;

      // Try to parse complete recipes from accumulated text
      const newRecipes = parseStreamingRecipes(accumulatedText, servings, processedRecipes);
      
      // Send new recipes to callback
      for (let i = processedRecipes; i < newRecipes.length; i++) {
        if (newRecipes[i] && allRecipes.length < targetCount) {
          onRecipeReceived(newRecipes[i]);
          allRecipes.push(newRecipes[i]);
          processedRecipes++;
        }
      }
    }

    // Final parse to catch any remaining recipes
    const finalRecipes = parseStreamingRecipes(accumulatedText, servings, 0);
    
    // Sort recipes: those without missing ingredients first
    const sortedRecipes = finalRecipes.sort((a, b) => {
      const aMissingCount = a.missingIngredients.filter(ing => 
        !isBasicIngredient(ing)
      ).length;
      const bMissingCount = b.missingIngredients.filter(ing => 
        !isBasicIngredient(ing)
      ).length;
      
      return aMissingCount - bMissingCount;
    });

    // 🔥 AŽURIRAJ KONTEKST SA NOVIM RECEPTIMA
    const newRecipeTitles = sortedRecipes.slice(0, targetCount).map(r => r.title);
    currentRecipeContext = [...currentRecipeContext, ...newRecipeTitles];
    
    // Drži maksimalno 10 recepata u kontekstu
    if (currentRecipeContext.length > 10) {
      currentRecipeContext = currentRecipeContext.slice(-10);
    }

    return sortedRecipes.slice(0, targetCount);
  } catch (error) {
    console.error('Error generating recipes with Gemini:', error);
    throw new Error('Nije moguće generisati recepte trenutno. Molimo pokušajte kasnije.');
  }
}

// 🔥 NOVA FUNKCIJA ZA RESETOVANJE KONTEKSTA
export function resetRecipeContext() {
  currentRecipeContext = [];
}

function isBasicIngredient(ingredient: string): boolean {
  const lowerIngredient = ingredient.toLowerCase().trim();
  return basicIngredients.some(basic => 
    lowerIngredient.includes(basic.toLowerCase())
  );
}

function parseStreamingRecipes(content: string, servings: number, startFrom: number): Recipe[] {
  try {
    // Remove any text before the first ###
    const cleanContent = content.substring(content.indexOf('###'));
    const blocks = cleanContent.split(/###\d+/).filter(Boolean);
    const recipes = [];

    // Array of diverse food images from Unsplash (smaller format for faster loading)
    const foodImages = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=60', // Pizza
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=60', // Pancakes
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60', // Salad
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=60', // Burger
      'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=60', // Pasta
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=60', // Soup
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=60', // Fried rice
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=60', // Sandwich
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=60', // Healthy bowl
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=400&q=60'  // Steak
    ];

    for (let i = startFrom; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block) continue;
      
      const lines = block.trim().split('\n').map(l => l.trim().replace(/\*\*/g, '')).filter(Boolean);
      
      if (lines.length === 0) continue;

      const title = lines[0] || `Recept ${i + 1}`;
      
      // Skip if this looks like AI explanation text
      if (title.toLowerCase().includes('evo') || 
          title.toLowerCase().includes('predlažem') || 
          title.toLowerCase().includes('mogu da') ||
          title.toLowerCase().includes('recepti') ||
          title.length > 100) {
        continue;
      }

      // Check if we have all required fields for a complete recipe
      const hasDescription = lines.some(l => l.startsWith('Opis:'));
      const hasMethod = lines.some(l => l.startsWith('Način pripreme:'));
      const hasTime = lines.some(l => l.startsWith('Vreme pripreme:'));
      const hasDifficulty = lines.some(l => l.startsWith('Težina:'));
      
      // Only add recipe if it's complete enough
      if (!hasDescription || !hasMethod) {
        continue;
      }

      const description = lines.find(l => l.startsWith('Opis:'))?.replace('Opis:', '').trim() || 'Ukusan recept sa dostupnim sastojcima.';
      const method = lines.find(l => l.startsWith('Način pripreme:'))?.replace('Način pripreme:', '').trim() || 'Kombinovano';
      const time = lines.find(l => l.startsWith('Vreme pripreme:'))?.replace('Vreme pripreme:', '').trim() || '30 min';
      const difficulty = lines.find(l => l.startsWith('Težina:'))?.replace('Težina:', '').trim() || 'srednje';
      const servingsFromText = lines.find(l => l.startsWith('Porcije:'))?.replace('Porcije:', '').trim() || servings.toString();
      
      const missingLine = lines.find(l => l.startsWith('Nedostaju:'));
      let missingIngredients: string[] = [];
      if (missingLine) {
        const missingText = missingLine.replace('Nedostaju:', '').trim();
        if (missingText && missingText.toLowerCase() !== 'ništa' && missingText.toLowerCase() !== 'nista') {
          missingIngredients = missingText.split(',').map(i => i.trim()).filter(Boolean);
          // Filter out basic ingredients
          missingIngredients = missingIngredients.filter(ing => !isBasicIngredient(ing));
        }
      }

      // Use different image for each recipe
      const imageUrl = foodImages[i % foodImages.length];

      recipes.push({
        id: `recipe-${Date.now()}-${i}`,
        title,
        description,
        method,
        time,
        difficulty,
        servings: parseInt(servingsFromText) || servings,
        usedCount: 0,
        missingIngredients,
        imageUrl,
        isRecipe: true
      });
    }

    return recipes;
  } catch (error) {
    console.error('Error parsing streaming recipes:', error);
    return [];
  }
}

export async function getFullRecipeStreaming(
  recipeName: string, 
  ingredients: string[],
  onContentReceived: (content: string) => void,
  servings: number = 2
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const systemPrompt = `Ti si Receptomat, AI kulinarska čarobnica. Napiši detaljan recept u sledećem formatu:

[Naziv recepta]

Sastojci:
- [sastojak 1 sa PRECIZNOM količinom za ${servings} ${servings === 1 ? 'osobu' : servings < 5 ? 'osobe' : 'osoba'}]
- [sastojak 2 sa PRECIZNOM količinom za ${servings} ${servings === 1 ? 'osobu' : servings < 5 ? 'osobe' : 'osoba'}]
...

Priprema:
1. [korak 1]
2. [korak 2]
...

Vreme pripreme: [ukupno vreme]

Receptomat savet: [koristan kulinarski savet - kako da jelo bude ukusnije, lepše, uz koje pice se slaže, kako da se serviraju, dodatni trikovi za bolji ukus, itd. - OBAVEZNO NAPIŠI KOMPLETAN SAVET U JEDNOJ REČENICI]

KRITIČNO VAŽNO ZA SKALIRANJE SASTOJAKA:
- Za 1 osobu: koristi MANJE količine nego za 2 osobe
- Za 2 osobe: koristi standardne količine
- Za 4 osobe: koristi DUPLO VIŠE nego za 2 osobe
- Za 6+ osoba: koristi TROSTRUKO VIŠE nego za 2 osobe

PRIMERI PRAVILNOG SKALIRANJA:
- 1 osoba: 150g mesa, 1 šolja pirinča, 1 kašika ulja
- 2 osobe: 300g mesa, 2 šolje pirinča, 2 kašike ulja  
- 4 osobe: 600g mesa, 4 šolje pirinča, 4 kašike ulja
- 6 osoba: 900g mesa, 6 šolja pirinča, 6 kašika ulja

VAŽNO:
- Sve količine sastojaka moraju biti LOGIČNO prilagođene za TAČNO ${servings} ${servings === 1 ? 'osobu' : servings < 5 ? 'osobe' : 'osoba'}
- Koristi precizne mere (grame, mililitre, kašike, šolje)
- Manje osoba = MANJE sastojaka, više osoba = VIŠE sastojaka
- Recept treba da bude detaljan i precizan
- Sa tačnim količinama prilagođenim broju osoba
- Sa jasnim koracima
- OBAVEZNO završi sa kompletnim kulinarskim savetom u sekciji "Receptomat savet"`;

    const prompt = `Napiši kompletan recept za "${recipeName}" koristeći sledeće sastojke: ${ingredients.join(', ')}. 

VAŽNO: Recept mora biti za ${servings} ${servings === 1 ? 'osobu' : servings < 5 ? 'osobe' : 'osoba'} sa PRAVILNO SKALIRANIM količinama sastojaka.

${servings === 1 ? 'Za 1 osobu koristi MANJE količine sastojaka.' : 
  servings === 2 ? 'Za 2 osobe koristi standardne količine sastojaka.' :
  servings === 4 ? 'Za 4 osobe koristi DUPLO VIŠE sastojaka nego za 2 osobe.' :
  'Za 6+ osoba koristi TROSTRUKO VIŠE sastojaka nego za 2 osobe.'}`;

    const result = await model.generateContentStream(`${systemPrompt}\n\n${prompt}`);
    
    let accumulatedText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      onContentReceived(accumulatedText);
    }

    return parseFullRecipe(accumulatedText);
  } catch (error) {
    console.error('Error getting full recipe with Gemini:', error);
    throw new Error('Nije moguće prikazati recept trenutno. Molimo pokušajte kasnije.');
  }
}

// Legacy function for backward compatibility
export async function generateRecipes(ingredients: string[], prompt: string, servings: number = 2): Promise<Recipe[]> {
  const recipes: Recipe[] = [];
  
  await generateRecipesStreaming(ingredients, prompt, servings, 6, (recipe) => {
    recipes.push(recipe);
  });
  
  return recipes;
}

function parseFullRecipe(content: string) {
  try {
    const lines = content.split('\n').map(line => line.trim().replace(/\*\*/g, '')).filter(Boolean);
    let currentSection = '';
    const recipe = {
      title: '',
      ingredients: [] as string[],
      steps: [] as string[],
      time: '',
      tip: ''
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^[-=#*]+$/.test(line)) continue;

      if (line.toLowerCase().includes('sastojci')) {
        currentSection = 'ingredients';
        continue;
      } else if (line.toLowerCase().includes('priprema')) {
        currentSection = 'steps';
        continue;
      } else if (line.toLowerCase().includes('vreme pripreme')) {
        recipe.time = line.replace(/^vreme pripreme:\s*/i, '');
        continue;
      } else if (line.toLowerCase().includes('receptomat savet')) {
        currentSection = 'tip';
        // Collect all remaining lines as tip
        const tipLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          const tipLine = lines[j].trim();
          if (tipLine && !tipLine.toLowerCase().includes('receptomat savet')) {
            tipLines.push(tipLine);
          }
        }
        recipe.tip = tipLines.join(' ').trim();
        break; // Stop processing after collecting tip
      }

      switch (currentSection) {
        case 'ingredients':
          if (line.startsWith('-') || line.startsWith('•')) {
            recipe.ingredients.push(line.replace(/^[-•]\s*/, ''));
          } else if (/^\d+\.?\s/.test(line)) {
            recipe.ingredients.push(line.replace(/^\d+\.?\s/, ''));
          } else if (!line.toLowerCase().includes('sastojci')) {
            recipe.ingredients.push(line);
          }
          break;
        case 'steps':
          if (/^\d+\.?\s/.test(line)) {
            recipe.steps.push(line.replace(/^\d+\.?\s/, ''));
          } else if (!line.toLowerCase().includes('priprema')) {
            recipe.steps.push(line);
          }
          break;
        default:
          if (!recipe.title && !line.toLowerCase().includes('recept')) {
            recipe.title = line;
          }
      }
    }

    return {
      title: recipe.title || 'Recept bez naziva',
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      time: recipe.time || 'Vreme pripreme nije navedeno',
      tip: recipe.tip || ''
    };
  } catch (error) {
    console.error('Error parsing full recipe:', error);
    return {
      title: 'Greška pri učitavanju recepta',
      ingredients: [],
      steps: [],
      time: 'Nije dostupno',
      tip: ''
    };
  }
}