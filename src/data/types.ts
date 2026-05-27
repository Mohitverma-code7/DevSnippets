export type SnippetLanguage = "TypeScript" | "JavaScript" | "Python" | "React" | "JSON" | "Markdown";

export type Snippet = {
  id: string;
  title: string;
  code: string;
  language: SnippetLanguage;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  notes: string;
  aiSummary: string;
  aiSuggestions: string[];
};

export type ManagedFolder = {
  name: string;
  itemCount: number;
  sizeLabel: string;
  accent: string;
  progress: number;
};

export type ManagedFile = {
  name: string;
  path: string;
  sizeLabel: string;
  kind: "file" | "folder";
  modifiedLabel: string;
  modifiedAt: number;
  icon: string;
};

export type Settings = {
  themeMode: "light" | "system";
  apiProvider: "mock" | "openai";
  apiKeySet: boolean;
};
