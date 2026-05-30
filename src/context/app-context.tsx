import type { ManagedFile, ManagedFolder, Settings, Snippet } from "@/data/types";
import {
  createFolder as createManagedFolder,
  exportSnippetPayload,
  initializeFileHub,
  listManagedFiles,
  listManagedFolders,
  readManagedFile,
  shareFile
} from "@/lib/file-hub";
import { generateGeminiInsights } from "@/lib/gemini";
import { generateOpenAIInsights } from "@/lib/openai";
import { deleteSnippet, listSnippets, resetToSeed, saveSnippet } from "@/lib/snippet-db";

import { getApiKey, loadSettings, saveApiKey, saveSettings } from "@/lib/storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SnippetInput = Pick<Snippet, "title" | "code" | "language" | "tags" | "notes"> & {
  attachments?: string[];
};

type AppContextValue = {
  snippets: Snippet[];
  folders: ManagedFolder[];
  files: ManagedFile[];
  settings: Settings;
  activeSnippetId: string | null;
  selectedSnippet: Snippet | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setActiveSnippetId: (id: string) => void;
  createSnippet: (snippet: SnippetInput) => Promise<void>;
  updateSnippet: (snippet: Snippet) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeSnippet: (id: string) => Promise<void>;
  generateInsights: (id: string) => Promise<void>;
  exportSnippet: (id: string, format: "txt" | "js" | "json") => Promise<void>;
  importFileAsSnippet: (path: string) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  saveApiToken: (value: string) => Promise<void>;
  updateThemeMode: (mode: Settings["themeMode"]) => Promise<void>;
  updateProvider: (provider: Settings["apiProvider"]) => Promise<void>;
  resetLibrary: () => Promise<void>;
  notice: {
    visible: boolean;
    title: string;
    message: string;
    actionLabel?: string;
  };
  showNotice: (input: { title: string; message: string; actionLabel?: string }) => void;
  hideNotice: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function buildAiInsights(snippet: Snippet) {
  const source = snippet.code.toLowerCase();
  const suggestions: string[] = [];
  let summary = snippet.aiSummary;

  if (source.includes("fetch")) {
    summary = "This helper wraps network calls in a typed response object.";
    suggestions.push("Add `response.ok` handling and custom error types.");
    suggestions.push("Support `AbortController` for cancelable requests.");
  }

  if (source.includes("useeffect")) {
    summary = "A reusable React hook that synchronizes local state with a side effect.";
    suggestions.push("Avoid direct browser APIs on the server.");
    suggestions.push("Consider a serializer for non-JSON values.");
  }

  if (source.includes("hashlib") || source.includes("token")) {
    summary = "A security-oriented helper that hashes a user value with random entropy.";
    suggestions.push("Use an HMAC if you need verifiable tokens.");
    suggestions.push("Keep the threat model explicit in the snippet notes.");
  }

  if (source.includes("normalize")) {
    summary = "A data preprocessing helper that scales values into a normalized range.";
    suggestions.push("Guard against divide-by-zero when min and max match.");
    suggestions.push("Allow a configurable subset of columns.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Add edge case handling for invalid input.");
    suggestions.push("Consider extracting repeated logic into a helper.");
    suggestions.push("Write a tiny usage example below the snippet.");
  }

  return { summary, suggestions };
}

function buildExportContent(snippet: Snippet, format: "txt" | "js" | "json") {
  if (format === "json") {
    return JSON.stringify(snippet, null, 2);
  }

  if (format === "js") {
    return `// ${snippet.title}\n// Tags: ${snippet.tags.join(", ")}\n\n${snippet.code}\n`;
  }

  return `${snippet.title}\nLanguage: ${snippet.language}\nTags: ${snippet.tags.join(", ")}\n\n${snippet.code}\n`;
}

function inferLanguageFromPath(path: string): Snippet["language"] {
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return "JavaScript";
    case "py":
      return "Python";
    case "md":
      return "Markdown";
    case "json":
      return "JSON";
    case "tsx":
    case "ts":
    default:
      return "TypeScript";
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<ManagedFolder[]>([]);
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [settings, setSettings] = useState<Settings>({
    themeMode: "light",
    apiProvider: "mock",
    apiKeySet: false,
  });
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<AppContextValue["notice"]>({
    visible: false,
    title: "",
    message: "",
  });

  const selectedSnippet = useMemo(
    () => snippets.find((snippet) => snippet.id === activeSnippetId) ?? snippets[0] ?? null,
    [activeSnippetId, snippets]
  );

  async function refresh() {
    const [snippetRows, folderRows, fileRows, nextSettings, apiKey] = await Promise.all([
      listSnippets(),
      listManagedFolders(),
      listManagedFiles(),
      loadSettings(),
      getApiKey(),
    ]);

    setSnippets(snippetRows);
    setFolders(folderRows);
    setFiles(fileRows);
    setSettings({
      ...nextSettings,
      apiKeySet: !!apiKey,
    });
    setActiveSnippetId((current) => current ?? snippetRows[0]?.id ?? null);
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeFileHub();
        await refresh();
      } catch (error) {
        // Keep the app usable even if persistence fails (e.g. AsyncStorage native module missing).
        console.error(error);
        if (mounted) {
          setNotice({
            visible: true,
            title: "Startup issue",
            message: "Storage was unavailable at launch, so the app is running in a limited local state.",
            actionLabel: "OK",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();


    return () => {
      mounted = false;
    };
  }, []);

  async function createSnippet(input: SnippetInput) {
    const now = Date.now();
    const snippet: Snippet = {
      id: `snippet-${now}-${Math.random().toString(16).slice(2, 6)}`,
      favorite: false,
      createdAt: now,
      updatedAt: now,
      aiSummary: `A new ${input.language} snippet waiting for analysis.`,
      aiSuggestions: ["Tap Details to run an offline AI-style explanation."],
      ...input,
      attachments: input.attachments ?? [],
    };

    await saveSnippet(snippet);
    await refresh();
    setActiveSnippetId(snippet.id);
  }

  async function updateSnippet(snippet: Snippet) {
    const nextSnippet = { ...snippet, updatedAt: Date.now() };
    await saveSnippet(nextSnippet);
    await refresh();
    setActiveSnippetId(nextSnippet.id);
  }

  async function toggleFavorite(id: string) {
    const current = snippets.find((snippet) => snippet.id === id);
    if (!current) {
      return;
    }

    await saveSnippet({
      ...current,
      favorite: !current.favorite,
      updatedAt: Date.now(),
    });
    await refresh();
  }

  async function removeSnippet(id: string) {
    await deleteSnippet(id);
    await refresh();
  }

  async function generateInsights(id: string) {
    const current = snippets.find((snippet) => snippet.id === id);
    if (!current) {
      return;
    }

    const apiKey = await getApiKey();
    let analysis = buildAiInsights(current);

    if (settings.apiProvider === "openai") {
      if (!apiKey) {
        setNotice({
          visible: true,
          title: "OpenAI key missing",
          message: "Save your API key in Settings to enable real AI explanations.",
          actionLabel: "OK",
        });
      } else {
        try {
          analysis = await generateOpenAIInsights({ apiKey, snippet: current });
        } catch (error) {
          console.warn("OpenAI insight generation failed", error);
          setNotice({
            visible: true,
            title: "OpenAI unavailable",
            message: "We fell back to offline snippet analysis so you can keep working.",
            actionLabel: "OK",
          });
        }
      }
    } else if (settings.apiProvider === "gemini") {
      if (!apiKey) {
        setNotice({
          visible: true,
          title: "Gemini key missing",
          message: "Save your API key in Settings to enable real AI explanations.",
          actionLabel: "OK",
        });
      } else {
        try {
          analysis = await generateGeminiInsights({ apiKey, snippet: current });
        } catch (error) {
          console.warn("Gemini insight generation failed", error);
          setNotice({
            visible: true,
            title: "Gemini unavailable",
            message: "We fell back to offline snippet analysis so you can keep working.",
            actionLabel: "OK",
          });
        }
      }
    }


    await saveSnippet({
      ...current,
      aiSummary: analysis.summary,
      aiSuggestions: analysis.suggestions,
      updatedAt: Date.now(),
      attachments: current.attachments ?? [],
    });
    await refresh();
  }

  async function exportSnippet(id: string, format: "txt" | "js" | "json") {
    const current = snippets.find((snippet) => snippet.id === id);
    if (!current) {
      return;
    }

    const file = await exportSnippetPayload(current.title, format, buildExportContent(current, format));
    await shareFile(file.uri);
    await refresh();
  }

  async function importFileAsSnippet(path: string) {
    const content = await readManagedFile(path);
    if (content == null) {
      return;
    }

    const fileName = path.split(/[/\\]/).pop() ?? "Imported File";
    const title = fileName.replace(/\.[^.]+$/, "");

    await createSnippet({
      title,
      language: inferLanguageFromPath(path),
      tags: ["files", "imported"],
      code: content,
      notes: `Imported from ${fileName} on device storage.`,
      attachments: [],
    });
  }

  async function createFolder(name: string) {
    await createManagedFolder(name);
    await refresh();
  }

  async function saveApiToken(value: string) {
    await saveApiKey(value);
    await refresh();
  }

  async function updateThemeMode(mode: Settings["themeMode"]) {
    const next = { ...settings, themeMode: mode };
    setSettings(next);
    await saveSettings(next);
  }

  async function updateProvider(provider: Settings["apiProvider"]) {
    const next = { ...settings, apiProvider: provider };
    setSettings(next);
    await saveSettings(next);
  }

  async function resetLibrary() {
    await resetToSeed();
    await refresh();
  }

  function showNotice(input: { title: string; message: string; actionLabel?: string }) {
    setNotice({
      visible: true,
      ...input,
    });
  }

  function hideNotice() {
    setNotice((current) => ({ ...current, visible: false }));
  }

  const value: AppContextValue = {
    snippets,
    folders,
    files,
    settings,
    activeSnippetId,
    selectedSnippet,
    loading,
    refresh,
    setActiveSnippetId,
    createSnippet,
    updateSnippet,
    toggleFavorite,
    removeSnippet,
    generateInsights,
    exportSnippet,
    importFileAsSnippet,
    createFolder,
    saveApiToken,
    updateThemeMode,
    updateProvider,
    resetLibrary,
    notice,
    showNotice,
    hideNotice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
