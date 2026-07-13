import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [useDarkTheme, setUseDarkTheme] = useState(false);

  return (
    <ThemeContext.Provider value={{ useDarkTheme, setUseDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};