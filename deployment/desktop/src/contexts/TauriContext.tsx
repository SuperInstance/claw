import React, { createContext, useContext, useState } from 'react';

interface TauriContextType {
  isTauri: boolean;
  initTauri: () => Promise<void>;
}

const TauriContext = createContext<TauriContextType>({
  isTauri: false,
  initTauri: async () => {},
});

export const useTauriContext = () => useContext(TauriContext);

export const TauriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTauri, setIsTauri] = useState(false);

  const initTauri = async () => {
    // Check if running in Tauri
    if (window.__TAURI__) {
      setIsTauri(true);
      console.log('Running in Tauri environment');
    } else {
      console.log('Running in web environment');
    }
  };

  return (
    <TauriContext.Provider value={{ isTauri, initTauri }}>
      {children}
    </TauriContext.Provider>
  );
};
