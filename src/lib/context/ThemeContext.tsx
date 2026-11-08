"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read theme preference from localStorage or default to system preference
    const storedTheme = localStorage.getItem("ghar_theme") as ThemeMode | null;
    if (storedTheme) {
      setMode(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("ghar_theme", newMode);
    document.documentElement.classList.toggle("dark", newMode === "dark");
  };

  // Build the Material UI Theme matching our custom design rules:
  // Primary #064e3b, Secondary #10b981, Accent/Warning #6E2C00
  const muiTheme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: "#064e3b", // Primary Navy Blue
          light: "#3b82f6",
          dark: "#172554",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#10b981", // Secondary Vibrant Blue
          light: "#60a5fa",
          dark: "#1d4ed8",
          contrastText: "#ffffff",
        },
        warning: {
          main: "#6E2C00", // Accent / Tertiary Rust Brown
        },
        background: {
          default: mode === "light" ? "#F8FAFC" : "#0B0F19",
          paper: mode === "light" ? "#ffffff" : "#12192C",
        },
        text: {
          primary: mode === "light" ? "#1E293B" : "#F8FAFC",
          secondary: mode === "light" ? "#64748B" : "#cbd5e1",
        },
      },
      shape: {
        borderRadius: 12,
      },
      typography: {
        fontFamily: 'var(--font-inter), "Inter", "Helvetica", "Arial", sans-serif',
        h1: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 700,
        },
        h2: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 700,
        },
        h3: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 600,
        },
        h4: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 600,
        },
        h5: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 600,
        },
        h6: {
          fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              padding: "8px 16px",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(30, 58, 138, 0.15)",
              },
            },
            containedPrimary: {
              "&:hover": {
                backgroundColor: "#172554",
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: "16px",
              boxShadow: mode === "light"
                ? "0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)"
                : "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.2)",
              backgroundImage: "none",
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {!mounted ? (
          <div style={{ visibility: "hidden" }}>{children}</div>
        ) : (
          children
        )}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
