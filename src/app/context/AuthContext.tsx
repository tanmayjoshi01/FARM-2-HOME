import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js";

type UserRole = "buyer" | "farmer" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

const mapSupabaseUserToAppUser = (authUser: SupabaseUser): User => {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    name: metadata.full_name || authUser.email?.split("@")[0] || "User",
    email: authUser.email || "",
    role: (metadata.role as UserRole) || "buyer",
    phone: metadata.phone,
    avatar_url: metadata.avatar_url,
  };
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, phone?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        void fetchUserProfile(session.user.id, session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        void fetchUserProfile(session.user.id, session.user);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string, authUser?: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        if (authUser) {
          const fallbackUser = mapSupabaseUserToAppUser(authUser);
          setUser(fallbackUser);
          return;
        }
        throw error || new Error("User profile not found");
      }

      setUser({
        id: data.id,
        name: data.full_name,
        email: data.email,
        role: data.role as UserRole,
        phone: data.phone,
        avatar_url: data.avatar_url,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If Supabase is not configured, provide a helpful error message
        if (error.message === 'Supabase not configured') {
          throw new Error('Backend not configured. Please set up Supabase (see QUICK_START.md)');
        }
        throw error;
      }

      // Verify role matches
      if (data.user) {
        let resolvedRole: UserRole | undefined;

        // Always prefer role from public.users because admin/farmer promotion
        // typically happens there after initial signup.
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!userError && userData?.role) {
          resolvedRole = userData.role as UserRole;
        }

        // Fallback to auth metadata for partially configured setups.
        if (!resolvedRole) {
          resolvedRole = data.user.user_metadata?.role as UserRole | undefined;
        }

        if (!resolvedRole) {
          throw new Error("User role not found. Please contact support.");
        }

        if (resolvedRole !== role) {
          await supabase.auth.signOut();
          throw new Error(`Invalid credentials for ${role} login`);
        }

        void fetchUserProfile(data.user.id, data.user);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error(error.message || "Logout failed");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role,
            phone: phone,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw new Error(error.message || "Signup failed");
      }

      if (data.user) {
        // Try to fetch profile, but don't fail if it doesn't exist yet
        try {
          void fetchUserProfile(data.user.id, data.user);
        } catch (profileError) {
          console.warn("Could not fetch profile immediately after signup:", profileError);
          // Create a temporary user object until profile is created
          setUser({
            id: data.user.id,
            name: name,
            email: email,
            role: role,
            phone: phone,
          });
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}