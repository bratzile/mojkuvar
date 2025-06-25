import React from 'react';
import { ChefHat } from 'lucide-react';

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center border border-gray-700/50">
        <div className="relative w-24 h-24 mx-auto">
          <div className="animate-spin">
            <ChefHat size={96} className="text-amber-400" />
          </div>
        </div>
        <p className="mt-4 text-lg text-white">
          {message || "Smišljam nešto ukusno..."}
        </p>
      </div>
    </div>
  );
}