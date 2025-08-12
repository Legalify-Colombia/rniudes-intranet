import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil del usuario de la tabla 'profiles'
  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      
      // Consultar el perfil y el nombre del campus en una sola llamada
      const { data, error } = await supabase
        .from('profiles')
        .select(`*, campus!profiles_campus_id_fkey(name)`) // Corregido: el alias del campus no es necesario aquí
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 es para 'no se encontraron filas'
        console.error("Error al obtener el perfil:", error);
        setProfile(null);
      } else {
        // Manejar el caso de que no se encuentre el perfil
        if (!data) {
          setProfile(null);
        } else {
          // Aseguramos que 'campus_name' es una cadena o null si no se encuentra
          const campusName = data.campus?.name || null;
          setProfile({ ...data, campus_name: campusName });
        }
      }
    } catch (err) {
      console.error("Error inesperado al obtener el perfil:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(null, session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName, documentNumber, position, weeklyHours, totalHours, campusId }) => {
    setLoading(true);
    try {
      const parsedWeeklyHours = weeklyHours ? parseInt(weeklyHours) : null;
      const parsedTotalHours = totalHours ? parseInt(totalHours) : null;
      const parsedCampusId = campusId || null;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            document_number: documentNumber || null,
            position: position || null,
            weekly_hours: parsedWeeklyHours,
            number_of_weeks: 16,
            total_hours: parsedTotalHours,
            campus_id: parsedCampusId,
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('Registro exitoso:', data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error de registro:', error.message);
      setLoading(false);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return { data };
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
