import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Bookmark, Edit3, ChevronDown, X, Plus } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { RecipeResults } from './components/RecipeResults';
import { FullRecipe } from './components/FullRecipe';
import { FavoritesView } from './components/FavoritesView';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ReceptomatBot } from './components/ReceptomatBot';
import { generateRecipesStreaming, getFullRecipeStreaming } from './lib/gemini';
import { getFavoriteRecipes } from './lib/favorites';
import { getLocalIngredients, searchIngredients } from './lib/ingredients';
import { trackRecipeGeneration, trackRecipeView, trackStepNavigation, trackIngredientSelection } from './lib/analytics';
import type { Recipe, UserPreferences } from './types';

export type AppStep = 'home' | 'recipes' | 'full-recipe' | 'favorites';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    avoidMethods: [],
    servings: 2,
    timeLimit: 'any'
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [showIngredientsDropdown, setShowIngredientsDropdown] = useState(false);
  const [streamingRecipes, setStreamingRecipes] = useState(false);
  const [recipeCount, setRecipeCount] = useState(5);
  const [streamingFullRecipe, setStreamingFullRecipe] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Update favorites count
  useEffect(() => {
    const updateFavoritesCount = () => {
      setFavoritesCount(getFavoriteRecipes().length);
    };
    
    updateFavoritesCount();
    
    window.addEventListener('storage', updateFavoritesCount);
    const interval = setInterval(updateFavoritesCount, 1000);
    
    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.ingredients-dropdown')) {
        setShowIngredientsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToStep = (step: AppStep, direction: 'left' | 'right' = 'right') => {
    trackStepNavigation(currentStep, step);
    setSlideDirection(direction);
    setTimeout(() => setCurrentStep(step), 50);
  };

  // Handle navigation from HomePage to recipes
  const handleNavigateToRecipes = (recipesData: Recipe[], ingredientsData: string[]) => {
    setRecipes(recipesData);
    setSelectedIngredients(ingredientsData);
    navigateToStep('recipes');
  };

  const generateRecipeResults = async (userPreferences: UserPreferences, filterType?: string, isNewSearch: boolean = true) => {
    setStreamingRecipes(true);
    setError(null);
    
    trackRecipeGeneration(selectedIngredients.length, userPreferences.servings);
    
    if (isNewSearch) {
      setRecipes([]);
      setRecipeCount(isFirstLoad ? 5 : 3);
      setIsFirstLoad(false);
      navigateToStep('recipes');
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }

    try {
      let prompt = `Dostupni sastojci: ${selectedIngredients.join(', ')}.\n`;
      prompt += `Broj porcija: ${userPreferences.servings}.\n`;

      if (filterType) {
        switch (filterType) {
          case 'quick':
            prompt += `Fokus na brze recepte do 30 minuta.\n`;
            break;
          case 'easy':
            prompt += `Fokus na jednostavne recepte za početnike.\n`;
            break;
          case 'healthy':
            prompt += `Fokus na zdrave i nutritivne recepte.\n`;
            break;
          case 'comfort':
            prompt += `Fokus na tradicionalne, site recepte.\n`;
            break;
          case 'vegetarian':
            prompt += `Fokus na vegetarijanske recepte bez mesa.\n`;
            break;
          case 'dessert':
            prompt += `Fokus na deserte i slatka jela.\n`;
            break;
        }
      }

      const allRecipes: Recipe[] = isNewSearch ? [] : [...recipes];
      const targetCount = isNewSearch ? recipeCount : recipeCount;
      
      await generateRecipesStreaming(
        selectedIngredients, 
        prompt, 
        userPreferences.servings,
        targetCount,
        (recipe) => {
          if (allRecipes.length < targetCount) {
            allRecipes.push(recipe);
            setRecipes([...allRecipes]);
          }
        }
      );
      
      setRecipes(allRecipes);
    } catch (err) {
      setError('Ups! Receptomat je malo zbunjen. Pokušajte ponovo za koji trenutak.');
    } finally {
      setStreamingRecipes(false);
    }
  };

  const handleGenerateMore = () => {
    setRecipeCount(prev => prev + 3);
    generateRecipeResults(preferences, undefined, false);
  };

  const handleFilterChange = (filterType: string) => {
    generateRecipeResults(preferences, filterType, true);
  };

  const handleSelectRecipe = async (recipe: Recipe) => {
    trackRecipeView(recipe.title);
    
    setStreamingFullRecipe(true);
    setError(null);
    setSelectedRecipe(null);
    setCurrentStep('full-recipe');
    
    try {
      await getFullRecipeStreaming(
        recipe.title, 
        selectedIngredients,
        (content) => {
          const parsedRecipe = parseStreamingFullRecipe(content);
          setSelectedRecipe(parsedRecipe);
        },
        preferences.servings
      );
    } catch (err) {
      setError('Ups! Receptomat je malo zbunjen. Pokušajte ponovo za koji trenutak.');
    } finally {
      setStreamingFullRecipe(false);
    }
  };

  const parseStreamingFullRecipe = (content: string) => {
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
        const tipLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          const tipLine = lines[j].trim();
          if (tipLine && !tipLine.toLowerCase().includes('receptomat savet')) {
            tipLines.push(tipLine);
          }
        }
        recipe.tip = tipLines.join(' ').trim();
        break;
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
      title: recipe.title || 'Recept se učitava...',
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      time: recipe.time || 'Učitava se...',
      tip: recipe.tip || ''
    };
  };

  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
    setCurrentStep('recipes');
  };

  const handleStartOver = () => {
    setCurrentStep('home');
    setSelectedIngredients([]);
    setRecipes([]);
    setSelectedRecipe(null);
    setError(null);
    setRecipeCount(5);
    setIsFirstLoad(true);
  };

  const handleShowFavorites = () => {
    setCurrentStep('favorites');
  };

  const handleBackFromFavorites = () => {
    setCurrentStep('recipes');
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const handleLogoClick = () => {
    handleStartOver();
  };

  const handleIngredientsChangeFromHeader = (newIngredients: string[]) => {
    setSelectedIngredients(newIngredients);
  };

  const handleServingsChange = (servings: number) => {
    const newPreferences = { ...preferences, servings };
    setPreferences(newPreferences);
    
    if (selectedRecipe) {
      handleSelectRecipe({ 
        title: selectedRecipe.title, 
        description: '', 
        method: '', 
        time: '', 
        difficulty: '', 
        servings: servings, 
        usedCount: 0, 
        missingIngredients: [], 
        imageUrl: '', 
        isRecipe: true 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Subtle Culinary Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-bounce-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-amber-400/20 rounded-full blur-xl animate-bounce-slow delay-700"></div>
      </div>

      {loading && <LoadingOverlay />}
      
      {/* MOBILE STICKY HEADER - Show only when not on home */}
      {currentStep !== 'home' && (
        <header className="mobile-sticky-header bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <button onClick={handleLogoClick} className="hover:opacity-80 transition-opacity">
                  <img 
                    src="/images/logo.webp" 
                    alt="Receptomat Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </button>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-2">
                {/* Lista odabranih sastojaka */}
                {selectedIngredients.length > 0 && (
                  <HeaderIngredientsDropdown 
                    selectedIngredients={selectedIngredients}
                    onIngredientsUpdate={handleIngredientsChangeFromHeader}
                    onGenerateNewRecipes={() => generateRecipeResults(preferences, undefined, true)}
                  />
                )}

                {/* Sačuvano button */}
                <button
                  onClick={handleShowFavorites}
                  className="relative inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors text-xs font-medium bg-gray-800/50 px-2 py-1.5 rounded-lg border border-gray-600"
                >
                  <Bookmark size={14} />
                  <span className="hidden sm:inline">Sačuvano</span> ({favoritesCount})
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`relative z-10 container mx-auto px-4 ${currentStep !== 'home' ? 'main-content-mobile' : 'py-8'}`}>
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-xl text-center border border-red-700/50 backdrop-blur-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Step Content with Slide Animation */}
        <div className="relative overflow-hidden">
          <div 
            className={`transition-all duration-500 ease-out ${
              slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            {currentStep === 'home' && (
              <HomePage onNavigateToRecipes={handleNavigateToRecipes} />
            )}

            {currentStep === 'recipes' && (
              <RecipeResults
                recipes={recipes}
                onSelectRecipe={handleSelectRecipe}
                loading={loading}
                onGenerateMore={handleGenerateMore}
                onFilterChange={handleFilterChange}
                selectedIngredients={selectedIngredients}
                onIngredientsUpdate={handleIngredientsChangeFromHeader}
                streamingRecipes={streamingRecipes}
                onGenerateNewRecipes={() => generateRecipeResults(preferences, undefined, true)}
              />
            )}

            {currentStep === 'full-recipe' && selectedRecipe && (
              <FullRecipe
                recipe={selectedRecipe}
                onBack={handleBackToRecipes}
                loading={streamingFullRecipe}
                currentServings={preferences.servings}
                onServingsChange={handleServingsChange}
              />
            )}

            {currentStep === 'favorites' && (
              <FavoritesView
                onBack={handleBackFromFavorites}
                onSelectRecipe={handleSelectRecipe}
              />
            )}
          </div>
        </div>
      </main>

      {/* Receptomat Bot */}
      <ReceptomatBot />
    </div>
  );
}

// Header Ingredients Dropdown Component
function HeaderIngredientsDropdown({ 
  selectedIngredients, 
  onIngredientsUpdate,
  onGenerateNewRecipes
}: { 
  selectedIngredients: string[], 
  onIngredientsUpdate: (ingredients: string[]) => void,
  onGenerateNewRecipes: () => void
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allIngredients] = useState(getLocalIngredients());
  const [hasChanges, setHasChanges] = useState(false);

  const handleSearch = (query: string) => {
    setNewIngredient(query);
    if (query.trim()) {
      const results = searchIngredients(allIngredients, query);
      setSearchResults(results.slice(0, 6));
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
      setHasChanges(true);
    }
  };

  const handleAddFromSearch = (ingredient: any) => {
    const name = ingredient.serbianName || ingredient.sastojakNAME;
    handleAddIngredient(name);
  };

  const removeIngredient = (ingredient: string) => {
    onIngredientsUpdate(selectedIngredients.filter(i => i !== ingredient));
    setHasChanges(true);
  };

  const handleGenerateNewRecipes = () => {
    onGenerateNewRecipes();
    setHasChanges(false);
    setShowDropdown(false);
  };

  return (
    <div className="relative ingredients-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors text-xs font-medium bg-gray-800/50 px-2 py-1.5 rounded-lg border border-gray-600"
      >
        <Edit3 size={12} />
        <span className="hidden sm:inline">Sastojci</span> ({selectedIngredients.length})
        <ChevronDown size={12} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-30 max-h-80 overflow-y-auto">
          <div className="p-3">
            {/* Add new ingredient */}
            <div className="relative mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="Dodaj sastojak..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none text-sm"
                />
                <button
                  onClick={() => handleAddIngredient()}
                  disabled={!newIngredient.trim()}
                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 max-h-32 overflow-y-auto">
                  <div className="p-1">
                    {searchResults.map((ingredient, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddFromSearch(ingredient)}
                        className="w-full text-left p-2 hover:bg-gray-600 rounded text-white text-sm"
                      >
                        {ingredient.serbianName || ingredient.sastojakNAME}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current ingredients */}
            <div className="space-y-2 mb-4">
              {selectedIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                  <span className="text-white text-sm">{ingredient}</span>
                  <button
                    onClick={() => removeIngredient(ingredient)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Generate new recipes button */}
            {hasChanges && (
              <button
                onClick={handleGenerateNewRecipes}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-300 font-semibold text-sm"
              >
                Prikaži nove recepte
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;