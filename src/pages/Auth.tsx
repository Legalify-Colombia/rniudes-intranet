import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; // Importar íconos
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getValidPositions, getRoleFromPosition, validatePosition } from '@/utils/positionUtils';

export default function Auth() {
  // --- TODA TU LÓGICA Y ESTADOS SE MANTIENEN INTACTOS ---
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
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

  const positions = getValidPositions().filter(pos =>
    pos && typeof pos === 'string' && pos.trim().length > 0 && validatePosition(pos)
  );

  const handlePositionChange = (position: string) => {
    if (position && typeof position === 'string' && position.trim().length > 0 && validatePosition(position)) {
      setFormData(prev => ({ ...prev, position: position.trim() }));
    } else {
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
           setIsSignUp(false); // Opcional: cambiar a la vista de login tras registro exitoso
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

  // --- NUEVA ESTRUCTURA VISUAL CON TU LÓGICA INTEGRADA ---
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex rounded-2xl overflow-hidden shadow-2xl">
        {/* Lado Izquierdo - Sección Hero con imagen */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
          {/* Puedes cambiar esta URL por la imagen que prefieras */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070')] bg-cover bg-center opacity-25" />
          <div className="relative z-10 p-12 flex flex-col justify-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-foreground">
                  Sistema de Gestión DRNI
                </h2>
                <p className="text-lg text-muted-foreground">
                  Bienvenido al portal de la Dirección de Relaciones Nacionales e Internacionales.
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border">
                <p className="text-sm text-muted-foreground">
                  "Comprometidos con la excelencia académica y la proyección global de nuestra comunidad universitaria."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho - Formulario de Autenticación */}
        <div className="flex-1 bg-card">
          <Card className="h-full border-0 shadow-none rounded-none">
            {/* Cabecera con tu logo y título dinámico */}
            <CardHeader className="space-y-1 pb-8 pt-12 text-center">
               <div className="flex justify-center mb-4">
                 <img
                   src="https://udes.edu.co/images/logo/logo-con-acreditada-color.png"
                   alt="UDES Logo"
                   className="h-16 w-auto"
                 />
               </div>
              <CardTitle className="text-3xl font-bold">
                DRNI - Gestión
              </CardTitle>
              <CardDescription className="text-base">
                {isSignUp ? 'Crea una nueva cuenta para comenzar' : 'Ingresa tus credenciales para acceder'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 px-8">
              {/* Formulario con todos tus campos y lógica */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input id="fullName" type="text" placeholder="Tu nombre completo" value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} required className="h-12"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">No. de Documento</Label>
                      <Input id="documentNumber" type="text" placeholder="Tu número de documento" value={formData.documentNumber} onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))} required className="h-12"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Select value={formData.position || undefined} onValueChange={handlePositionChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Seleccionar cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position} value={position}>{position}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.position === 'Gestor de Internacionalización' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="weeklyHours">Horas Semanales</Label>
                          <Input id="weeklyHours" type="number" value={formData.weeklyHours} onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) || 0 }))} required className="h-12"/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numberOfWeeks">Número de Semanas</Label>
                          <Input id="numberOfWeeks" type="number" value={formData.numberOfWeeks} onChange={(e) => setFormData(prev => ({ ...prev, numberOfWeeks: parseInt(e.target.value) || 16 }))} required className="h-12"/>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" placeholder="correo@udes.edu.co" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required className="h-12"/>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ingresa tu contraseña"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 pr-10"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Procesando...</span>
                    </div>
                  ) : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="pb-12">
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">
                   {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
                  <Button variant="link" className="px-1.5 text-sm font-medium" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? 'Inicia sesión' : 'Regístrate'}
                  </Button>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}