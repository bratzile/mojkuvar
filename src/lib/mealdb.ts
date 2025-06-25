// TheMealDB API integration
const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBIngredient {
  idIngredient: string;
  strIngredient: string;
  strDescription: string;
  strType: string;
}

export interface MealDBArea {
  strArea: string;
}

// Serbian translations for categories
const categoryTranslations: Record<string, string> = {
  'Beef': 'Junetina',
  'Chicken': 'Piletina',
  'Dessert': 'Dezert',
  'Lamb': 'Jagnjetina',
  'Miscellaneous': 'Ostalo',
  'Pasta': 'Testenina',
  'Pork': 'Svinjsko meso',
  'Seafood': 'Morski plodovi',
  'Side': 'Prilog',
  'Starter': 'Predjelo',
  'Vegan': 'Veganski',
  'Vegetarian': 'Vegetarijanski',
  'Breakfast': 'Doručak',
  'Goat': 'Kozje meso',
};

// Serbian translations for areas/cuisines
const areaTranslations: Record<string, string> = {
  'American': 'Američka',
  'British': 'Britanska',
  'Canadian': 'Kanadska',
  'Chinese': 'Kineska',
  'Croatian': 'Hrvatska',
  'Dutch': 'Holandska',
  'Egyptian': 'Egipatska',
  'French': 'Francuska',
  'Greek': 'Grčka',
  'Indian': 'Indijska',
  'Irish': 'Irska',
  'Italian': 'Italijanska',
  'Jamaican': 'Jamajkanska',
  'Japanese': 'Japanska',
  'Kenyan': 'Kenijska',
  'Malaysian': 'Malezijska',
  'Mexican': 'Meksička',
  'Moroccan': 'Marokanska',
  'Polish': 'Poljska',
  'Portuguese': 'Portugalska',
  'Russian': 'Ruska',
  'Spanish': 'Španska',
  'Thai': 'Tajlandska',
  'Tunisian': 'Tuniška',
  'Turkish': 'Turska',
  'Unknown': 'Nepoznata',
  'Vietnamese': 'Vijetnamska'
};

// Common ingredient translations
const ingredientTranslations: Record<string, string> = {
  // Meat & Proteins
  'Chicken': 'Piletina',
  'Beef': 'Junetina',
  'Pork': 'Svinjsko meso',
  'Lamb': 'Jagnjetina',
  'Turkey': 'Ćuretina',
  'Fish': 'Riba',
  'Salmon': 'Losos',
  'Tuna': 'Tunjevina',
  'Eggs': 'Jaja',
  'Bacon': 'Slanina',
  'Ham': 'Šunka',
  
  // Vegetables
  'Onion': 'Crni luk',
  'Garlic': 'Beli luk',
  'Tomato': 'Paradajz',
  'Potato': 'Krompir',
  'Carrot': 'Šargarepa',
  'Bell Pepper': 'Paprika',
  'Mushrooms': 'Pečurke',
  'Spinach': 'Spanać',
  'Broccoli': 'Brokoli',
  'Cucumber': 'Krastavac',
  'Lettuce': 'Zelena salata',
  'Cabbage': 'Kupus',
  'Corn': 'Kukuruz',
  'Peas': 'Grašak',
  'Green Beans': 'Boranija',
  
  // Dairy
  'Milk': 'Mleko',
  'Cheese': 'Sir',
  'Butter': 'Maslac',
  'Cream': 'Pavlaka',
  'Yogurt': 'Jogurt',
  'Mozzarella': 'Mocarela',
  'Parmesan': 'Parmezan',
  
  // Grains & Starches
  'Rice': 'Pirinač',
  'Pasta': 'Testenina',
  'Bread': 'Hleb',
  'Flour': 'Brašno',
  'Oats': 'Ovas',
  'Quinoa': 'Kvinoja',
  'Noodles': 'Rezanci',
  
  // Fruits
  'Apple': 'Jabuka',
  'Banana': 'Banana',
  'Lemon': 'Limun',
  'Orange': 'Pomorandža',
  'Strawberry': 'Jagoda',
  'Blueberry': 'Borovnica',
  'Grapes': 'Grožđe',
  'Avocado': 'Avokado',
  
  // Pantry Items
  'Salt': 'So',
  'Pepper': 'Biber',
  'Sugar': 'Šećer',
  'Oil': 'Ulje',
  'Olive Oil': 'Maslinovo ulje',
  'Vinegar': 'Sirće',
  'Honey': 'Med',
  'Soy Sauce': 'Soja sos',
  'Paprika': 'Aleva paprika',
  'Cumin': 'Kim',
  'Oregano': 'Origano',
  'Basil': 'Bosiljak',
  'Thyme': 'Majčina dušica',
  'Rosemary': 'Ruzmarin',
  'Bay Leaves': 'Lovorov list',
  'Cinnamon': 'Cimet',
  'Ginger': 'Đumbir',
  'Nutmeg': 'Muškatni orah',
  'Vanilla': 'Vanila'
};

