import type { Recipe } from '../types';

const FAVORITES_KEY = 'receptomat_favorites';

export function getFavoriteRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

export function addToFavorites(recipe: Recipe): void {
  try {
    const favorites = getFavoriteRecipes();
    const recipeWithId = {
      ...recipe,
      id: recipe.id || generateRecipeId(recipe.title),
      isFavorite: true
    };
    
    // Check if already exists
    const existingIndex = favorites.findIndex(fav => fav.id === recipeWithId.id);
    if (existingIndex === -1) {
      favorites.push(recipeWithId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
  }
}

export function removeFromFavorites(recipeId: string): void {
  try {
    const favorites = getFavoriteRecipes();
    const filtered = favorites.filter(fav => fav.id !== recipeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
}

export function isRecipeFavorite(recipeId: string): boolean {
  try {
    const favorites = getFavoriteRecipes();
    return favorites.some(fav => fav.id === recipeId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

export function generateRecipeId(title: string): string {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '-' + Date.now();
}

export function toggleFavorite(recipe: Recipe): boolean {
  const recipeId = recipe.id || generateRecipeId(recipe.title);
  const isFav = isRecipeFavorite(recipeId);
  
  if (isFav) {
    removeFromFavorites(recipeId);
    return false;
  } else {
    addToFavorites({ ...recipe, id: recipeId });
    return true;
  }
}