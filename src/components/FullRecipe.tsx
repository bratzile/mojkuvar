import React, { useState } from 'react';
import { ArrowLeft, Clock, ChefHat, Users, Loader2 } from 'lucide-react';

interface FullRecipeProps {
  recipe: {
    title: string;
    ingredients: string[];
    steps: string[];
    time: string;
    tip: string;
  };
  onBack: () => void;
  loading?: boolean;
  currentServings?: number;
  onServingsChange?: (servings: number) => void;
}

export function FullRecipe({ 
  recipe, 
  onBack, 
  loading, 
  currentServings = 2, 
  onServingsChange 
}: FullRecipeProps) {
  const [showServingsAdjustment, setShowServingsAdjustment] = useState(false);
  
  // Clean title - remove ## and other markdown formatting
  const cleanTitle = recipe.title.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();

  const isLoading = loading || !recipe.title || recipe.title === 'Recept se učitava...';
  const hasTip = recipe.tip && recipe.tip.trim() && recipe.tip !== 'Učitava se...';

  const servingOptions = [
    { value: 1, label: '1 osoba' },
    { value: 2, label: '2 osobe' },
    { value: 4, label: '4 osobe' },
    { value: 6, label: '6-8 osoba' }
  ];

  const handleServingsChange = (servings: number) => {
    if (onServingsChange) {
      onServingsChange(servings);
      setShowServingsAdjustment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft size={20} />
          Nazad na recepte
        </button>
      </div>

      {/* Servings Adjustment - Show before recipe */}
      {!isLoading && (
        <div className="mb-8 animate-fade-in-up delay-100">
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                <Users size={20} />
                Želiš da prilagodiš mere na osnovu broja osoba?
              </h3>
              <button
                onClick={() => setShowServingsAdjustment(!showServingsAdjustment)}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                {showServingsAdjustment ? 'Sakrij' : 'Prilagodi'}
              </button>
            </div>
            
            {showServingsAdjustment && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {servingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleServingsChange(option.value)}
                    className={`p-3 rounded-lg text-center transition-all duration-300 ${
                      currentServings === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">👥</div>
                    <div className="font-medium text-sm">{option.label}</div>
                  </button>
                ))}
              </div>
            )}
            
            {!showServingsAdjustment && (
              <p className="text-blue-400 text-sm">
                Trenutno: {servingOptions.find(opt => opt.value === currentServings)?.label || `${currentServings} osobe`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recipe Header */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 animate-fade-in-up delay-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 size={40} className="animate-spin text-amber-400" />
              <span>Priprema recepta...</span>
            </div>
          ) : (
            cleanTitle
          )}
        </h1>

        <div className="flex items-center gap-6 text-amber-400 mb-8">
          <div className="flex items-center gap-2">
            <Clock size={24} />
            <span className="text-xl font-semibold">
              {isLoading ? 'Učitava se...' : recipe.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={24} />
            <span className="text-xl font-semibold">{currentServings} {currentServings === 1 ? 'osoba' : currentServings < 5 ? 'osobe' : 'osoba'}</span>
          </div>
        </div>

        {/* Ingredients Section */}
        <section className="mb-12 animate-fade-in-up delay-400">
          <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-amber-600/30 pb-2 inline-block">
            Sastojci
          </h2>
          {isLoading && recipe.ingredients.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg animate-pulse">
                  <div className="w-2 h-2 bg-amber-400/50 rounded-full flex-shrink-0"></div>
                  <div className="h-4 bg-gray-600/50 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg animate-fade-in-up"
                  style={{ animationDelay: `${500 + index * 50}ms` }}
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-200 text-lg">{ingredient}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Instructions Section */}
        <section className="mb-12 animate-fade-in-up delay-600">
          <h2 className="text-3xl font-bold mb-6 text-white border-b-2 border-amber-600/30 pb-2 inline-block">
            Priprema
          </h2>
          {isLoading && recipe.steps.length === 0 ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 items-start animate-pulse">
                  <div className="w-12 h-12 bg-amber-500/50 rounded-full flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-600/50 rounded w-full"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-4/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start animate-fade-in-up"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex-shrink-0 font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <p className="text-gray-200 text-lg leading-relaxed pt-2">{step}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chef's Tip - Only show if there's a tip */}
        {hasTip && (
          <div className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 p-8 rounded-2xl border border-amber-600/20 animate-fade-in-up delay-800">
            <div className="flex items-center gap-3 mb-4">
              <ChefHat className="text-amber-400" size={32} />
              <h3 className="text-2xl font-bold text-white">Receptomat savet</h3>
            </div>
            <p className="text-gray-200 text-lg leading-relaxed italic">
              {recipe.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}