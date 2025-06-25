export interface Recipe {
  id?: string;
  title: string;
  description: string;
  method: string;
  time: string;
  difficulty: string;
  servings: number;
  usedCount: number;
  missingIngredients: string[];
  imageUrl: string;
  isRecipe: boolean;
  isFavorite?: boolean;
}

export interface UserPreferences {
  servings: number;
  timeLimit: string;
  avoidMethods?: string[];
  preferredCuisines?: string[];
}

export type AppStep = 'intro' | 'main-ingredient' | 'additional-ingredients' | 'preferences' | 'recipes' | 'full-recipe' | 'favorites';