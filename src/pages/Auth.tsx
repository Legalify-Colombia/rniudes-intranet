
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getValidPositions, getRoleFromPosition, validatePosition, type Position } from '@/utils/positionUtils';

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

  // Get positions with more robust validation
  const positions = getValidPositions().filter(pos => 
    pos && 
    typeof pos === 'string' && 
    pos.trim().length > 0 && 
    validatePosition(pos)
  );

  const handlePositionChange = (position: string) => {
    console.log('Auth - Position change called with:', position, 'Type:', typeof position);
    
    // Extra validation to ensure we never set an empty string
    if (position && typeof position === 'string' && position.trim().length > 0 && validatePosition(position)) {
      console.log('Auth - Setting valid position:', position);
      setFormData(prev => ({ ...prev, position: position.trim() }));
    } else {
      console.log('Auth - Invalid position detected, not setting:', position);
      // Reset to empty string to show placeholder
      setFormData(prev => ({ ...prev, position: '' }));
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
          <div className="flex justify-center mb-4">
            <img 
              src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png" 
              alt="UDES Logo" 
              className="h-16 w-auto"
            />
          </div>
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
                        // Triple validation to prevent empty values
                        if (!validatePosition(position)) {
                          console.warn('Auth - Skipping invalid position in render:', position);
                          return null;
                        }
                        return (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        );
                      }).filter(Boolean)}
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
