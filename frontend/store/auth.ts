import { create } from 'zustand';

interface User {
  email: string;
  role: string;
  name?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  user: User | null;
  
  // Acciones
  login: (token: string, user: User) => void;
  logout: () => void;
  checkSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isAdmin: false,
  user: null,

  login: (token, user) => {
    // 1. Guardar en disco (para persistencia)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // 2. Actualizar estado en memoria (React se entera al instante)
    set({ 
      isLoggedIn: true, 
      isAdmin: user.role === 'ADMIN', 
      user 
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ isLoggedIn: false, isAdmin: false, user: null });
  },

  checkSession: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      set({ 
        isLoggedIn: true, 
        isAdmin: user.role === 'ADMIN', 
        user 
      });
    }
  }
}));