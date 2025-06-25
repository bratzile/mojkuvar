import React from 'react';
import { ArrowLeft, Heart, Clock, Gauge, Trash2 } from 'lucide-react';
import { getFavoriteRecipes, removeFromFavorites, toggleFavorite, generateRecipeId } from '../lib/favorites';
import { trackRecipeFavorite } from '../lib/analytics';
import type { Recipe } from '../types';

interface FavoritesViewProps {
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export function FavoritesView({ onBack, onSelectRecipe }: FavoritesViewProps) {
  const [favorites, setFavorites] = React.useState<Recipe[]>([]);
  const [favoriteStates, setFavoriteStates] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const favs = getFavoriteRecipes();
    setFavorites(favs);
    
    // Initialize favorite states
    const states: Record<string, boolean> = {};
    favs.forEach(recipe => {
      const recipeId = recipe.id || generateRecipeId(recipe.title);
      states[recipeId] = true;
    });
    setFavoriteStates(states);
  }, []);

  const handleRemoveFavorite = (recipeId: string, recipeTitle: string) => {
    removeFromFavorites(recipeId);
    setFavorites(getFavoriteRecipes());
    setFavoriteStates(prev => ({
      ...prev,
      [recipeId]: false
    }));
    
    // Track favorite removal
    trackRecipeFavorite(recipeTitle, 'remove');
  };

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

    // Update favorites list
    setFavorites(getFavoriteRecipes());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'lako': return 'text-green-400';
      case 'teško': return 'text-red-400';
      default: return 'text-orange-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Nazad
        </button>
        
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Omiljeni recepti
          </h2>
          <p className="text-xl text-gray-300 flex items-center justify-center gap-2">
            <Heart size={24} className="text-red-400 fill-current" />
            {favorites.length} sačuvanih recepata
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-2xl font-bold text-white mb-2">Nema omiljenih recepata</h3>
          <p className="text-gray-400 mb-6">
            Dodajte recepte u favorite klikom na srce tokom pregledanja recepata
          </p>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 shadow-lg"
          >
            Pronađi recepte
          </button>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {favorites.map((recipe, index) => {
            const recipeId = recipe.id || generateRecipeId(recipe.title);
            const isFavorite = favoriteStates[recipeId] || false;
            
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
                      }`}
                    >
                      <Heart 
                        size={20} 
                        className={`transition-colors ${
                          isFavorite ? 'text-white fill-current' : 'text-gray-300'
                        }`} 
                      />
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
                      onClick={() => handleRemoveFavorite(recipeId, recipe.title)}
                      className="px-4 py-3 rounded-xl transition-all duration-300 font-semibold bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                    >
                      Ukloni
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}