import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { seedSnippets } from "@/data/seed";
import type { Snippet } from "@/data/types";

type SnippetRow = {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string;
  favorite: number;
  createdAt: number;
  updatedAt: number;
  notes: string;
  aiSummary: string;
  aiSuggestions: string;
};

let dbPromise: Promise<SQLiteDatabase> | null = null;
let schemaPromise: Promise<void> | null = null;

async function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync("devsnippets.db");
  }

  const db = await dbPromise;

  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS snippets (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          tags TEXT NOT NULL,
          favorite INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          aiSummary TEXT NOT NULL DEFAULT '',
          aiSuggestions TEXT NOT NULL DEFAULT '[]'
        );
      `);

      const existing = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM snippets"
      );

      if (!existing || existing.count === 0) {
        for (const snippet of seedSnippets) {
          await upsertSnippet(db, snippet);
        }
      }
    })();
  }

  await schemaPromise;
  return db;
}

function toRow(snippet: Snippet): SnippetRow {
  return {
    id: snippet.id,
    title: snippet.title,
    code: snippet.code,
    language: snippet.language,
    tags: JSON.stringify(snippet.tags),
    favorite: snippet.favorite ? 1 : 0,
    createdAt: snippet.createdAt,
    updatedAt: snippet.updatedAt,
    notes: snippet.notes,
    aiSummary: snippet.aiSummary,
    aiSuggestions: JSON.stringify(snippet.aiSuggestions),
  };
}

function fromRow(row: SnippetRow): Snippet {
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    language: row.language as Snippet["language"],
    tags: JSON.parse(row.tags) as string[],
    favorite: !!row.favorite,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    notes: row.notes,
    aiSummary: row.aiSummary,
    aiSuggestions: JSON.parse(row.aiSuggestions) as string[],
  };
}

async function upsertSnippet(db: SQLiteDatabase, snippet: Snippet) {
  const row = toRow(snippet);
  await db.runAsync(
    `
      INSERT INTO snippets (
        id, title, code, language, tags, favorite, createdAt, updatedAt, notes, aiSummary, aiSuggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title=excluded.title,
        code=excluded.code,
        language=excluded.language,
        tags=excluded.tags,
        favorite=excluded.favorite,
        createdAt=excluded.createdAt,
        updatedAt=excluded.updatedAt,
        notes=excluded.notes,
        aiSummary=excluded.aiSummary,
        aiSuggestions=excluded.aiSuggestions
    `,
    [
      row.id,
      row.title,
      row.code,
      row.language,
      row.tags,
      row.favorite,
      row.createdAt,
      row.updatedAt,
      row.notes,
      row.aiSummary,
      row.aiSuggestions,
    ]
  );
}

export async function listSnippets() {
  const db = await getDb();
  const rows = await db.getAllAsync<SnippetRow>(
    "SELECT * FROM snippets ORDER BY favorite DESC, updatedAt DESC"
  );
  return rows.map(fromRow);
}

export async function saveSnippet(snippet: Snippet) {
  const db = await getDb();
  await upsertSnippet(db, snippet);
  return snippet;
}

export async function deleteSnippet(id: string) {
  const db = await getDb();
  await db.runAsync("DELETE FROM snippets WHERE id = ?", [id]);
}

export async function resetToSeed() {
  const db = await getDb();
  await db.runAsync("DELETE FROM snippets", []);
  for (const snippet of seedSnippets) {
    await upsertSnippet(db, snippet);
  }
  return listSnippets();
}

