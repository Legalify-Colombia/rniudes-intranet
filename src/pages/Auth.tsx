import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    documentNumber: '',
    position: '',
    weeklyHours: 0,
    numberOfWeeks: 16,
  });

  // Define positions with comprehensive validation
  const allPositions = [
    'Director DRNI',
    'Coordinador de Campus', 
    'Director de Programa',
    'Gestor de Internacionalización'
  ];

  // Filter out any potential empty values with multiple checks
  const positions = allPositions.filter(position => {
    const isValid = position && 
                   typeof position === 'string' && 
                   position.trim().length > 0 && 
                   position !== '';
    console.log('Auth - Position validation:', position, 'Valid:', isValid);
    return isValid;
  });

  console.log('Auth - Final positions array:', positions);

  const getRoleFromPosition = (position: string) => {
    if (!position || typeof position !== 'string' || position.trim() === '') {
      console.log('Auth - getRoleFromPosition: Invalid position:', position);
      return '';
    }
    
    switch (position.trim()) {
      case 'Director DRNI':
      case 'Coordinador de Campus':
        return 'Administrador';
      case 'Director de Programa':
        return 'Coordinador';
      case 'Gestor de Internacionalización':
        return 'Gestor';
      default:
        console.log('Auth - getRoleFromPosition: Unknown position:', position);
        return '';
    }
  };

  const handlePositionChange = (position: string) => {
    console.log('Auth - Position change called with:', position, 'Type:', typeof position);
    
    // Comprehensive validation
    if (!position || 
        typeof position !== 'string' || 
        position.trim() === '' || 
        position.length === 0) {
      console.log('Auth - Invalid position detected, not setting:', position);
      return;
    }

    // Additional check to ensure it's in our valid positions array
    const trimmedPosition = position.trim();
    if (positions.includes(trimmedPosition)) {
      console.log('Auth - Setting valid position:', trimmedPosition);
      setFormData(prev => ({ ...prev, position: trimmedPosition }));
    } else {
      console.log('Auth - Position not in valid list:', trimmedPosition, 'Valid positions:', positions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.position || formData.position.trim() === "") {
          toast({
            title: 'Error',
            description: 'El cargo es requerido',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          documentNumber: formData.documentNumber,
          position: formData.position,
          role: getRoleFromPosition(formData.position),
          weeklyHours: formData.position === 'Gestor de Internacionalización' ? formData.weeklyHours : undefined,
          numberOfWeeks: formData.position === 'Gestor de Internacionalización' ? formData.numberOfWeeks : undefined,
        });

        if (error) {
          toast({
            title: 'Error al registrarse',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Registro exitoso',
            description: 'Se ha enviado un correo de confirmación.',
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          toast({
            title: 'Error al iniciar sesión',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            DRNI - Gestión
          </CardTitle>
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Crear nueva cuenta' : 'Iniciar sesión'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentNumber">No. de Documento</Label>
                  <Input
                    id="documentNumber"
                    type="text"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Cargo</Label>
                  <Select 
                    value={formData.position || undefined} 
                    onValueChange={handlePositionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => {
                        // Extra safety check before rendering SelectItem
                        if (!position || typeof position !== 'string' || position.trim() === '') {
                          console.warn('Auth - Skipping invalid position in render:', position);
                          return null;
                        }
                        
                        const trimmedPosition = position.trim();
                        console.log('Auth - Rendering SelectItem for position:', trimmedPosition);
                        
                        return (
                          <SelectItem key={trimmedPosition} value={trimmedPosition}>
                            {trimmedPosition}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {formData.position === 'Gestor de Internacionalización' && (
                  <>
                    <div>
                      <Label htmlFor="weeklyHours">Horas Semanales</Label>
                      <Input
                        id="weeklyHours"
                        type="number"
                        value={formData.weeklyHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="numberOfWeeks">Número de Semanas</Label>
                      <Input
                        id="numberOfWeeks"
                        type="number"
                        value={formData.numberOfWeeks}
                        onChange={(e) => setFormData(prev => ({ ...prev, numberOfWeeks: parseInt(e.target.value) || 16 }))}
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full institutional-gradient text-white" disabled={loading}>
              {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
