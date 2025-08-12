import { useState, useEffect, useContext, createContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus credenciales de Supabase
const supabaseUrl = 'TU_URL_DE_SUPABASE';
const supabaseKey = 'TU_CLAVE_ANON';
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios en la sesión de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cargar el usuario inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Función para manejar el registro de nuevos usuarios
  const signUp = async ({ email, password, fullName, documentNumber, position, weeklyHours, totalHours, campusId }) => {
    setLoading(true);
    try {
      // Es crucial asegurarse de que todos los valores se pasen en un objeto JSON válido.
      // Incluso si un campo es opcional, se debe incluir con un valor null o predeterminado.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || null,
            document_number: documentNumber || null,
            position: position || null,
            weekly_hours: weeklyHours || null,
            number_of_weeks: 16, // Valor predeterminado según tu trigger
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

  const value = {
    user,
    loading,
    signUp,
    // Puedes añadir más funciones como signIn, signOut, etc.
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para consumir el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Ejemplo de cómo usar el hook en un componente
// function SignUpForm() {
//   const { signUp, loading } = useAuth();
//   const [formState, setFormState] = useState({ email: '', password: '', ... });

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const result = await signUp(formState);
//     if (!result.error) {
//       // Redirigir o mostrar un mensaje de éxito
//       console.log('¡Usuario creado con éxito!');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input name="email" value={formState.email} onChange={...} />
//       ...
//       <button type="submit" disabled={loading}>
//         {loading ? 'Registrando...' : 'Registrarse'}
//       </button>
//     </form>
//   );
// }
