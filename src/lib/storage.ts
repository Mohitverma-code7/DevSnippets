import type { Settings } from "@/data/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const SETTINGS_KEY = "devsnippets.settings";
const API_KEY = "devsnippets.apiKey";

const defaultSettings: Settings = {
  themeMode: "light",
  apiProvider: "mock",
  apiKeySet: false,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...defaultSettings,
      ...parsed,
      apiKeySet: !!(await getApiKey()),
    };
  } catch {
    // If AsyncStorage native module isn't available (can happen on misconfigured builds/dev clients),
    // fall back to defaults so the app can still start.
    return defaultSettings;
  }
}

export async function saveSettings(nextSettings: Settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  } catch {
    // Same rationale as loadSettings(): keep UI functional even if native storage is unavailable.
  }
}

export async function getApiKey() {
  return SecureStore.getItemAsync(API_KEY);
}

export async function saveApiKey(value: string) {
  if (!value.trim()) {
    await SecureStore.deleteItemAsync(API_KEY);
    return;
  }

  await SecureStore.setItemAsync(API_KEY, value.trim());
}
