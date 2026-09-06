'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types';

const DEMO_USER_KEY = 'watch_together_demo_user';

export function useSupabaseAuth() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        // Use local stored guest/demo profile
        const savedDemo = localStorage.getItem(DEMO_USER_KEY);
        if (savedDemo) {
          try {
            setProfile(JSON.parse(savedDemo));
          } catch {
            createDemoUser();
          }
        } else {
          createDemoUser();
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setProfile(data);
          } else {
            // Profile fallback
            const newProf: UserProfile = {
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Kullanıcı',
              avatar_url: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            };
            setProfile(newProf);
          }
        }
      } catch (err) {
        console.warn('Auth check error, using local state:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    function createDemoUser() {
      const randomId = 'user-' + Math.random().toString(36).substring(2, 9);
      const guestNames = ['KozmikYolcu', 'GeceKuşu', 'FilmTutkunu', 'SiberKaptan', 'NeonGezgin', 'YıldızAvcısı'];
      const randomName = guestNames[Math.floor(Math.random() * guestNames.length)] + '_' + Math.floor(10 + Math.random() * 90);
      const newProf: UserProfile = {
        id: randomId,
        username: randomName,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomId}`,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(newProf));
      if (isMounted) setProfile(newProf);
    }

    initAuth();

    // Listen to Supabase auth changes if configured
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (data && isMounted) {
            setProfile(data);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) setProfile(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      const mockProf: UserProfile = {
        id: 'user-' + Math.random().toString(36).substring(2, 8),
        username: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProf));
      setProfile(mockProf);
      return { success: true };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, username: string) => {
    if (!isSupabaseConfigured()) {
      const mockProf: UserProfile = {
        id: 'user-' + Math.random().toString(36).substring(2, 8),
        username: username || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockProf));
      setProfile(mockProf);
      return { success: true };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
        },
      },
    });
    if (error) throw error;
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem(DEMO_USER_KEY);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };

    if (!isSupabaseConfigured()) {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
      setProfile(updated);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      setProfile(updated);
    }
  }, [profile]);

  return {
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isSupabaseActive: isSupabaseConfigured(),
  };
}
