export type SnippetLanguage =
  | "TypeScript"
  | "JavaScript"
  | "Python"
  | "React"
  | "Bash"
  | "SQL"
  | "CSS"
  | "JSON"
  | "Markdown";

export type Snippet = {
  id: string;
  title: string;
  code: string;
  language: SnippetLanguage;
  tags: string[];
  attachments: string[];
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
  previewUri?: string | null;
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
  themeMode: "light" | "dark" | "system";
  apiProvider: "mock" | "openai" | "gemini";

  apiKeySet: boolean;
};
