import sastojciData from '../data/sastojci-clean.json';

export interface LocalIngredient {
  sastojakID: string;
  sastojakNAME: string;
  category: string;
  availableInSerbia: boolean;
  serbianName?: string;
}

// Comprehensive Serbian translations for ingredients
const serbianTranslations: Record<string, string> = {
  // Meat & Proteins
  'Chicken': 'Pile',
  'Chicken Breast': 'Pileće grudi',
  'Chicken Leg': 'Pileći batak',
  'Chicken Thigh': 'Pileća krilca',
  'Chicken Stock': 'Pileći bujon',
  'Beef': 'Junetina',
  'Beef Brisket': 'Juneći pršut',
  'Beef Fillet': 'Juneći file',
  'Beef Stock': 'Juneći bujon',
  'Ground Beef': 'Mlevena junetina',
  'Minced Beef': 'Mlevena junetina',
  'Pork': 'Svinjsko meso',
  'Pork Chop': 'Svinjski kotlet',
  'Ground Pork': 'Mlevena svinjetina',
  'Minced Pork': 'Mlevena svinjetina',
  'Lamb': 'Jagnjetina',
  'Lamb Loin Chop': 'Jagnjeći kotlet',
  'Lamb Mince': 'Mlevena jagnjetina',
  'Lamb Leg': 'Jagnjeća noga',
  'Lamb Shoulder': 'Jagnjeća plećka',
  'Salmon': 'Losos',
  'Tuna': 'Tunjevina',
  'Cod': 'Bakalar',
  'Haddock': 'Bakalar',
  'Smoked Salmon': 'Dimljeni losos',
  'Mackerel': 'Skuša',
  'Sardine': 'Sardina',
  'Red Snapper': 'Crvena riba',
  'White Fish': 'Bela riba',
  'Fish Stock': 'Ribji bujon',
  'Prawn': 'Kozica',
  'King Prawn': 'Kraljevska kozica',
  'Mussel': 'Dagnja',
  'Clam': 'Školjka',
  'Squid': 'Lignja',
  'Oyster': 'Ostriga',
  'Egg': 'Jaje',
  'Bacon': 'Slanina',
  'Ham': 'Šunka',
  'Prosciutto': 'Pršuta',
  'Chorizo': 'Čorizo',
  'Sausage': 'Kobasica',
  'Turkey Mince': 'Mlevena ćuretina',
  'Duck': 'Patka',
  'Veal': 'Teletina',
  'Goat Meat': 'Kozje meso',
  'Tripe': 'Tripice',
  'Oxtail': 'Volovska repa',
  'Anchovy Fillet': 'Inćun filet',
  'Herring': 'Haringa',
  'Monkfish': 'Morski vrag',
  'Kielbasa': 'Kijelbasa',
  'Tofu': 'Tofu',

  // Vegetables
  'Onion': 'Crni luk',
  'Yellow Onion': 'Žuti luk',
  'Red Onion': 'Crveni luk',
  'Spring Onion': 'Mladi luk',
  'Scallion': 'Mladi luk',
  'Shallot': 'Šalot luk',
  'Garlic': 'Beli luk',
  'Tomato': 'Paradajz',
  'Chopped Tomato': 'Seckan paradajz',
  'Diced Tomato': 'Paradajz na kockice',
  'Plum Tomato': 'Šljiva paradajz',
  'Cherry Tomato': 'Čeri paradajz',
  'Potato': 'Krompir',
  'Floury Potato': 'Brašnast krompir',
  'Charlotte Potato': 'Šarlot krompir',
  'Sweet Potato': 'Slatki krompir',
  'Carrot': 'Šargarepa',
  'Red Pepper': 'Crvena paprika',
  'Yellow Pepper': 'Žuta paprika',
  'Green Pepper': 'Zelena paprika',
  'Mushroom': 'Pečurka',
  'Chestnut Mushroom': 'Kestenjasta pečurka',
  'Shiitake Mushroom': 'Šitake pečurka',
  'Wild Mushroom': 'Divlja pečurka',
  'Spinach': 'Spanać',
  'Broccoli': 'Brokoli',
  'Chinese Broccoli': 'Kineski brokoli',
  'Cucumber': 'Krastavac',
  'Lettuce': 'Zelena salata',
  'Iceberg Lettuce': 'Ledena salata',
  'Rocket': 'Rukola',
  'Cabbage': 'Kupus',
  'Sweetcorn': 'Slatki kukuruz',
  'Pea': 'Grašak',
  'Frozen Pea': 'Smrznut grašak',
  'Green Bean': 'Boranija',
  'Asparagus': 'Špargle',
  'Aubergine': 'Plavi patlidžan',
  'Egg Plant': 'Plavi patlidžan',
  'Courgette': 'Tikvica',
  'Zucchini': 'Tikvica',
  'Squash': 'Bundeva',
  'Butternut Squash': 'Buternat bundeva',
  'Pumpkin': 'Bundeva',
  'Celery': 'Celer',
  'Celeriac': 'Celer koren',
  'Fennel': 'Morač',
  'Fennel Bulb': 'Morač glavica',
  'Leek': 'Praziluk',
  'Brussels Sprout': 'Kelj',
  'Kale': 'Kelj',
  'Turnip': 'Repa',
  'Beetroot': 'Cvekla',
  'Bean Sprout': 'Klice graha',
  'Sauerkraut': 'Kiseli kupus',

  // Dairy & Eggs
  'Milk': 'Mleko',
  'Whole Milk': 'Puno mleko',
  'Almond Milk': 'Bademovo mleko',
  'Cheese': 'Sir',
  'Cheddar Cheese': 'Čedar sir',
  'Mozzarella': 'Mocarela',
  'Mozzarella Ball': 'Mocarela kuglica',
  'Parmesan': 'Parmezan',
  'Pecorino': 'Pekorno',
  'Gruyère': 'Grujere',
  'Gouda Cheese': 'Gauda sir',
  'Cheese Slice': 'Sirni list',
  'Feta': 'Feta sir',
  'Ricotta': 'Rikota',
  'Mascarpone': 'Maskarpone',
  'Cream Cheese': 'Krem sir',
  'Goats Cheese': 'Kozji sir',
  'Brie': 'Bri sir',
  'Paneer': 'Paner',
  'Butter': 'Maslac',
  'Cream': 'Pavlaka',
  'Heavy Cream': 'Gusta pavlaka',
  'Double Cream': 'Dupla pavlaka',
  'Sour Cream': 'Kisela pavlaka',
  'Yogurt': 'Jogurt',
  'Greek Yogurt': 'Grčki jogurt',
  'Full Fat Yogurt': 'Punomasni jogurt',
  'Condensed Milk': 'Kondenzoano mleko',
  'Ice Cream': 'Sladoled',
  'Custard': 'Puding',

  // Grains & Starches
  'Rice': 'Pirinač',
  'Basmati Rice': 'Basmati pirinač',
  'Brown Rice': 'Braon pirinač',
  'Jasmine Rice': 'Jasmin pirinač',
  'Paella Rice': 'Paela pirinač',
  'Sushi Rice': 'Suši pirinač',
  'Spaghetti': 'Špageti',
  'Penne Rigate': 'Pene rigate',
  'Farfalle': 'Farfale',
  'Macaroni': 'Makaroni',
  'Rigatoni': 'Rigatoni',
  'Tagliatelle': 'Taljatele',
  'Fettuccine': 'Fetučini',
  'Linguine Pasta': 'Špageti',
  'Noodle': 'Nudle',
  'Rice Noodle': 'Pirinčani rezanac',
  'Bread': 'Hleb',
  'Crusty Bread': 'Hrskav hleb',
  'Bread Roll': 'Zemička',
  'Bun': 'Zemička',
  'Baguette': 'Baget',
  'Ciabatta': 'Čabata',
  'Pita Bread': 'Pita hleb',
  'Flour': 'Brašno',
  'Plain Flour': 'Obično brašno',
  'White Flour': 'Belo brašno',
  'Corn Flour': 'Kukuruzno brašno',
  'Rolled Oat': 'Ovsene pahuljice',
  'Oatmeal': 'Ovsena kaša',
  'Oat': 'Ovas',
  'Quinoa': 'Kvinoja',
  'Bulgur Wheat': 'Bulgur',
  'Couscous': 'Kuskus',
  'Buckwheat': 'Heljda',
  'Whole Wheat': 'Celo zrno pšenice',
  'Puff Pastry': 'Lisnato testo',

  // Fruits
  'Apple': 'Jabuka',
  'Bramley Apple': 'Bramli jabuka',
  'Banana': 'Banana',
  'Lemon': 'Limun',
  'Orange': 'Pomorandža',
  'Lime': 'Lajm',
  'Strawberry': 'Jagoda',
  'Raspberry': 'Malina',
  'Blueberry': 'Borovnica',
  'Blackberry': 'Kupina',
  'Currant': 'Ribizla',
  'Raisin': 'Grožđica',
  'Avocado': 'Avokado',
  'Peach': 'Breskva',
  'Pear': 'Kruška',
  'Apricot': 'Kajsija',
  'Dried Apricot': 'Sušena kajsija',
  'Fig': 'Smokva',
  'Cherry': 'Trešnja',
  'Rhubarb': 'Rabarbara',
  'Prune': 'Sušena šljiva',

  // Nuts & Seeds
  'Almond': 'Badem',
  'Ground Almond': 'Mleveni badem',
  'Flaked Almond': 'Bademove pahuljice',
  'Walnut': 'Orah',
  'Pecan Nut': 'Pekan orah',
  'Hazelnut': 'Lešnik',
  'Cashew Nut': 'Indijski orah',
  'Peanut': 'Kikiriki',
  'Pine Nut': 'Pinjol',
  'Sesame Seed': 'Susam',
  'Chestnut': 'Kesten',

  // Spices & Herbs
  'Basil': 'Bosiljak',
  'Fresh Basil': 'Svež bosiljak',
  'Oregano': 'Origano',
  'Dried Oregano': 'Sušeni origano',
  'Thyme': 'Majčina dušica',
  'Fresh Thyme': 'Sveža majčina dušica',
  'Rosemary': 'Ruzmarin',
  'Sage': 'Žalfija',
  'Parsley': 'Peršun',
  'Cilantro': 'Cilantro',
  'Coriander': 'Korijander',
  'Dill': 'Kopar',
  'Mint': 'Nana',
  'Chive': 'Vlasac',
  'Marjoram': 'Majoran',
  'Bay Leaf': 'Lovorov list',
  'Paprika': 'Aleva paprika',
  'Smoked Paprika': 'Dimljena paprika',
  'Cumin': 'Kim',
  'Ground Cumin': 'Mleveni kim',
  'Turmeric': 'Kurkuma',
  'Cinnamon': 'Cimet',
  'Ginger': 'Đumbir',
  'Ground Ginger': 'Mleveni đumbir',
  'Nutmeg': 'Muškatni orah',
  'Clove': 'Klinčić',
  'Cardamom': 'Kardamom',
  'Star Anise': 'Zvezdasti anis',
  'Fennel Seed': 'Seme morča',
  'Fenugreek': 'Piskavica',
  'Mustard Seed': 'Seme gorčice',
  'Mustard Powder': 'Gorčica u prahu',
  'Saffron': 'Šafran',
  'Vanilla': 'Vanila',
  'Vanilla Extract': 'Ekstrakt vanile',
  'Almond Extract': 'Ekstrakt badema',
  'Allspice': 'Četiri začina',
  'Italian Seasoning': 'Italijanski začini',
  'Cajun': 'Kajun začini',
  'Garam Masala': 'Garam masala',
  'Curry Powder': 'Kari u prahu',
  'Chilli': 'Čili paprika',
  'Green Chilli': 'Zelena čili paprika',
  'Chili Powder': 'Čili u prahu',
  'Cayenne Pepper': 'Kajenska paprika',
  'Jalapeno': 'Halapeno',
  'Scotch Bonnet': 'Škotski klobuk',
  'Sichuan Pepper': 'Sičuan biber',
  'Garlic Powder': 'Beli luk u prahu',
  'Horseradish': 'Ren',
  'Caraway Seed': 'Seme kima',

  // Pantry Items & Condiments
  'Salt': 'So',
  'Sea Salt': 'Morska so',
  'Kosher Salt': 'Košer so',
  'Pepper': 'Biber',
  'Black Pepper': 'Crni biber',
  'Sugar': 'Šećer',
  'Brown Sugar': 'Braon šećer',
  'Dark Brown Sugar': 'Tamno braon šećer',
  'Caster Sugar': 'Kristal šećer',
  'Granulated Sugar': 'Granulisani šećer',
  'Demerara Sugar': 'Demerara šećer',
  'Muscovado Sugar': 'Muskavado šećer',
  'Icing Sugar': 'Šećer u prahu',
  'Powdered Sugar': 'Šećer u prahu',
  'Oil': 'Ulje',
  'Olive Oil': 'Maslinovo ulje',
  'Extra Virgin Olive Oil': 'Ekstra devičansko maslinovo ulje',
  'Vegetable Oil': 'Biljno ulje',
  'Sunflower Oil': 'Suncokretovo ulje',
  'Rapeseed Oil': 'Ulje uljane repice',
  'Canola Oil': 'Kanola ulje',
  'Sesame Seed Oil': 'Susam ulje',
  'Vinegar': 'Sirće',
  'Apple Cider Vinegar': 'Jabukovo sirće',
  'Balsamic Vinegar': 'Balzamiko sirće',
  'White Vinegar': 'Belo sirće',
  'White Wine Vinegar': 'Belo vino sirće',
  'Red Wine Vinegar': 'Crveno vino sirće',
  'Rice Vinegar': 'Pirinčano sirće',
  'Malt Vinegar': 'Slad sirće',
  'Honey': 'Med',
  'Maple Syrup': 'Javorov sirup',
  'Golden Syrup': 'Zlatni sirup',
  'Treacle': 'Melasa',
  'Jam': 'Džem',
  'Raspberry Jam': 'Malina džem',
  'Apricot Jam': 'Kajsija džem',
  'Water': 'Voda',
  'Lemon Juice': 'Limunov sok',
  'Lemon Zest': 'Limunova kora',
  'Orange Zest': 'Pomorandžina kora',
  'Tomato Ketchup': 'Kečap',
  'Tomato Puree': 'Paradajz pire',
  'Tomato Sauce': 'Paradajz sos',
  'Passata': 'Pasirana paradajz',
  'Cornstarch': 'Kukuruzni skrob',
  'Potato Starch': 'Krompir skrob',
  'Starch': 'Skrob',
  'Baking Powder': 'Prašak za pecivo',
  'Yeast': 'Kvasac',
  'Shortening': 'Mast za pecivo',

  // Sauces & Condiments
  'Soy Sauce': 'Soja sos',
  'Dark Soy Sauce': 'Tamni soja sos',
  'Fish Sauce': 'Ribji sos',
  'Oyster Sauce': 'Kamenica sos',
  'Worcestershire Sauce': 'Vusteršir sos',
  'Tabasco Sauce': 'Tabasko sos',
  'Sriracha': 'Sriracha',
  'Barbeque Sauce': 'Barbekju sos',
  'Salsa': 'Salsa',
  'Mayonnaise': 'Majonez',
  'Mustard': 'Senf',
  'Dijon Mustard': 'Dijon senf',
  'Green Olive': 'Zelena maslina',
  'Black Olive': 'Crna maslina',
  'Pitted Black Olive': 'Crna maslina bez koštica',
  'Caper': 'Kapar',

  // Baking & Dessert
  'Cocoa': 'Kakao',
  'Cacao': 'Kakao',
  'Chocolate Chip': 'Čokoladna kapljica',
  'Plain Chocolate': 'Obična čokolada',
  'Dark Chocolate': 'Tamna čokolada',
  'Milk Chocolate': 'Mlečna čokolada',
  'White Chocolate': 'Bela čokolada',
  'Caramel': 'Karamela',
  'Marzipan': 'Marcipan',

  // Beverages & Alcohol
  'Red Wine': 'Crveno vino',
  'White Wine': 'Belo vino',
  'Dry White Wine': 'Suvo belo vino',
  'Brandy': 'Konjak',
  'Rum': 'Rum',
  'Dark Rum': 'Tamni rum',
  'Light Rum': 'Svetli rum',
  'Sake': 'Sake',
  'Stout': 'Staut pivo',
  'Cider': 'Jabukovača',

  // Stocks & Broths
  'Vegetable Stock': 'Biljni bujon',

  // Specialty Items
  'Ghee': 'Gi (prečišćeni maslac)',
  'Tahini': 'Tahini',
  'Peanut Butter': 'Kikiriki maslac',
  'Coconut Milk': 'Kokosovo mleko',
  'Coconut Cream': 'Kokosova pavlaka',
  'Desiccated Coconut': 'Kokos u prahu',
  'Mirin': 'Mirin'
};

