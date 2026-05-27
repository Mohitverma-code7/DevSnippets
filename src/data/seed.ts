import type { ManagedFolder, Snippet } from "@/data/types";

const now = Date.now();

export const seedSnippets: Snippet[] = [
  {
    id: "snippet-1",
    title: "Custom Hook: useLocalStorage",
    language: "TypeScript",
    tags: ["hooks", "react", "local-storage"],
    code: `import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
    favorite: true,
    createdAt: now - 1000 * 60 * 60 * 26,
    updatedAt: now - 1000 * 60 * 40,
    notes: "Local storage wrapper that keeps state persistent without a backend.",
    aiSummary: "A reusable hook that synchronizes React state with browser storage.",
    aiSuggestions: [
      "Add schema validation before parsing JSON to avoid runtime crashes.",
      "Guard against server-side rendering where localStorage is unavailable.",
      "Consider a serializer option for non-JSON values like Dates or Maps.",
    ],
  },
  {
    id: "snippet-2",
    title: "Data Normalization Script",
    language: "Python",
    tags: ["python", "data", "etl"],
    code: `def normalize_data(df):
    result = df.copy()
    for feature_name in df.columns:
        max_value = df[feature_name].max()
        min_value = df[feature_name].min()
        result[feature_name] = (df[feature_name] - min_value) / (max_value - min_value)
    return result`,
    favorite: false,
    createdAt: now - 1000 * 60 * 60 * 14,
    updatedAt: now - 1000 * 60 * 60 * 4,
    notes: "Normalizes numeric columns into the 0-1 range.",
    aiSummary: "Scales a dataframe column-by-column using min-max normalization.",
    aiSuggestions: [
      "Handle the edge case where max and min are equal to avoid division by zero.",
      "Skip non-numeric columns or allow a selectable subset of columns.",
      "Return a copy with dtype preservation if downstream code relies on it.",
    ],
  },
  {
    id: "snippet-3",
    title: "Generic API Wrapper",
    language: "TypeScript",
    tags: ["api", "fetch", "async"],
    code: `interface ApiResponse<T> {
  data: T;
  status: number;
}

export async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();

  return {
    data,
    status: response.status,
  };
}`,
    favorite: true,
    createdAt: now - 1000 * 60 * 90,
    updatedAt: now - 1000 * 60 * 15,
    notes: "Tiny fetch helper for typed network responses.",
    aiSummary: "Wraps `fetch` in a typed response object for cleaner callers.",
    aiSuggestions: [
      "Check `response.ok` and surface a proper error when requests fail.",
      "Allow an AbortSignal so callers can cancel in-flight requests.",
      "Make the parser configurable if endpoints do not always return JSON.",
    ],
  },
  {
    id: "snippet-4",
    title: "Secure Token Generator",
    language: "Python",
    tags: ["security", "authentication", "api"],
    code: `import hashlib
import secrets

def generate_secure_token(user_id: str) -> str:
    salt = secrets.token_hex(16)
    raw_string = f"{user_id}:{salt}"
    return hashlib.sha256(raw_string.encode()).hexdigest()`,
    favorite: false,
    createdAt: now - 1000 * 60 * 22,
    updatedAt: now - 1000 * 60 * 6,
    notes: "Creates a deterministic token from an identifier and random salt.",
    aiSummary: "Combines a random salt with an identifier before hashing into a token.",
    aiSuggestions: [
      "Use an HMAC with a secret key if the token must be verifiable later.",
      "Store the salt or generation context if you need to validate the token.",
      "Document the threat model so this helper is not confused with auth itself.",
    ],
  },
];

export const seedFolders: ManagedFolder[] = [
  { name: "Screenshots", itemCount: 124, sizeLabel: "450 MB", accent: "#f7c9d2", progress: 0.42 },
  { name: "Templates", itemCount: 48, sizeLabel: "12 MB", accent: "#f0bcc7", progress: 0.24 },
  { name: "Exports", itemCount: 12, sizeLabel: "1.2 GB", accent: "#ef7c8f", progress: 0.84 },
];

