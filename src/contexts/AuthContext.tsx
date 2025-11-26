'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/api/supabase';
import { User } from '@supabase/supabase-js';

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  description: string;
  price: number;
}

interface AuthContextType {
  user: User | null;
  userPlan: SubscriptionPlan | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // If user exists, fetch their subscription plan
      if (user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            subscription_plan_id,
            subscription_plans!inner (
              id,
              plan_name,
              description,
              price
            )
          `)
          .eq('id', user.id)
          .single();

        if (!error && userData && userData.subscription_plans) {
          // Supabase returns the relation as a single object when using !inner
          const plan = userData.subscription_plans as unknown as SubscriptionPlan;
          setUserPlan(plan);
        } else {
          setUserPlan(null);
        }
      } else {
        setUserPlan(null);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    refreshUserData().finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Refresh user plan when auth state changes
      if (session?.user) {
        await refreshUserData();
      } else {
        setUserPlan(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userPlan, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
