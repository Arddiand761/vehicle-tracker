import { useState } from 'react';
import type { User } from '../types/index';

export const useAuth = () => {
  const [user] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return { user, token, isAuthenticated, logout };
};