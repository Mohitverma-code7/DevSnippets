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
  snippet,
  model = "gemini-2.0-flash",
}: {
  snippet: Snippet;
  model?: string;
}): Promise<GeminiInsights> {
  try {
    // EXPO ENV VARIABLE
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    console.log("Gemini API Key Exists:", !!apiKey);

    if (!apiKey) {
      throw new Error(
        "Missing EXPO_PUBLIC_GEMINI_API_KEY in environment variables."
      );
    }

    const prompt = [
      "You are helping a developer understand a code snippet.",
      "",
      "Return ONLY valid JSON with this shape:",
      `{
  "summary": "short summary",
  "suggestions": ["tip 1", "tip 2", "tip 3"]
}`,
      "",
      "Make the summary concise and the suggestions practical.",
      "",
      `Title: ${snippet.title}`,
      `Language: ${snippet.language}`,
      `Tags: ${snippet.tags.join(", ")}`,
      `Notes: ${snippet.notes || "N/A"}`,
      "",
      "Code:",
      snippet.code,
    ].join("\n");

    // UPDATED WORKING ENDPOINT
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    console.log("Gemini URL:", url);

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

    console.log("Gemini Status:", response.status);

    if (!response.ok) {
      const message = await response.text();

      console.log("Gemini Error Response:", message);

      throw new Error(
        `Gemini request failed: ${response.status} ${message}`
      );
    }

    const payload = await response.json();

    console.log("Gemini Payload:", payload);

    const rawText = extractTextFromGeminiPayload(payload);

    const cleaned = stripCodeFences(rawText);

    console.log("Gemini Cleaned Response:", cleaned);

    try {
      const parsed = JSON.parse(cleaned) as Partial<GeminiInsights>;

      return {
        summary:
          typeof parsed.summary === "string"
            ? parsed.summary
            : fallbackInsights(snippet).summary,

        suggestions:
          Array.isArray(parsed.suggestions) &&
          parsed.suggestions.length > 0
            ? parsed.suggestions
                .filter(
                  (item): item is string =>
                    typeof item === "string"
                )
                .slice(0, 3)
            : fallbackInsights(snippet).suggestions,
      };
    } catch (parseError) {
      console.log("JSON Parse Error:", parseError);

      return {
        summary: cleaned || fallbackInsights(snippet).summary,
        suggestions: fallbackInsights(snippet).suggestions,
      };
    }
  } catch (error) {
    console.log("Gemini Insight Error:", error);

    return fallbackInsights(snippet);
  }
}