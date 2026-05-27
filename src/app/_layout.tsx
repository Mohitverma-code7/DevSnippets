import "react-native-reanimated";

import { AppProvider } from "@/context/app-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" options={{ presentation: "modal" }} />
          </Stack>
        </SafeAreaView>
      </AppProvider>
    </GestureHandlerRootView>
  );
}


