import type { Snippet } from "@/data/types";

type GeminiInsights = {
  summary: string;
  suggestions: string[];
};

function stripCodeFences(value: string) {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function fallbackInsights(snippet: Snippet): GeminiInsights {
  return {
    summary: `A ${snippet.language} snippet focused on ${snippet.title.toLowerCase()}.`,
    suggestions: [
      "Add a short usage example below the snippet.",
      "Handle invalid input and edge cases explicitly.",
      "Extract repeated logic into a helper if the snippet grows.",
    ],
  };
}

function extractTextFromGeminiPayload(payload: unknown): string {
  const asAny = payload as any;

  const text =
    asAny?.candidates?.[0]?.content?.parts
      ?.map((p: any) => (typeof p?.text === "string" ? p.text : ""))
      ?.join("") ??
    asAny?.contents?.[0]?.parts
      ?.map((p: any) => (typeof p?.text === "string" ? p.text : ""))
      ?.join("") ??
    asAny?.output?.text ??
    asAny?.text ??
    "";

  return typeof text === "string" ? text : "";
}

export async function generateGeminiInsights({
  apiKey,
  snippet,
  model = "gemini-2.0-flash",
}: {
  apiKey: string;
  snippet: Snippet;
  model?: string;
}): Promise<GeminiInsights> {
  if (!apiKey.trim()) {
    return fallbackInsights(snippet);
  }

  try {
    const prompt = [
      "You are helping a developer understand a code snippet.",
      "Return ONLY valid JSON with keys: summary (string) and suggestions (array of 3 short strings).",
      "Make the summary concise and the suggestions practical.",
      `Title: ${snippet.title}`,
      `Language: ${snippet.language}`,
      `Tags: ${snippet.tags.join(", ")}`,
      `Notes: ${snippet.notes || "N/A"}`,
      "Code:",
      snippet.code,
    ].join("\n");

    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 700,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
    }

    const payload = await response.json();
    const cleaned = stripCodeFences(extractTextFromGeminiPayload(payload));

    try {
      const parsed = JSON.parse(cleaned) as Partial<GeminiInsights>;
      return {
        summary:
          typeof parsed.summary === "string" && parsed.summary.trim()
            ? parsed.summary
            : fallbackInsights(snippet).summary,
        suggestions:
          Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0
            ? parsed.suggestions.filter((item): item is string => typeof item === "string").slice(0, 3)
            : fallbackInsights(snippet).suggestions,
      };
    } catch {
      return {
        summary: cleaned || fallbackInsights(snippet).summary,
        suggestions: fallbackInsights(snippet).suggestions,
      };
    }
  } catch {
    return fallbackInsights(snippet);
  }
}
