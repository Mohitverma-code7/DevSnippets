import "react-native-reanimated";

import { AppProvider, useApp } from "@/context/app-context";
import * as SystemUI from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/theme";
import { StatusDialog } from "@/components/ui";

function AppShell() {
  const { notice, hideNotice } = useApp();
  const theme = useTheme();
  const isDark = theme.mode === "dark";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.bg);
  }, [theme.colors.bg]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
      <StatusDialog
        visible={notice.visible}
        title={notice.title}
        message={notice.message}
        actionLabel={notice.actionLabel ?? "OK"}
        onAction={hideNotice}
      />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootWithTheme />
      </AppProvider>
    </GestureHandlerRootView>
  );
}

function RootWithTheme() {
  const { settings } = useApp();
  return (
    <ThemeProvider mode={settings.themeMode}>
      <AppShell />
    </ThemeProvider>
  );
}
