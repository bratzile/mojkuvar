// Analytics helper functions
import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Custom events for Receptomat
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// Specific tracking functions for Receptomat features
export const trackRecipeGeneration = (ingredientsCount: number, servings: number) => {
  trackEvent('recipe_generation', {
    ingredients_count: ingredientsCount,
    servings: servings
  });
};

export const trackRecipeView = (recipeTitle: string) => {
  trackEvent('recipe_view', {
    recipe_title: recipeTitle
  });
};

export const trackRecipeFavorite = (recipeTitle: string, action: 'add' | 'remove') => {
  trackEvent('recipe_favorite', {
    recipe_title: recipeTitle,
    action: action
  });
};

export const trackIngredientSelection = (ingredient: string, category: string) => {
  trackEvent('ingredient_selection', {
    ingredient: ingredient,
    category: category
  });
};

export const trackStepNavigation = (fromStep: string, toStep: string) => {
  trackEvent('step_navigation', {
    from_step: fromStep,
    to_step: toStep
  });
};

export const trackSearchUsage = (searchTerm: string, resultsCount: number) => {
  trackEvent('search_usage', {
    search_term: searchTerm,
    results_count: resultsCount
  });
};