import React, { useState } from 'react';
import { Clock, Gauge, Utensils, Sparkles, ChefHat, Edit3, Plus, X, Search, Check, Loader2, Heart } from 'lucide-react';
import { toggleFavorite, isRecipeFavorite, generateRecipeId } from '../lib/favorites';
import { searchIngredients, getLocalIngredients } from '../lib/ingredients';
import { trackRecipeFavorite } from '../lib/analytics';
import type { Recipe } from '../types';

interface RecipeResultsProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  loading: boolean;
  onGenerateMore?: () => void;
  onFilterChange?: (filter: string) => void;
  selectedIngredients: string[];
  onIngredientsUpdate: (ingredients: string[]) => void;
  streamingRecipes?: boolean;
  onGenerateNewRecipes?: () => void;
}

export function RecipeResults({ 
  recipes, 
  onSelectRecipe, 
  loading, 
  onGenerateMore, 
  onFilterChange,
  selectedIngredients,
  onIngredientsUpdate,
  streamingRecipes = false,
  onGenerateNewRecipes
}: RecipeResultsProps) {
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
  const [showEditIngredients, setShowEditIngredients] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allIngredients] = useState(getLocalIngredients());
  const [savingRecipeId, setSavingRecipeId] = useState<string | null>(null);
  const [hasIngredientsChanges, setHasIngredientsChanges] = useState(false);

  // Initialize favorite states
  React.useEffect(() => {
    const states: Record<string, boolean> = {};
    recipes.forEach(recipe => {
      const recipeId = recipe.id || generateRecipeId(recipe.title);
      states[recipeId] = isRecipeFavorite(recipeId);
    });
    setFavoriteStates(states);
  }, [recipes]);

  const handleToggleFavorite = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    const recipeId = recipe.id || generateRecipeId(recipe.title);
    const newFavoriteState = toggleFavorite({ ...recipe, id: recipeId });
    
    setFavoriteStates(prev => ({
      ...prev,
      [recipeId]: newFavoriteState
    }));

    // Track favorite action
    trackRecipeFavorite(recipe.title, newFavoriteState ? 'add' : 'remove');

    // Show save animation
    if (newFavoriteState) {
      setSavingRecipeId(recipeId);
      setTimeout(() => setSavingRecipeId(null), 2000);
    }
  };

  const handleSearch = (query: string) => {
    setNewIngredient(query);
    if (query.trim()) {
      const results = searchIngredients(allIngredients, query);
      setSearchResults(results.slice(0, 6)); // Show max 6 results
    } else {
      setSearchResults([]);
    }
  };

  const handleAddIngredient = (ingredient?: string) => {
    const ingredientToAdd = ingredient || newIngredient.trim();
    if (ingredientToAdd && !selectedIngredients.includes(ingredientToAdd)) {
      onIngredientsUpdate([...selectedIngredients, ingredientToAdd]);
      setNewIngredient('');
      setSearchResults([]);
      setHasIngredientsChanges(true);
    }
  };

  const handleAddFromSearch = (ingredient: any) => {
    const name = ingredient.serbianName || ingredient.sastojakNAME;
    handleAddIngredient(name);
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onIngredientsUpdate(selectedIngredients.filter(i => i !== ingredient));
    setHasIngredientsChanges(true);
  };

  const handleGenerateNewRecipes = () => {
    if (onGenerateNewRecipes) {
      onGenerateNewRecipes();
      setHasIngredientsChanges(false);
      setShowEditIngredients(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'lako': return 'text-green-400';
      case 'teško': return 'text-red-400';
      default: return 'text-orange-400';
    }
  };

  const validRecipes = recipes.filter(recipe => recipe.isRecipe);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          Evo šta možeš da napraviš!
        </h2>
        <p className="text-xl text-gray-300 flex items-center justify-center gap-2">
          <Sparkles size={24} className="text-amber-400" />
          {validRecipes.length} personalizovanih recepata
          {streamingRecipes && (
            <Loader2 size={20} className="animate-spin text-amber-400" />
          )}
          <Sparkles size={24} className="text-amber-400" />
        </p>
      </div>

      {/* Recipe Cards - GRID LAYOUT ZA VEĆE EKRANE */}
      <div className="mb-8">
        {/* Desktop Grid - 3 kolone */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {validRecipes.map((recipe, index) => {
            const recipeId = recipe.id || generateRecipeId(recipe.title);
            const isFavorite = favoriteStates[recipeId] || false;
            const isSaving = savingRecipeId === recipeId;
            
            return (
              <div
                key={index}
                className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  {/* Header sa naslovom i sačuvaj dugmetom */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight flex-1 pr-4">
                      {recipe.title}
                    </h3>
                    
                    <button
                      onClick={(e) => handleToggleFavorite({ ...recipe, id: recipeId }, e)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isFavorite 
                          ? 'bg-red-500/80 hover:bg-red-500' 
                          : 'bg-gray-700/50 hover:bg-gray-600'
                      } ${isSaving ? 'animate-pulse' : ''}`}
                    >
                      {isSaving ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <Heart 
                          size={16} 
                          className={`transition-colors ${
                            isFavorite ? 'text-white fill-current' : 'text-gray-300'
                          }`} 
                        />
                      )}
                    </button>
                  </div>

                  {/* Opis */}
                  <p className="text-gray-300 mb-4 leading-relaxed text-sm line-clamp-3">
                    {recipe.description}
                  </p>
                  
                  {/* Recipe Stats - Kompaktno */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span className="text-xs">{recipe.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Utensils size={14} />
                      <span className="text-xs">{recipe.method}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${getDifficultyColor(recipe.difficulty)} col-span-2`}>
                      <Gauge size={14} />
                      <span className="font-medium text-xs">{recipe.difficulty}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectRecipe({ ...recipe, id: recipeId })}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 rounded-xl transition-all duration-300 font-semibold text-sm transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
                    >
                      Vidi recept
                    </button>
                    
                    <button
                      onClick={(e) => handleToggleFavorite({ ...recipe, id: recipeId }, e)}
                      className={`px-3 py-2 rounded-xl transition-all duration-300 font-semibold text-xs ${
                        isFavorite
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
                      }`}
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet Layout - 1 kolona */}
        <div className="lg:hidden space-y-6">
          {validRecipes.map((recipe, index) => {
            const recipeId = recipe.id || generateRecipeId(recipe.title);
            const isFavorite = favoriteStates[recipeId] || false;
            const isSaving = savingRecipeId === recipeId;
            
            return (
              <div
                key={index}
                className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  {/* Header sa naslovom i sačuvaj dugmetom */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white leading-tight flex-1 pr-4">
                      {recipe.title}
                    </h3>
                    
                    <button
                      onClick={(e) => handleToggleFavorite({ ...recipe, id: recipeId }, e)}
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isFavorite 
                          ? 'bg-red-500/80 hover:bg-red-500' 
                          : 'bg-gray-700/50 hover:bg-gray-600'
                      } ${isSaving ? 'animate-pulse' : ''}`}
                    >
                      {isSaving ? (
                        <Check size={20} className="text-white" />
                      ) : (
                        <Heart 
                          size={20} 
                          className={`transition-colors ${
                            isFavorite ? 'text-white fill-current' : 'text-gray-300'
                          }`} 
                        />
                      )}
                    </button>
                  </div>

                  {/* Produženi opis */}
                  <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                    {recipe.description}
                  </p>
                  
                  {/* Recipe Stats - Kompaktno */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={18} />
                      <span className="text-sm">{recipe.time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Utensils size={18} />
                      <span className="text-sm">{recipe.method}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${getDifficultyColor(recipe.difficulty)}`}>
                      <Gauge size={18} />
                      <span className="font-medium text-sm">{recipe.difficulty}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => onSelectRecipe({ ...recipe, id: recipeId })}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg hover:shadow-amber-500/25"
                    >
                      Da vidim recept
                    </button>
                    
                    <button
                      onClick={(e) => handleToggleFavorite({ ...recipe, id: recipeId }, e)}
                      className={`px-4 py-3 rounded-xl transition-all duration-300 font-semibold ${
                        isFavorite
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
                      }`}
                    >
                      {isFavorite ? 'Sačuvano' : 'Sačuvaj'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Streaming indicator */}
        {streamingRecipes && (
          <div className="group bg-gray-800/20 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/30 animate-pulse">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 size={20} className="animate-spin text-amber-400" />
                <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700/30 rounded w-full"></div>
                <div className="h-4 bg-gray-700/30 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700/30 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Animation Notification */}
      {savingRecipeId && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-in-right z-50">
          <div className="flex items-center gap-2">
            <Check size={20} />
            <span>Recept je sačuvan! Pogledajte u "Sačuvano"</span>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons - Only show when not streaming */}
      {!streamingRecipes && validRecipes.length > 0 && (
        <div className="text-center animate-fade-in-up delay-400">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6">Želiš još opcija?</h3>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button
                onClick={onGenerateMore}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
              >
                <ChefHat size={20} />
                Prikaži još recepata
              </button>
              
              {selectedIngredients.length > 0 && (
                <button
                  onClick={() => setShowEditIngredients(!showEditIngredients)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
                >
                  <Edit3 size={20} />
                  Izmeni sastojke
                </button>
              )}
            </div>

            {/* Edit Ingredients Section */}
            {showEditIngredients && selectedIngredients.length > 0 && (
              <div className="bg-gray-700/30 rounded-xl p-6 mt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Izmeni sastojke</h4>
                
                {/* Add new ingredient with search */}
                <div className="relative mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                        placeholder="Pretražite ili dodajte sastojak..."
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAddIngredient()}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                      <div className="p-2">
                        {searchResults.map((ingredient, index) => (
                          <button
                            key={index}
                            onClick={() => handleAddFromSearch(ingredient)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors text-left"
                          >
                            <span className="text-white text-sm">{ingredient.serbianName || ingredient.sastojakNAME}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Current ingredients */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {selectedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                      <span className="text-white text-sm">{ingredient}</span>
                      <button
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Generate new recipes button - only show if there are changes */}
                {hasIngredientsChanges && (
                  <button
                    onClick={handleGenerateNewRecipes}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
                  >
                    Prikaži nove recepte
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {validRecipes.length === 0 && !loading && !streamingRecipes && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-2xl font-bold text-white mb-2">Nema rezultata</h3>
          <p className="text-gray-400">Pokušajte sa drugim sastojcima ili preferencijama</p>
        </div>
      )}
    </div>
  );
}