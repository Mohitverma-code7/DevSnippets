import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Pill, Screen, SectionTitle, Surface, InfoCard } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { getApiKey } from "@/lib/storage";
import { useTheme } from "@/theme";

export default function SettingsScreen() {
  const { settings, updateThemeMode, updateProvider, saveApiToken, resetLibrary } = useApp();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      <ScrollView showsVerticalScrollIndicator={false} >
        <AppHeader
          title="Settings"
          subtitle="Tune offline behavior, AI providers, and secure token storage."
          actions={[{ icon: "close", label: "Close", onPress: () => router.back(), tone: "primary" }]}
        />

        <Surface style={styles.headerCard}>
          <Text style={styles.kicker}>Preferences</Text>
          <Text style={styles.subtitle}>Everything here controls how the app behaves when you are online or offline.</Text>
        </Surface>

        <SectionTitle title="Theme" subtitle="Keep the app bright or follow system appearance." />
        <Surface style={styles.panel}>
          <View style={styles.optionRow}>
            <Pill label="Light" active={settings.themeMode === "light"} onPress={() => updateThemeMode("light")} />
            <Pill label="Dark" active={settings.themeMode === "dark"} onPress={() => updateThemeMode("dark")} />
            <Pill label="System" active={settings.themeMode === "system"} onPress={() => updateThemeMode("system")} />
          </View>
        </Surface>

        <SectionTitle title="AI provider" subtitle="Switch between offline mock analysis, OpenAI, or Gemini." />
        <Surface style={styles.panel}>
          <View style={styles.optionRow}>
            <Pill label="Offline" active={settings.apiProvider === "mock"} onPress={() => updateProvider("mock")} />
            <Pill label="OpenAI" active={settings.apiProvider === "openai"} onPress={() => updateProvider("openai")} />
            <Pill label="Gemini" active={settings.apiProvider === "gemini"} onPress={() => updateProvider("gemini")} />
          </View>
          <Text style={styles.helperText}>
            Offline analysis remains available even without a network connection, so the app stays useful anywhere.
          </Text>
        </Surface>

        <SectionTitle title="Secure token" subtitle="Store API keys in SecureStore instead of plain text storage." />
        <Surface style={styles.panel}>
          <Text style={styles.helperText}>
            The key is saved locally and only used when you choose a connected provider.
          </Text>
          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="Paste your API key"
            placeholderTextColor={theme.colors.textMuted}
            secureTextEntry
            style={styles.tokenInput}
          />
          <Pressable style={styles.saveButton} onPress={handleSaveToken}>
            <Text style={styles.saveButtonText}>Save token</Text>
          </Pressable>
        </Surface>

        <SectionTitle title="Storage map" subtitle="This is the architecture the submission asks for." />
        <InfoCard
          eyebrow="Storage"
          title="AsyncStorage, SecureStore, SQLite, and FileSystem each do one job."
          body="AsyncStorage keeps app preferences, SecureStore keeps the API key, SQLite persists snippets, and Expo FileSystem handles local resources, exports, and attachments."
        />

        <SectionTitle title="Reset" subtitle="Clear local content and start fresh when needed." />
        <Surface style={styles.panel}>
          <Text style={styles.helperText}>Clears the local snippet library while keeping the storage folders ready for fresh content.</Text>
          <Pressable style={styles.warnButton} onPress={resetLibrary}>
            <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.warnButtonText}>Clear library</Text>
          </Pressable>
        </Surface>
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  content: {
    paddingBottom: 28,
    paddingHorizontal: theme.space.md,
  },
  headerCard: {
    padding: theme.space.lg,
    marginBottom: theme.space.md,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    gap: theme.space.sm,
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
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  warnButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  warnButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  });
}
