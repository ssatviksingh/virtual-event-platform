import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext(); // create theme context

export const ThemeProvider = ({ children }) => { // theme provider
  const [darkMode, setDarkMode] = useState(false); // dark mode state

  const toggleTheme = () => setDarkMode((prev) => !prev); // toggle theme

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children} // children from app.tsx (MainTabs)
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); // use theme context
