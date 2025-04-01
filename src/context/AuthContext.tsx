'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js'; // Import Supabase types
// Removed useRouter import as it's not used directly here anymore

// Define the shape of the context value
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the context with a default value matching the type
const AuthContext = createContext<AuthContextType | null>(null); // Allow null initially

// Define Props type for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Use Supabase types for state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter(); // Keep if needed for redirects inside listener

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
        console.error("Error getting session:", error);
        setLoading(false); // Ensure loading stops even on error
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Define the signOut function type
  const handleSignOut = async (): Promise<void> => {
      setLoading(true); // Optional: show loading during sign out
      try {
          await supabase.auth.signOut();
          // State updates (session/user set to null) are handled by onAuthStateChange
      } catch(error) {
          console.error("Error signing out:", error);
          // Handle error appropriately
      } finally {
          setLoading(false); // Ensure loading is false after signout attempt
      }
  };

  const value: AuthContextType = {
    session,
    user,
    loading,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children immediately or wait for loading? Waiting avoids flicker. */}
      {!loading ? children : <div>Loading Auth...</div>} 
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Now check if context is null instead of undefined
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 