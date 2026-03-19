
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.passwordConfirm, formData.name);
      navigate('/properties');
    } catch (err) {
      setError('Error al crear la cuenta. El correo puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrarse - Corina Capital</title>
        <meta name="description" content="Crea tu cuenta en Corina Capital para acceder a todas las funcionalidades y guardar tus propiedades favoritas." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-muted/30">
          <Card className="w-full max-w-md shadow-soft-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
              <CardDescription>
                Únete a Corina Capital completando el formulario
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-white text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-white text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="bg-white text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    required
                    className="bg-white text-foreground"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full transition-all duration-200 active:scale-98"
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </Button>
                
                <p className="text-sm text-center text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Inicia sesión aquí
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SignupPage;