export function getLocalIngredients(): LocalIngredient[] {
  return sastojciData.Sastojci
    .filter(ingredient => ingredient.availableInSerbia) // Filter out unavailable ingredients
    .map(ingredient => ({
      ...ingredient,
      serbianName: translateToSerbian(ingredient.sastojakNAME)
    }));
}

export function translateToSerbian(englishName: string): string {
  // Try exact match first
  if (serbianTranslations[englishName]) {
    return serbianTranslations[englishName];
  }
  
  // Try partial matches for compound ingredients
  for (const [english, serbian] of Object.entries(serbianTranslations)) {
    if (englishName.toLowerCase().includes(english.toLowerCase())) {
      return englishName.replace(new RegExp(english, 'gi'), serbian);
    }
  }
  
  // If no translation found, return original name
  return englishName;
}

// Organize ingredients by category for better UX (removed legumes category)
export function organizeLocalIngredientsByCategory(ingredients: LocalIngredient[]) {
  const categories = {
    meat: {
      name: 'Meso i proteini',
      icon: '🥩',
      items: [] as LocalIngredient[]
    },
    vegetables: {
      name: 'Povrće',
      icon: '🥕',
      items: [] as LocalIngredient[]
    },
    dairy: {
      name: 'Mlečni proizvodi',
      icon: '🧀',
      items: [] as LocalIngredient[]
    },
    grains: {
      name: 'Žitarice i testenine',
      icon: '🌾',
      items: [] as LocalIngredient[]
    },
    fruits: {
      name: 'Voće',
      icon: '🍎',
      items: [] as LocalIngredient[]
    },
    nuts: {
      name: 'Orašasti plodovi',
      icon: '🥜',
      items: [] as LocalIngredient[]
    },
    spices: {
      name: 'Začini i biljke',
      icon: '🧂',
      items: [] as LocalIngredient[]
    },
    pantry: {
      name: 'Ostalo',
      icon: '🥫',
      items: [] as LocalIngredient[]
    }
  };

  ingredients.forEach(ingredient => {
    const categoryKey = ingredient.category as keyof typeof categories;
    // If ingredient is from legumes category, put it in pantry instead
    if (ingredient.category === 'legumes') {
      categories.pantry.items.push(ingredient);
    } else if (categories[categoryKey]) {
      categories[categoryKey].items.push(ingredient);
    } else {
      categories.pantry.items.push(ingredient);
    }
  });

  // Sort items within each category by Serbian name
  Object.values(categories).forEach(category => {
    category.items.sort((a, b) => (a.serbianName || a.sastojakNAME).localeCompare(b.serbianName || b.sastojakNAME));
  });

  return categories;
}

