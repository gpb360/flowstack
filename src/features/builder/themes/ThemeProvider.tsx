import React, { createContext, useContext, useEffect } from 'react';
import type { Theme } from '../types';

// ============================================================================
// THEME PROVIDER - Apply theme styles to site
// ============================================================================

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  useEffect(() => {
    // Apply CSS custom properties
    const root = document.documentElement;

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Fonts
    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getThemeCSSVariables(theme: Theme): string {
  let css = ':root {\n';

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });

  // Fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    css += `  --font-${key}: '${value}', sans-serif;\n`;
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });

  css += '}';

  return css;
}

export function generateThemeCSS(theme: Theme): string {
  const colors = theme.colors;

  return `
/* Base Styles */
body {
  background-color: ${colors.background};
  color: ${colors.foreground};
  font-family: ${theme.fonts.body};
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: ${theme.fonts.heading};
  color: ${colors.foreground};
}

/* Buttons */
.btn-primary {
  background-color: ${colors.primary};
  color: ${colors.background};
}

.btn-secondary {
  background-color: ${colors.secondary};
  color: ${colors.background};
}

/* Cards */
.card {
  background-color: ${colors.card};
  color: colors['card-foreground'];
  border: 1px solid ${colors.border};
  border-radius: ${theme.borderRadius.lg};
}

/* Inputs */
input, textarea, select {
  background-color: ${colors.background};
  color: ${colors.foreground};
  border: 1px solid ${colors.border};
  border-radius: ${theme.borderRadius.md};
}
  `.trim();
}
