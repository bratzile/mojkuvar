import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, ChefHat } from 'lucide-react';
import type { UserPreferences } from '../types';

interface PreferencesStepProps {
  preferences: UserPreferences;
  onComplete: (preferences: UserPreferences) => void;
  onBack: () => void;
}

export function PreferencesStep({ preferences, onComplete, onBack }: PreferencesStepProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  const handleServingsChange = (servings: number) => {
    setLocalPreferences(prev => ({ ...prev, servings }));
  };

  const handleTimeLimitChange = (timeLimit: string) => {
    setLocalPreferences(prev => ({ ...prev, timeLimit }));
  };

  const servingOptions = [
    { value: 1, label: '1 osoba' },
    { value: 2, label: '2 osobe' },
    { value: 4, label: '4 osobe' },
    { value: 6, label: '6+ osoba' }
  ];

  const timeOptions = [
    { value: '15', label: '15 min', icon: '⚡' },
    { value: '30', label: '30 min', icon: '🕐' },
    { value: '60', label: '1 sat', icon: '🕑' },
    { value: 'any', label: 'Nije bitno', icon: '♾️' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
          Još par pitanja...
        </h2>
      </div>

      <div className="space-y-12">
        {/* Number of Servings */}
        <div className="animate-fade-in-up delay-200">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
            <Users size={28} className="text-orange-400" />
            Za koliko osoba kuvaš?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {servingOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleServingsChange(option.value)}
                className={`p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                  localPreferences.servings === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-600'
                }`}
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="text-3xl mb-3">👥</div>
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="animate-fade-in-up delay-400">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
            <Clock size={28} className="text-orange-400" />
            Koliko vremena imaš?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timeOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleTimeLimitChange(option.value)}
                className={`p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 animate-fade-in-up ${
                  localPreferences.timeLimit === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-600'
                }`}
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <div className="text-3xl mb-3">{option.icon}</div>
                <div className="font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}