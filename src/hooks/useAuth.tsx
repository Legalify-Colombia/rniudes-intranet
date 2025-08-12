import { useState, useEffect, useContext, createContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CAMBIO IMPORTANTE: Ingresa tus credenciales aquí manualmente.
// Esto soluciona los errores de compilación con 'import.meta'.
const supabaseUrl = "https://fdfovqfvisrtzdtkgcdj.supabase.co"; // Reemplaza con la URL de tu proyecto
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZm92cWZ2aXNydHpkdGtnY2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ1ODIsImV4cCI6MjA2NTk1MDU4Mn0.an5CvVlhuaio_OShrEvBuNkbzaFxz5huuiQxdArfIPc"; // Reemplaza con tu clave anon pública

// Validar que las variables estén definidas antes de crear el cliente
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las credenciales de Supabase no están definidas. Por favor, ingresa tu URL y clave de Supabase en el código.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, fullName, documentNumber, position, weeklyHours, totalHours, campusId }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            document_number: documentNumber || null,
            position: position || null,
            weekly_hours: weeklyHours || null,
            number_of_weeks: 16,
            total_hours: totalHours || null,
            campus_id: campusId || null,
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