export async function fetchCategories(): Promise<MealDBCategory[]> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/list.php?c=list`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchIngredients(): Promise<MealDBIngredient[]> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/list.php?i=list`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
}

export async function fetchAreas(): Promise<MealDBArea[]> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/list.php?a=list`);
    if (!response.ok) throw new Error('Failed to fetch areas');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}

// Helper functions for translations
export function translateCategory(category: string): string {
  return categoryTranslations[category] || category;
}

export function translateArea(area: string): string {
  return areaTranslations[area] || area;
}

export function translateIngredient(ingredient: string): string {
  // Try exact match first
  if (ingredientTranslations[ingredient]) {
    return ingredientTranslations[ingredient];
  }
  
  // Try partial matches for compound ingredients
  for (const [english, serbian] of Object.entries(ingredientTranslations)) {
    if (ingredient.toLowerCase().includes(english.toLowerCase())) {
      return ingredient.replace(new RegExp(english, 'gi'), serbian);
    }
  }
  
  return ingredient;
}

// Organize ingredients by category for better UX
export function organizeIngredientsByCategory(ingredients: MealDBIngredient[]) {
  const categories = {
    meat: {
      name: 'Meso i proteini',
      icon: '🥩',
      items: [] as string[]
    },
    vegetables: {
      name: 'Povrće',
      icon: '🥕',
      items: [] as string[]
    },
    dairy: {
      name: 'Mlečni proizvodi',
      icon: '🧀',
      items: [] as string[]
    },
    grains: {
      name: 'Žitarice i osnove',
      icon: '🌾',
      items: [] as string[]
    },
    fruits: {
      name: 'Voće',
      icon: '🍎',
      items: [] as string[]
    },
    spices: {
      name: 'Začini i dodatci',
      icon: '🧂',
      items: [] as string[]
    },
    pantry: {
      name: 'Ostalo',
      icon: '🥫',
      items: [] as string[]
    }
  };

  const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'fish', 'salmon', 'tuna', 'bacon', 'ham', 'egg'];
  const vegetableKeywords = ['onion', 'garlic', 'tomato', 'potato', 'carrot', 'pepper', 'mushroom', 'spinach', 'broccoli', 'cucumber', 'lettuce', 'cabbage', 'corn', 'peas', 'beans'];
  const dairyKeywords = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'mozzarella', 'parmesan'];
  const grainKeywords = ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'noodle'];
  const fruitKeywords = ['apple', 'banana', 'lemon', 'orange', 'strawberry', 'blueberry', 'grape', 'avocado'];
  const spiceKeywords = ['salt', 'pepper', 'paprika', 'cumin', 'oregano', 'basil', 'thyme', 'rosemary', 'bay', 'cinnamon', 'ginger', 'nutmeg', 'vanilla'];

  ingredients.forEach(ingredient => {
    const name = ingredient.strIngredient.toLowerCase();
    const translatedName = translateIngredient(ingredient.strIngredient);

    if (meatKeywords.some(keyword => name.includes(keyword))) {
      categories.meat.items.push(translatedName);
    } else if (vegetableKeywords.some(keyword => name.includes(keyword))) {
      categories.vegetables.items.push(translatedName);
    } else if (dairyKeywords.some(keyword => name.includes(keyword))) {
      categories.dairy.items.push(translatedName);
    } else if (grainKeywords.some(keyword => name.includes(keyword))) {
      categories.grains.items.push(translatedName);
    } else if (fruitKeywords.some(keyword => name.includes(keyword))) {
      categories.fruits.items.push(translatedName);
    } else if (spiceKeywords.some(keyword => name.includes(keyword))) {
      categories.spices.items.push(translatedName);
    } else {
      categories.pantry.items.push(translatedName);
    }
  });

  // Sort items within each category
  Object.values(categories).forEach(category => {
    category.items.sort();
  });

  return categories;
}