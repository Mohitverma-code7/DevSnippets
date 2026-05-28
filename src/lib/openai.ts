import type { Snippet } from "@/data/types";

type OpenAIInsights = {
  summary: string;
  suggestions: string[];
};

function stripCodeFences(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}

function fallbackInsights(snippet: Snippet): OpenAIInsights {
  return {
    summary: `A ${snippet.language} snippet focused on ${snippet.title.toLowerCase()}.`,
    suggestions: [
      "Add a short usage example below the snippet.",
      "Handle invalid input and edge cases explicitly.",
      "Extract repeated logic into a helper if the snippet grows.",
    ],
  };
}

export async function generateOpenAIInsights({
  apiKey,
  snippet,
  model = "gpt-4o-mini",
}: {
  apiKey: string;
  snippet: Snippet;
  model?: string;
}): Promise<OpenAIInsights> {
  const prompt = [
    "You are helping a developer understand a code snippet.",
    "Return JSON only with keys: summary (string), suggestions (array of 3 short strings).",
    "Make the summary concise and the suggestions practical.",
    `Title: ${snippet.title}`,
    `Language: ${snippet.language}`,
    `Tags: ${snippet.tags.join(", ")}`,
    `Notes: ${snippet.notes || "N/A"}`,
    "Code:",
    snippet.code,
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 700,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ text?: string }>;
    }>;
  };

  const rawText =
    payload.output_text ??
    payload.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("") ??
    "";

  const cleaned = stripCodeFences(rawText);

  try {
    const parsed = JSON.parse(cleaned) as Partial<OpenAIInsights>;
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : fallbackInsights(snippet).summary,
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
}
