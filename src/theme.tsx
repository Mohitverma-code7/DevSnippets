import React, { createContext, useContext, useMemo } from "react";
import { Platform, useColorScheme, type ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export type AppTheme = {
  mode: "light" | "dark";
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    surface3: string;
    card: string;
    border: string;
    borderStrong: string;
    text: string;
    textSoft: string;
    textMuted: string;
    primary: string;
    primaryDeep: string;
    primarySoft: string;
    green: string;
    amber: string;
    blue: string;
    shadow: string;
    white: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  space: {
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  fonts: {
    display: string | undefined;
    body: string | undefined;
    mono: string | undefined;
  };
};

const shared = {
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    full: 999,
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fonts: {
    display: Platform.select({
      ios: "Avenir Next",
      android: "sans-serif-medium",
      default: "system-ui",
    }),
    body: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "System",
    }),
    mono: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
  },
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    bg: "#fff5f7",
    surface: "#fff8f9",
    surface2: "#ffe9ee",
    surface3: "#ffdce3",
    card: "#ffffff",
    border: "#e9c1cb",
    borderStrong: "#d48a99",
    text: "#38101c",
    textSoft: "#72505d",
    textMuted: "#9c7f88",
    primary: "#be123c",
    primaryDeep: "#93102f",
    primarySoft: "rgba(190, 18, 60, 0.12)",
    green: "#0f9d58",
    amber: "#d97706",
    blue: "#2563eb",
    shadow: "rgba(190, 18, 60, 0.14)",
    white: "#ffffff",
  },
  ...shared,
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    bg: "#13070d",
    surface: "#1b0d14",
    surface2: "#251019",
    surface3: "#31131e",
    card: "#210f18",
    border: "#422433",
    borderStrong: "#6a3a51",
    text: "#f9e6eb",
    textSoft: "#d6b9c3",
    textMuted: "#af8f9b",
    primary: "#f14672",
    primaryDeep: "#ff6b92",
    primarySoft: "rgba(241, 70, 114, 0.16)",
    green: "#38d996",
    amber: "#f3b84b",
    blue: "#78a6ff",
    shadow: "rgba(0, 0, 0, 0.35)",
    white: "#ffffff",
  },
  ...shared,
};

export function resolveTheme(mode: ThemeMode, scheme: ColorSchemeName | null | undefined) {
  const resolved = mode === "system" ? scheme ?? "light" : mode;
  return resolved === "dark" ? darkTheme : lightTheme;
}

const ThemeContext = createContext<AppTheme>(lightTheme);

export function ThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();
  const theme = useMemo(() => resolveTheme(mode, scheme), [mode, scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function shadow(theme: AppTheme, level: 1 | 2 = 1) {
  return {
    shadowColor: theme.colors.shadow,
    shadowOpacity: level === 1 ? 0.18 : 0.28,
    shadowRadius: level === 1 ? 10 : 18,
    shadowOffset: { width: 0, height: level === 1 ? 6 : 10 },
    elevation: level,
  };
}

export const theme = lightTheme;
