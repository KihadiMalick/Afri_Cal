import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { calculateGreenStreak } from '@/utils/streak';
import { calculateWeightProjection } from '@/utils/weight-projection';
import type { UserProfile, Meal, DailySummary } from '@/types';

interface PreloadedData {
  profile: UserProfile | null;
  todayMeals: Meal[];
  todaySummary: DailySummary | null;
  streak: number;
  projectedWeight: number;
  ready: boolean;
  refresh: () => Promise<void>;
}

const DataPreloadContext = createContext<PreloadedData>({
  profile: null,
  todayMeals: [],
  todaySummary: null,
  streak: 0,
  projectedWeight: 0,
  ready: false,
  refresh: async () => {},
});

export function DataPreloadProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailySummary | null>(null);
  const [streak, setStreak] = useState(0);
  const [projectedWeight, setProjectedWeight] = useState(0);
  const [ready, setReady] = useState(false);

  const loadAll = useCallback(async () => {
    if (!user) {
      setReady(true);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Phase 1: Load critical data in parallel (profile + meals + summary)
    const [profileRes, mealsRes, summaryRes] = await Promise.all([
      supabase.from('users_profile').select('*').eq('user_id', user.id).single(),
      supabase.from('meals').select('*').eq('user_id', user.id).eq('date', todayStr)
        .order('created_at', { ascending: false }),
      (supabase as any).from('daily_summary').select('*').eq('user_id', user.id).eq('date', todayStr).single(),
    ]);

    const p = profileRes.data as UserProfile | null;
    setProfile(p);
    setTodayMeals((mealsRes.data as Meal[]) ?? []);
    setTodaySummary(summaryRes.data as DailySummary | null);

    // Mark ready immediately so UI shows with critical data
    setReady(true);

    // Phase 2: Load secondary data (streak + projection) non-blocking
    if (p) {
      Promise.all([
        calculateGreenStreak(supabase as any, user.id),
        calculateWeightProjection(supabase as any, user.id, p.weight),
      ]).then(([streakVal, projectionVal]) => {
        setStreak(streakVal);
        setProjectedWeight(projectionVal.projectedWeight);
      });
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <DataPreloadContext.Provider value={{ profile, todayMeals, todaySummary, streak, projectedWeight, ready, refresh: loadAll }}>
      {children}
    </DataPreloadContext.Provider>
  );
}

export const usePreloadedData = () => useContext(DataPreloadContext);
