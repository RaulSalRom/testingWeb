
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      toast.success('Inicio de sesión exitoso');
      return { success: true, user: authData.record };
    } catch (error) {
      const message = error.message || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        name: name || email.split('@')[0],
        emailVisibility: true
      };
      
      const record = await pb.collection('users').create(data);
      
      // Auto-login after signup
      await login(email, password);
      
      toast.success('Cuenta creada exitosamente');
      return { success: true, user: record };
    } catch (error) {
      const message = error.message || 'Error al crear cuenta';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    toast.success('Sesión cerrada');
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  const value = {
    currentUser,
    isAuthenticated: pb.authStore.isValid,
    isAdmin,
    login,
    signup,
    logout,
    initialLoading
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
