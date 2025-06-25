import React, { useState, useEffect } from 'react';
import { ChefHat, Lightbulb, ArrowRight, Plus, X, Search, Loader2 } from 'lucide-react';
import { generateRecipesStreaming, resetRecipeContext } from '../lib/gemini';
import { searchIngredients, getLocalIngredients } from '../lib/ingredients';
import type { Recipe } from '../types';

interface HomePageProps {
  onNavigateToRecipes: (recipes: Recipe[], ingredients: string[]) => void;
}

// 🔥 ROTACIJSKE REČENICE - UKLONILI IKONICE
const heroMessages = [
  {
    question: "Znaš šta bi kuvao, ali frižider ti kaže \"nije danas\"?",
    answer: "Receptomat nađe put i bez jaja."
  },
  {
    question: "Recept u glavi, ali sastojci u nečijem tuđem frižideru?",
    answer: "Nema veze, snaći ćemo se."
  },
  {
    question: "Imaš ideju, ali frižider deluje pasivno-agresivno?",
    answer: "Receptomat pomiruje vas dvoje."
  },
  {
    question: "Znaš šta bi jeo, ali fali ti sve osim kečapa i vode?",
    answer: "Imamo plan. Nije kečap-supa. Obećavamo."
  },
  {
    question: "Inspiracija 100%, namirnice 12%.",
    answer: "Receptomat popunjava praznine."
  },
  {
    question: "Imaš plan, ali frižider ti kaže: \"Samo pavlaka, prijatelju.\"",
    answer: "Daj da vidimo šta se može. Spojićemo tačke."
  }
];

