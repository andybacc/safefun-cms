import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    const stored = localStorage.getItem('safefun_cms_api_url');
    if (stored) return stored;
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? 'https://api-public.safefun.it'
      : 'http://localhost:8787';
  });

  const [revenueCatKey, setRevenueCatKey] = useState(() => {
    return localStorage.getItem('safefun_cms_rc_key') || import.meta.env.VITE_REVENUECAT_KEY || '';
  });

  const [resendKey, setResendKey] = useState(() => {
    return localStorage.getItem('safefun_cms_resend_key') || import.meta.env.VITE_RESEND_KEY || '';
  });

  useEffect(() => {
    localStorage.setItem('safefun_cms_api_url', apiBaseUrl);
  }, [apiBaseUrl]);

  useEffect(() => {
    localStorage.setItem('safefun_cms_rc_key', revenueCatKey);
  }, [revenueCatKey]);

  useEffect(() => {
    localStorage.setItem('safefun_cms_resend_key', resendKey);
  }, [resendKey]);

  return (
    <ConfigContext.Provider
      value={{
        apiBaseUrl,
        setApiBaseUrl,
        revenueCatKey,
        setRevenueCatKey,
        resendKey,
        setResendKey,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
