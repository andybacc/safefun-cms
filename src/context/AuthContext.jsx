import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('safefun_cms_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (username, password) => {
    const creds = { username, password, timestamp: Date.now() };
    setCredentials(creds);
    localStorage.setItem('safefun_cms_auth', JSON.stringify(creds));
  };

  const logout = () => {
    setCredentials(null);
    localStorage.removeItem('safefun_cms_auth');
  };

  const getAuthHeader = () => {
    if (!credentials) return {};
    const encoded = btoa(`${credentials.username}:${credentials.password}`);
    return {
      Authorization: `Basic ${encoded}`,
      'x-username': credentials.username,
      'x-password': credentials.password,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!credentials,
        credentials,
        login,
        logout,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