export function HomePage({ onNavigateToRecipes }: HomePageProps) {
  const [selectedOption, setSelectedOption] = useState<'ingredients' | 'idea' | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allIngredients] = useState(getLocalIngredients());
  const [ideaInput, setIdeaInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🔄 STATE ZA ROTACIJU PORUKA
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // 🔄 ROTACIJA PORUKA SVAKIH 4 SEKUNDE
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle ingredient search
  const handleIngredientSearch = (query: string) => {
    setNewIngredient(query);
    if (query.trim()) {
      const results = searchIngredients(allIngredients, query);
      setSearchResults(results.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  };

  // Add ingredient
  const addIngredient = (ingredient?: string) => {
    const ingredientToAdd = ingredient || newIngredient.trim();
    if (ingredientToAdd && !ingredients.includes(ingredientToAdd)) {
      setIngredients([...ingredients, ingredientToAdd]);
      setNewIngredient('');
      setSearchResults([]);
    }
  };

  // Add from search results
  const addFromSearch = (ingredient: any) => {
    const name = ingredient.serbianName || ingredient.sastojakNAME;
    addIngredient(name);
  };

  // Remove ingredient
  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  // Generate recipes from ingredients
  const generateFromIngredients = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    const recipes: Recipe[] = [];

    try {
      resetRecipeContext();
      
      await generateRecipesStreaming(
        ingredients,
        `Dostupni sastojci: ${ingredients.join(', ')}. Broj porcija: 2.`,
        2,
        5,
        (recipe) => {
          recipes.push(recipe);
        }
      );

      onNavigateToRecipes(recipes, ingredients);
    } catch (error) {
      console.error('Error generating recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate recipes from idea
  const generateFromIdea = async () => {
    if (!ideaInput.trim()) return;

    setLoading(true);
    const recipes: Recipe[] = [];

    try {
      resetRecipeContext();
      
      await generateRecipesStreaming(
        [],
        ideaInput.trim(),
        2,
        5,
        (recipe) => {
          recipes.push(recipe);
        }
      );

      onNavigateToRecipes(recipes, []);
    } catch (error) {
      console.error('Error generating recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToHome = () => {
    setSelectedOption(null);
    setIngredients([]);
    setNewIngredient('');
    setSearchResults([]);
    setIdeaInput('');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Loader2 size={48} className="animate-spin text-orange-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Receptomat razmišlja...</h3>
        <p className="text-gray-300">Kreiram personalizovane recepte za tebe</p>
      </div>
    );
  }

  if (selectedOption === 'ingredients') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={resetToHome}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8"
        >
          ← Nazad na početnu
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Imam sastojke - šta mogu da skuvam?
          </h2>
          <p className="text-xl text-gray-300">
            Unesi sastojke koje imaš i ja ću ti predložiti recepte
          </p>
        </div>

        {/* Add Ingredient Input */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 relative">
                <Search size={20} className="text-green-300 flex-shrink-0" />
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => handleIngredientSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="Dodaj sastojak (npr. piletina, paradajz...)"
                  className="flex-1 bg-transparent text-green-300 placeholder-green-400/70 focus:outline-none"
                />
                <button
                  onClick={() => addIngredient()}
                  disabled={!newIngredient.trim()}
                  className="text-green-300 hover:text-green-200 disabled:text-green-600 p-1"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Search Results Dropdown - BEZ SLIKA */}
              {searchResults.length > 0 && (
                <div className="mt-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-32 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((ingredient, index) => (
                      <button
                        key={index}
                        onClick={() => addFromSearch(ingredient)}
                        className="w-full text-left p-2 hover:bg-gray-700 rounded text-white text-sm"
                      >
                        {ingredient.serbianName || ingredient.sastojakNAME}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Ingredients */}
        {ingredients.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Odabrani sastojci ({ingredients.length})
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg animate-fade-in"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generateFromIngredients}
            disabled={ingredients.length === 0}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg ${
              ingredients.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transform hover:scale-105 shadow-lg'
            }`}
          >
            <ChefHat size={24} />
            Prikaži mi recepte
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Helpful Tips */}
        <div className="mt-12 bg-blue-600/10 border border-blue-600/30 rounded-xl p-6 text-center">
          <p className="text-blue-300 text-sm">
            💡 <strong>Savet:</strong> Što više sastojaka dodaš, to će recepti biti raznovrsniji i ukusniji!
          </p>
        </div>
      </div>
    );
  }

  if (selectedOption === 'idea') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={resetToHome}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8"
        >
          ← Nazad na početnu
        </button>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="text-6xl mb-4">💭</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Imam ideju - pomozi mi da je realizujem
          </h2>
          <p className="text-xl text-gray-300">
            Opiši šta želiš da kuvaš i ja ću ti naći način
          </p>
        </div>

        {/* Idea Input */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-6">
              <textarea
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Npr: 'Daj mi recept za pečenu piletinu', 'Hoću palačinke, ali nemam brašno', 'Želim nešto slatko za desert'..."
                className="w-full h-32 bg-transparent text-purple-300 placeholder-purple-400/70 focus:outline-none resize-none text-lg"
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generateFromIdea}
            disabled={!ideaInput.trim()}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg ${
              !ideaInput.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transform hover:scale-105 shadow-lg'
            }`}
          >
            <Lightbulb size={24} />
            Realizuj moju ideju
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Examples */}
        <div className="mt-12 bg-amber-600/10 border border-amber-600/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-300 mb-4 text-center">Primeri pitanja:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Daj mi recept za pečenu piletinu",
              "Hoću palačinke, ali nemam brašno",
              "Želim nešto slatko za desert",
              "Kako da napravim pastu bez mesa?",
              "Trebam brz obrok za večeru",
              "Hoću zdravu salatu sa piletinom"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setIdeaInput(example)}
                className="text-left p-3 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-200 text-sm transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Homepage - SA ROTACIJSKIM PORUKAMA
  return (
    <div className="max-w-7xl mx-auto space-y-16">
      {/* 🎯 CENTAR STRANE - ROTACIJSKE PORUKE + Dva glavna dugmeta */}
      <section className="text-center animate-fade-in-up">
        {/* 🔥 ROTACIJSKE PORUKE - RESPONSIVE LAYOUT */}
        <div className="mb-12">
          {/* Desktop Layout - 1/3 tekst, 2/3 poruke */}
          <div className="hidden lg:flex items-center justify-between max-w-6xl mx-auto">
            {/* Levi deo - Glavni naslov (1/3) */}
            <div className="w-1/3 text-left pr-8">
              <h1 style={{ fontSize: '2rem' }} className="font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent leading-tight">
                Glava puna, frižider prazan? Obrnuto?
              </h1>
            </div>
            
            {/* Desni deo - Rotacijske poruke (90% width) */}
            <div className="w-2/3 pl-8" style={{ width: '90%' }}>
              <div 
                key={currentMessageIndex}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 animate-fade-in-up"
              >
                <div className="space-y-4">
                  <p className="text-2xl text-gray-300 leading-relaxed">
                    {heroMessages[currentMessageIndex].question}
                  </p>
                  <p className="text-2xl text-amber-400 font-semibold">
                    {heroMessages[currentMessageIndex].answer}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Sve u koloni */}
          <div className="lg:hidden space-y-6">
            {/* Glavni naslov */}
            <h1 style={{ fontSize: '2rem' }} className="font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent leading-tight">
              Glava puna, frižider prazan? Obrnuto?
            </h1>
            
            {/* Rotacijska poruka */}
            <div 
              key={currentMessageIndex}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 animate-fade-in-up"
            >
              <div className="space-y-3">
                <p className="text-lg text-gray-300 leading-relaxed">
                  {heroMessages[currentMessageIndex].question}
                </p>
                <p className="text-lg text-amber-400 font-semibold">
                  {heroMessages[currentMessageIndex].answer}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔥 NOVA SEKCIJA - IMAM SASTOJKE / IMAM IDEJU - FULL WIDTH SA UKOSNIM RAZDELOM */}
        <div className="relative bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-3xl overflow-hidden border border-gray-700/50 mb-16">
          {/* Ukosni razdel */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent transform skew-y-1 origin-top-left"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-purple-500/10 to-transparent transform -skew-y-1 origin-top-right"></div>
          
          <div className="relative grid md:grid-cols-2 min-h-[400px]">
            {/* Leva strana - Imam sastojke */}
            <div 
              onClick={() => setSelectedOption('ingredients')}
              className="group p-8 cursor-pointer transition-all duration-300 hover:bg-orange-500/10 flex flex-col justify-center items-center text-center relative"
            >
              {/* Ukosna linija razdela - vidljiva samo na desktop */}
              <div className="hidden md:block absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-gray-600 to-transparent transform rotate-12 origin-top"></div>
              
              <div className="text-6xl mb-6">🍽️</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Imam sastojke
              </h3>
              <p className="text-xl text-gray-300 mb-6">
                Šta mogu da napravim?
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                Unesi sastojke koje imaš kod kuće i ja ću ti predložiti recepte koje možeš da napraviš odmah.
              </p>
              
              {/* Examples */}
              <div className="bg-orange-500/10 rounded-xl p-4 mb-6 max-w-sm">
                <p className="text-orange-300 text-sm font-medium mb-2">Primeri sastojaka:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Piletina', 'Paradajz', 'Luk', 'Pirinač', 'Sir'].map((ingredient) => (
                    <span key={ingredient} className="bg-orange-500/20 text-orange-200 px-2 py-1 rounded-full text-xs">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-orange-400 font-semibold group-hover:text-orange-300 transition-colors">
                Počni ovde
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Desna strana - Imam ideju */}
            <div 
              onClick={() => setSelectedOption('idea')}
              className="group p-8 cursor-pointer transition-all duration-300 hover:bg-purple-500/10 flex flex-col justify-center items-center text-center"
            >
              <div className="text-6xl mb-6">💭</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Imam ideju
              </h3>
              <p className="text-xl text-gray-300 mb-6">
                Pomozi mi da je realizujem
              </p>
              <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                Opiši šta želiš da kuvaš ili kakav problem imaš, a ja ću ti naći rešenje i recepte.
              </p>
              
              {/* Examples */}
              <div className="bg-purple-500/10 rounded-xl p-4 mb-6 max-w-sm">
                <p className="text-purple-300 text-sm font-medium mb-2">Primeri pitanja:</p>
                <div className="space-y-1 text-xs text-purple-200">
                  <div>"Hoću palačinke, ali nemam brašno"</div>
                  <div>"Daj mi recept za pečenu piletinu"</div>
                  <div>"Trebam brz obrok za večeru"</div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                Počni ovde
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔼 GORNJA SEKCIJA - Zašto je Receptomat poseban? - SADA ISPOD OPCIJA */}
      <section className="animate-fade-in-up delay-600">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Zašto je Receptomat poseban?
        </h2>
        
        {/* 6 blokova - 3 kolone u 2 reda na desktopu, 1 kolona na mobilu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Kartica 1 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up">
            <div className="text-4xl mb-4">🗑️❌</div>
            <h3 className="text-xl font-bold text-white mb-3">Ne baca hranu. Nikad.</h3>
            <p className="text-gray-300 leading-relaxed">
              Imaš pola luka, dve šargarepe i konzervu pasulja? Receptomat kaže: „Savršeno! Pravimo čili!" On ne kuka – on kombinuje.
            </p>
          </div>

          {/* Kartica 2 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up delay-100">
            <div className="text-4xl mb-4">🧠❄️</div>
            <h3 className="text-xl font-bold text-white mb-3">Razume „prazan frižider" bolje od tebe</h3>
            <p className="text-gray-300 leading-relaxed">
              Ti vidiš kečap i pavlaku. Receptomat vidi sos, marinadu, možda i remek-delo.
            </p>
          </div>

          {/* Kartica 3 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up delay-200">
            <div className="text-4xl mb-4">🎭🚫</div>
            <h3 className="text-xl font-bold text-white mb-3">Ne pravi dramu kad ti fali sastojak</h3>
            <p className="text-gray-300 leading-relaxed">
              Nemaš jaje? Nema veze. Banana, lan ili – ništa. Snalažljivost je drugi začin.
            </p>
          </div>

          {/* Kartica 4 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up delay-300">
            <div className="text-4xl mb-4">⚡🔍</div>
            <h3 className="text-xl font-bold text-white mb-3">Brži od guglanja „šta da kuvam danas"</h3>
            <p className="text-gray-300 leading-relaxed">
              Bez skrolovanja po blogovima iz 2009. Dobijaš recept odmah – po svojoj meri.
            </p>
          </div>

          {/* Kartica 5 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up delay-400">
            <div className="text-4xl mb-4">🏠❤️</div>
            <h3 className="text-xl font-bold text-white mb-3">Zna domaće, voli tvoje</h3>
            <p className="text-gray-300 leading-relaxed">
              Ne nudi ti kvinoju ako nisi tražio kvinoju. Zna šta je kajmak. Poštuje ajvar.
            </p>
          </div>

          {/* Kartica 6 */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up delay-500">
            <div className="text-4xl mb-4">💡🧠</div>
            <h3 className="text-xl font-bold text-white mb-3">Inspiracija kad ti mozak stane</h3>
            <p className="text-gray-300 leading-relaxed">
              "Hoću nešto slatko, bez rerne" – kažeš ti. Receptomat kaže: "Evo ti 3 varijante."
            </p>
          </div>
        </div>
      </section>

      {/* 🔽 DONJA SEKCIJA - Kome sve Receptomat pomaže? - AŽURIRANI SADRŽAJ U 2 KOLONE */}
      <section className="animate-fade-in-up delay-800">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Kome sve Receptomat pomaže?
        </h2>
        
        {/* 8 profila korisnika - 2 kolone na desktopu (UKLONJEN VIKENDICA PROFIL) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profil 1: Studenti */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🎓 Studentski meni: 3 sastojka i nada</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „U frižideru mi ostali kečap, pola luka, parče hleba i energija na minimumu."
              </p>
              <p className="text-green-400 font-semibold text-sm">
                Receptomat: „Ti si na pragu studentske pice!" 🍕
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Dodaj malo mašte, Receptomat da recept – i za 10 minuta jedeš kao car. Bez kreditne kartice, bez suza.
              </p>
            </div>
          </div>

          {/* Profil 2: Porodice */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">👨‍👩‍👧‍👦 Porodični ručak bez drame</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „Imam brokoli. Deca već prevrću očima."
              </p>
              <p className="text-blue-400 font-semibold text-sm">
                Receptomat: „Zovem backup – praviš brokoli u sosu sa sirom i nudlama."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Klinci jedu, niko ne plače, ti ne gubiš živce. Mali kulinarski mir u kući.
              </p>
            </div>
          </div>

          {/* Profil 3: Noćni napadi */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🌙 Treće otvaranje frižidera: sad ozbiljno</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „U 01:12 noću imam viršle, pavlaku i tortilje."
              </p>
              <p className="text-purple-400 font-semibold text-sm">
                Receptomat: „Brzinski hot-dog wrap sa pavlakom? Rešenje za miran san."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ne moraš da naručuješ. Tvoj frižider krije više nego što misliš. I to bez dostavne drame.
              </p>
            </div>
          </div>

          {/* Profil 4: Gejmeri */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🎮 Gejmerski obrok između dva gejma</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „Imam pola pakovanja čipsa, pola flaše soka i osećaj da drugar neće da sačeka."
              </p>
              <p className="text-orange-400 font-semibold text-sm">
                Receptomat: „Pravimo brzinski energetski sendvič – hrana koja ne remeti koncentraciju."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Da preživiš raid i još imaš snage za encore.
              </p>
            </div>
          </div>

          {/* Profil 5: Bake i deke */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🧓 Bakin zamrzivač – nacionalno blago</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „Imam zaleđenu sarmu iz 2018. i nešto što možda nije pasulj."
              </p>
              <p className="text-yellow-400 font-semibold text-sm">
                Receptomat: „Odmrzavamo, kuvamo, začinimo i pravimo remek-delo."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ništa se ne baca – sve se transformiše. I baku zoveš da joj kažeš da je čudo.
              </p>
            </div>
          </div>

          {/* Profil 6: Netflix večeri */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🛋️ Netflix &… pa šta ima u frižideru?</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „Film je počeo, a ja imam samo pavlaku i kukuruz u konzervi."
              </p>
              <p className="text-red-400 font-semibold text-sm">
                Receptomat: „Grickalice iz frižidera – misija moguća."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Brzi sos, kukuruzni dip, improvizovani nachosi? Veče je spašeno.
              </p>
            </div>
          </div>

          {/* Profil 7: Mamurluk */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🍻 Mamurluk level: tost i kajanje</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „U frižideru imam sok od paradajza, bajat hleb i pogled pun tuge."
              </p>
              <p className="text-pink-400 font-semibold text-sm">
                Receptomat: „Pravimo anti-mamurluk supicu ili spašavamo stvar jajima na sve moguće načine."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nije magija, ali je najbliže što ima.
              </p>
            </div>
          </div>

          {/* Profil 8: Zaboravljivci */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300">
            <h3 className="text-xl font-bold text-white mb-3">🧠 Zaboravio/la sam da idem u prodavnicu</h3>
            <div className="space-y-3">
              <p className="text-gray-300 italic text-sm">
                „Imam majonez, grašak iz konzerve i pola limuna."
              </p>
              <p className="text-indigo-400 font-semibold text-sm">
                Receptomat: „To ti je već salata! Ili osnova za nešto bolje. Ne paniči."
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Kad nemaš plan, Receptomat ima strategiju preživljavanja.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}