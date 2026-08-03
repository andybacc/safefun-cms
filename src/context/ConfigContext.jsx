import React, { createContext, useContext, useState, useEffect } from 'react';

export const SERVER_PRESETS = [
  { id: 'local', name: 'Sviluppo Locale', label: 'localhost:8787', url: 'http://localhost:8787' },
  { id: 'online', name: 'Produzione Online', label: 'api-public.safefun.it', url: 'https://api-public.safefun.it' },
];

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    return (
      localStorage.getItem('safefun_cms_api_url') ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:8787'
    );
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
        SERVER_PRESETS,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