// Search function for ingredients
export function searchIngredients(ingredients: LocalIngredient[], query: string): LocalIngredient[] {
  if (!query.trim()) return ingredients;
  
  const searchTerm = query.toLowerCase();
  return ingredients.filter(ingredient => 
    ingredient.sastojakNAME.toLowerCase().includes(searchTerm) ||
    (ingredient.serbianName && ingredient.serbianName.toLowerCase().includes(searchTerm))
  );
}

// Get ingredients by category
export function getIngredientsByCategory(category: string): LocalIngredient[] {
  const allIngredients = getLocalIngredients();
  return allIngredients.filter(ingredient => ingredient.category === category);
}

// Get available categories for main ingredient selection (removed legumes)
export function getMainIngredientCategories() {
  return [
    {
      id: 'meat',
      name: 'Meso i proteini',
      icon: '🥩',
      description: 'Piletina, junetina, svinjsko meso, riba i ostali proteini',
      examples: ['Piletina', 'Junetina', 'Jaja', 'Riba', 'Slanina']
    },
    {
      id: 'vegetables',
      name: 'Povrće',
      icon: '🥕',
      description: 'Sveže povrće, korenje, listasto povrće i začinsko bilje',
      examples: ['Paradajz', 'Krompir', 'Luk', 'Šargarepa', 'Paprika']
    },
    {
      id: 'grains',
      name: 'Žitarice i testenine',
      icon: '🌾',
      description: 'Pirinač, testenine, hleb i ostale žitarice',
      examples: ['Pirinač', 'Špageti', 'Hleb', 'Brašno', 'Ovas']
    },
    {
      id: 'dairy',
      name: 'Mlečni proizvodi',
      icon: '🧀',
      description: 'Sir, mleko, jogurt, pavlaka i ostali mlečni proizvodi',
      examples: ['Sir', 'Mleko', 'Jogurt', 'Maslac', 'Pavlaka']
    },
    {
      id: 'fruits',
      name: 'Voće',
      icon: '🍎',
      description: 'Sveže i sušeno voće za slatka i slana jela',
      examples: ['Jabuka', 'Banana', 'Limun', 'Jagoda', 'Pomorandža']
    },
    {
      id: 'spices',
      name: 'Začini i dodatci',
      icon: '🧂',
      description: 'So, biber, začini, sosovi i ostali dodaci',
      examples: ['So', 'Biber', 'Bosiljak', 'Origano', 'Maslinovo ulje']
    },
    {
      id: 'pantry',
      name: 'Ostalo iz špajza',
      icon: '🥫',
      description: 'Konzerve, sosovi, slatkiši i ostale namirnice',
      examples: ['Kečap', 'Senf', 'Med', 'Sirće', 'Čokolada']
    }
  ];
}