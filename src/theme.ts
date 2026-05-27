import { Platform } from "react-native";

export const theme = {
  colors: {
    bg: "#fff7f8",
    surface: "#fff0f2",
    surface2: "#ffe5e9",
    surface3: "#ffd8de",
    card: "#fff5f6",
    border: "#e9b7bf",
    borderStrong: "#d98d9d",
    text: "#3f0d1d",
    textSoft: "#7e5c67",
    textMuted: "#a07d84",
    primary: "#c8103a",
    primaryDeep: "#9f0e2d",
    primarySoft: "rgba(200, 16, 58, 0.12)",
    green: "#0f9d58",
    amber: "#d97706",
    blue: "#2563eb",
    shadow: "rgba(200, 16, 58, 0.12)",
    white: "#ffffff",
  },
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
      ios: "Georgia",
      android: "serif",
      default: "serif",
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

export function shadow(level: 1 | 2 = 1) {
  return {
    shadowColor: theme.colors.primary,
    shadowOpacity: level === 1 ? 0.08 : 0.14,
    shadowRadius: level === 1 ? 10 : 18,
    shadowOffset: { width: 0, height: level === 1 ? 6 : 10 },
    elevation: level,
  };
}

