import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import { Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { theme } from "@/theme";
import { getApiKey } from "@/lib/storage";

export default function SettingsScreen() {
  const { settings, updateThemeMode, updateProvider, saveApiToken, resetLibrary } = useApp();
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      setToken((await getApiKey()) ?? "");
    })();
  }, []);

  async function handleSaveToken() {
    await saveApiToken(token);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>DevSnippets AI</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.close}>×</Text>
          </Pressable>
        </View>

        <SectionTitle title="Settings" />

        <Surface style={styles.panel}>
          <Text style={styles.panelTitle}>Theme Preference</Text>
          <View style={styles.optionRow}>
            <Pill label="Light" active={settings.themeMode === "light"} onPress={() => updateThemeMode("light")} />
            <Pill label="System" active={settings.themeMode === "system"} onPress={() => updateThemeMode("system")} />
          </View>
        </Surface>

        <Surface style={styles.panel}>
          <Text style={styles.panelTitle}>AI Provider</Text>
          <View style={styles.optionRow}>
            <Pill label="Mock Offline" active={settings.apiProvider === "mock"} onPress={() => updateProvider("mock")} />
            <Pill label="OpenAI" active={settings.apiProvider === "openai"} onPress={() => updateProvider("openai")} />
          </View>
          <Text style={styles.helperText}>Offline analysis is enabled by default so the app still works without internet.</Text>
        </Surface>

        <Surface style={styles.panel}>
          <Text style={styles.panelTitle}>Secure Token</Text>
          <Text style={styles.helperText}>Stored locally in SecureStore for API keys or sensitive credentials.</Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="Paste your API key"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.tokenInput}
          />
          <Pressable style={styles.saveButton} onPress={handleSaveToken}>
            <Text style={styles.saveButtonText}>Save Token</Text>
          </Pressable>
        </Surface>

        <Surface style={styles.panel}>
          <Text style={styles.panelTitle}>Library Reset</Text>
          <Text style={styles.helperText}>Restore the demo snippets and file structure used in the walkthrough.</Text>
          <Pressable style={styles.warnButton} onPress={resetLibrary}>
            <Text style={styles.warnButtonText}>Reset Demo Data</Text>
          </Pressable>
        </Surface>

        <Surface style={styles.panel}>
          <Text style={styles.panelTitle}>Submission Notes</Text>
          <Text style={styles.helperText}>
            SQLite stores snippets, AsyncStorage handles preferences, SecureStore keeps sensitive values, and Expo FileSystem manages local files.
          </Text>
        </Surface>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginHorizontal: -theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: "#ffe8ec",
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  close: {
    color: theme.colors.textSoft,
    fontSize: 30,
    fontWeight: "500",
  },
  panel: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    gap: theme.space.sm,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  helperText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  saveButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  warnButton: {
    borderRadius: theme.radius.md,
    backgroundColor: "#ffe4e8",
    alignItems: "center",
    paddingVertical: 12,
  },
  warnButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
});

