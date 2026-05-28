import "react-native-reanimated";

import { AppProvider } from "@/context/app-context";
import { useApp } from "@/context/app-context";
import * as SystemUI from "expo-system-ui";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

function AppShell() {
  const { settings } = useApp();
  const systemScheme = useColorScheme();
  const resolvedScheme = settings.themeMode === "system" ? systemScheme : settings.themeMode;
  const isDark = resolvedScheme === "dark";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(isDark ? "#14070c" : "#fff7f8");
  }, [isDark]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#14070c" : "#fff7f8" }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
