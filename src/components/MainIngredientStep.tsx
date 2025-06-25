import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, X, Check, Search, ChevronDown, Edit3 } from 'lucide-react';
import { getLocalIngredients, organizeLocalIngredientsByCategory, searchIngredients, getMainIngredientCategories, type LocalIngredient } from '../lib/ingredients';

interface MainIngredientStepProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onBack: () => void;
  selectedIngredients: string[];
  onIngredientsUpdate: (ingredients: string[]) => void;
}

export function MainIngredientStep({ 
  selectedCategory, 
  onCategorySelect, 
  onBack, 
  selectedIngredients, 
  onIngredientsUpdate 
}: MainIngredientStepProps) {
  const [manualInput, setManualInput] = useState('');
  const [allIngredients] = useState(getLocalIngredients());
  const [ingredientCategories, setIngredientCategories] = useState<any>({});
  const [activeCategory, setActiveCategory] = useState<string>('meat');
  const [searchResults, setSearchResults] = useState<LocalIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const ingredients = getLocalIngredients();
      const organized = organizeLocalIngredientsByCategory(ingredients);
      setIngredientCategories(organized);
      setActiveCategory('meat'); // Start with meat category
    } catch (err) {
      console.error('Error loading ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const addManualIngredient = () => {
    if (manualInput.trim()) {
      const newIngredients = [...selectedIngredients, manualInput.trim()];
      onIngredientsUpdate(newIngredients);
      setManualInput('');
      setSearchResults([]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = selectedIngredients.filter(i => i !== ingredient);
    onIngredientsUpdate(newIngredients);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const results = searchIngredients(allIngredients, query);
      setSearchResults(results.slice(0, 6)); // Show max 6 results
    } else {
      setSearchResults([]);
    }
  };

  const addFromSearch = (ingredient: LocalIngredient) => {
    const name = ingredient.serbianName || ingredient.sastojakNAME;
    if (!selectedIngredients.includes(name)) {
      const newIngredients = [...selectedIngredients, name];
      onIngredientsUpdate(newIngredients);
    }
    setManualInput('');
    setSearchResults([]);
  };

  const handleIngredientClick = (ingredient: LocalIngredient) => {
    const name = ingredient.serbianName || ingredient.sastojakNAME;
    if (selectedIngredients.includes(name)) {
      removeIngredient(name);
    } else {
      const newIngredients = [...selectedIngredients, name];
      onIngredientsUpdate(newIngredients);
    }
  };

  const isIngredientSelected = (ingredient: LocalIngredient) => {
    return selectedIngredients.includes(ingredient.serbianName || ingredient.sastojakNAME);
  };

  const getFilteredIngredients = () => {
    return activeCategory && ingredientCategories[activeCategory] 
      ? ingredientCategories[activeCategory].items 
      : [];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-300">Učitavam sastojke...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Šta imaš od namirnica koje želiš da iskoristiš?
        </h2>
      </div>

      {/* Manual Input - Bez voice funkcionalnosti */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => {
                  setManualInput(e.target.value);
                  handleSearch(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && addManualIngredient()}
                placeholder="Dodaj namirnicu..."
                className="flex-1 bg-transparent text-green-300 placeholder-green-400/70 focus:outline-none"
              />
              <button
                onClick={addManualIngredient}
                disabled={!manualInput.trim()}
                className="text-green-300 hover:text-green-200 disabled:text-green-600 p-1"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="mb-6 bg-gray-800 border border-gray-600 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3">
            {searchResults.map((ingredient) => (
              <button
                key={ingredient.sastojakID}
                onClick={() => addFromSearch(ingredient)}
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors text-left"
              >
                <img 
                  src={ingredient.imageUrl} 
                  alt={ingredient.serbianName || ingredient.sastojakNAME}
                  className="w-8 h-8 rounded object-cover brightness-100"
                />
                <span className="text-white text-sm">{ingredient.serbianName || ingredient.sastojakNAME}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar - MOBILNO PRILAGOĐENO */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Kategorije</h3>
          
          {/* Desktop kategorije */}
          <div className="hidden lg:block space-y-2">
            {Object.entries(ingredientCategories).map(([key, category]: [string, any]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-75">{category.items.length} sastojaka</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Mobile kategorije - GRID LAYOUT */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            {Object.entries(ingredientCategories).map(([key, category]: [string, any]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`relative p-4 rounded-xl transition-all duration-300 text-center ${
                  activeCategory === key
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600'
                }`}
              >
                {/* Broj sastojaka u uglu */}
                <span className="absolute top-2 right-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {category.items.length}
                </span>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="font-medium text-sm leading-tight">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {ingredientCategories[activeCategory]?.name || 'Sastojci'}
            </h3>
            <span className="text-sm text-gray-400">
              {selectedIngredients.length} odabrano
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {getFilteredIngredients().map((ingredient: LocalIngredient, index: number) => (
              <button
                key={ingredient.sastojakID}
                onClick={() => handleIngredientClick(ingredient)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                  isIngredientSelected(ingredient)
                    ? 'ring-2 ring-amber-500 shadow-lg'
                    : 'hover:shadow-lg'
                }`}
                style={{ 
                  animationDelay: `${index * 20}ms`,
                  aspectRatio: '1',
                  minHeight: '120px'
                }}
              >
                {/* Background Image - No gradient overlay, just bottom text area */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-100"
                  style={{
                    backgroundImage: `url(${ingredient.imageUrl})`
                  }}
                />

                {/* Bottom text area with minimal gradient */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <h4 className="text-white font-medium text-xs leading-tight text-center drop-shadow-lg">
                    {ingredient.serbianName || ingredient.sastojakNAME}
                  </h4>
                </div>
                
                {/* Selection Indicator */}
                {isIngredientSelected(ingredient) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white" />
                  </div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}