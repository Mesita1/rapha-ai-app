import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Intervention {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  dose?: string;
  notes?: string;
  timestamp: string;
  preRmssd?: number;
  postRmssd?: number;
  mood?: 'great' | 'good' | 'okay' | 'low' | 'struggling';
  stressLevel?: number;  // 1-5
  energyLevel?: number;  // 1-5
  mealType?: string;     // breakfast, lunch, dinner, snack
  quantity?: string;      // "8oz", "1 cup", etc.
}

interface InterventionContextType {
  interventions: Intervention[];
  addIntervention: (intervention: Omit<Intervention, 'id' | 'timestamp'>) => void;
  clearInterventions: () => void;
}

const InterventionContext = createContext<InterventionContextType>({
  interventions: [],
  addIntervention: () => {},
  clearInterventions: () => {},
});

const STORAGE_KEY = '@rapha_interventions';

export function InterventionProvider({ children }: { children: React.ReactNode }) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setInterventions(JSON.parse(data));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const persist = useCallback((items: Intervention[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, []);

  const addIntervention = useCallback((partial: Omit<Intervention, 'id' | 'timestamp'>) => {
    const newIntervention: Intervention = {
      ...partial,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setInterventions((prev) => {
      const updated = [newIntervention, ...prev];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearInterventions = useCallback(() => {
    setInterventions([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <InterventionContext.Provider value={{ interventions, addIntervention, clearInterventions }}>
      {children}
    </InterventionContext.Provider>
  );
}

export function useInterventions() {
  return useContext(InterventionContext);
}
