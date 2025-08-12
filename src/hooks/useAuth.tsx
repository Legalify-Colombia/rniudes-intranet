import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Definir los tipos de datos para el perfil
interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: "Administrador" | "Coordinador" | "Gestor";
  campus_name?: string | null;
  // Otros campos del perfil...
}

// Definir la interfaz para el contexto
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para obtener el perfil del usuario de la tabla 'profiles'
  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          campus(name)
        `)
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 es para 'no se encontraron filas'
        console.error("Error al obtener el perfil:", error);
        return null;
      }
      
      if (profileData) {
        // Mapear los datos para que el nombre del campus sea una cadena simple
        const campusName = profileData.campus ? profileData.campus.name : null;
        return { ...profileData, campus_name: campusName, role: profileData.role as Profile['role'] };
      }
      return null;
    } catch (err) {
      console.error("Error inesperado al obtener el perfil:", err);
      return null;
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const userProfile = await fetchProfile(currentSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    // Escucha los cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    // Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
        // Si no hay error, el onAuthStateChange se encargará de cargar el perfil y desactivar el loading
        return { error: null };
    }
    setLoading(false);
    return { error };
  };

  const signUp = async (data: any) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          document_number: data.documentNumber,
          position: data.position,
          campus_id: data.campusId,
          role: data.role,
          weekly_hours: data.weeklyHours,
          number_of_weeks: data.numberOfWeeks,
        }
      }
    });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
