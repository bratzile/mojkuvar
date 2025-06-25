import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, Plus, Check, Loader2, Search } from 'lucide-react';
import { getLocalIngredients, organizeLocalIngredientsByCategory, searchIngredients, getIngredientsByCategory, type LocalIngredient } from '../lib/ingredients';

interface AdditionalIngredientsStepProps {
  mainCategory: string;
  selectedIngredients: string[];
  onIngredientToggle: (ingredient: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AdditionalIngredientsStep({
  mainCategory,
  selectedIngredients,
  onIngredientToggle,
  onNext,
  onBack
}: AdditionalIngredientsStepProps) {
  const [customIngredient, setCustomIngredient] = useState('');
  const [ingredientCategories, setIngredientCategories] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allIngredients, setAllIngredients] = useState<LocalIngredient[]>([]);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const ingredients = getLocalIngredients();
      const organized = organizeLocalIngredientsByCategory(ingredients);
      
      setAllIngredients(ingredients);
      setIngredientCategories(organized);
      
      // Set first category as active, but prioritize main category if it exists
      const firstCategory = organized[mainCategory] ? mainCategory : Object.keys(organized)[0];
      if (firstCategory) {
        setActiveCategory(firstCategory);
      }
    } catch (err) {
      setError('Greška pri učitavanju sastojaka');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim()) {
      onIngredientToggle(customIngredient.trim());
      setCustomIngredient('');
    }
  };

  const handleIngredientClick = (ingredient: LocalIngredient) => {
    onIngredientToggle(ingredient.serbianName || ingredient.sastojakNAME);
  };

  const isIngredientSelected = (ingredient: LocalIngredient) => {
    return selectedIngredients.includes(ingredient.serbianName || ingredient.sastojakNAME);
  };

  // Filter ingredients based on search query
  const getFilteredIngredients = () => {
    if (!searchQuery.trim()) {
      return activeCategory && ingredientCategories[activeCategory] 
        ? ingredientCategories[activeCategory].items 
        : [];
    }
    return searchIngredients(allIngredients, searchQuery);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <Loader2 size={48} className="animate-spin text-orange-400 mx-auto mb-4" />
        <p className="text-xl text-gray-300">Učitavam sastojke...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">😞</div>
        <h3 className="text-2xl font-bold text-white mb-2">Ups!</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={loadIngredients}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl transition-all duration-300"
        >
          Pokušaj ponovo
        </button>
      </div>
    );
  }

  const filteredIngredients = getFilteredIngredients();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Pregled i dodavanje sastojaka
        </h2>
        <p className="text-xl text-gray-300 mb-2">
          Kategorija: <span className="text-orange-400 font-semibold">
            {ingredientCategories[mainCategory]?.name || mainCategory}
          </span>
        </p>
        <p className="text-gray-400">
          Dodaj još sastojaka iz ove kategorije ili upiši nove
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 animate-fade-in-up delay-200">
        <div className="max-w-md mx-auto relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretražite sastojke..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Custom Ingredient Input */}
      <div className="mb-8 animate-fade-in-up delay-300">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
              placeholder="Dodajte bilo koji sastojak..."
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors backdrop-blur-sm"
            />
            <button
              onClick={handleAddCustomIngredient}
              disabled={!customIngredient.trim()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs - Only show if not searching */}
      {!searchQuery.trim() && (
        <div className="mb-8 animate-fade-in-up delay-400">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.entries(ingredientCategories).map(([key, category]: [string, any]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-600'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients Grid */}
      <div className="mb-8 animate-fade-in-up delay-500">
        {searchQuery.trim() && (
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Rezultati pretrage za "{searchQuery}"
          </h3>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredIngredients.map((ingredient: LocalIngredient, index: number) => (
            <button
              key={ingredient.sastojakID}
              onClick={() => handleIngredientClick(ingredient)}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                isIngredientSelected(ingredient)
                  ? 'ring-4 ring-orange-500 shadow-2xl shadow-orange-500/25'
                  : 'hover:shadow-xl'
              }`}
              style={{ 
                animationDelay: `${index * 30}ms`,
                aspectRatio: '1',
                minHeight: '160px'
              }}
            >
              {/* Background Image - Original brightness */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-100"
                style={{
                  backgroundImage: `url(${ingredient.imageUrl})`
                }}
              />

              {/* Bottom text area with minimal gradient */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white font-bold text-lg leading-tight text-center drop-shadow-lg">
                  {ingredient.serbianName || ingredient.sastojakNAME}
                </h3>
              </div>
              
              {/* Selection Indicator */}
              {isIngredientSelected(ingredient) && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Check size={18} className="text-white" />
                </div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        {filteredIngredients.length === 0 && searchQuery.trim() && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-400">Nema rezultata za "{searchQuery}"</p>
            <p className="text-gray-500 text-sm mt-2">Pokušajte sa drugim terminom ili dodajte custom sastojak</p>
          </div>
        )}
      </div>

      {/* Selected Ingredients Summary */}
      {selectedIngredients.length > 0 && (
        <div className="mb-8 animate-fade-in-up delay-600">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Odabrani sastojci ({selectedIngredients.length})
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {selectedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg animate-fade-in"
              >
                {ingredient}
                <button
                  onClick={() => onIngredientToggle(ingredient)}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Tips */}
      <div className="mb-8 animate-fade-in-up delay-800">
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-6 text-center">
          <p className="text-blue-300 text-sm">
            💡 <strong>Savet:</strong> Što više sastojaka dodate, to će recepti biti raznovrsniji i ukusniji!
          </p>
        </div>
      </div>
    </div>
  );
}