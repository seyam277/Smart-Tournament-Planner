import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    user: context.organizer,
    token: context.authToken,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    setIsLoading: context.setIsLoading
  };
};
