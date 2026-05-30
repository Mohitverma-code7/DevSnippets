# DevSnippets

DevSnippets is an offline-first mobile app for saving, organizing, managing, and understanding code snippets directly on device.

It is built with Expo, React Native, and TypeScript, and uses local storage as the source of truth for the entire app.

## Features

- Create, edit, delete, search, and favorite snippets
- Store snippets locally with SQLite
- Manage local files and folders with Expo FileSystem
- Attach screenshots and reference files to snippets
- Generate AI-style explanations, summaries, and improvement suggestions
- Export snippets as `.txt`, `.js`, or `.json`
- Share exported snippets with other apps
- Save app preferences in AsyncStorage
- Store API keys securely in SecureStore

## Tech Stack

- Expo Router
- React Native
- TypeScript
- SQLite
- AsyncStorage
- SecureStore
- Expo FileSystem
- Expo Sharing
- Expo Image

## Offline-First Architecture

The app is designed so the core experience still works when the device is offline:

- SQLite stores all snippets, tags, notes, and AI results
- AsyncStorage stores theme and provider preferences
- SecureStore stores sensitive API tokens
- Expo FileSystem stores local files, exports, screenshots, and attachments

The app loads local content first and only uses network-based AI providers when the user explicitly enables them in Settings.

## Database Structure

The snippet database lives in SQLite and uses a single `snippets` table.

Important columns:

- `id`
- `title`
- `code`
- `language`
- `tags`
- `favorite`
- `createdAt`
- `updatedAt`
- `notes`
- `aiSummary`
- `aiSuggestions`
- `attachments`

Arrays are stored as JSON strings so the schema stays simple and portable.

## File Management

The file manager uses Expo FileSystem to create and manage local folders:

- `Screenshots`
- `Templates`
- `Exports`
- `Attachments`

Supported actions:

- Create folders
- Import files
- Copy files
- Move files
- Delete files
- Preview images when available
- Export snippets as local files

## AI Integration Workflow

The app supports three AI modes:

- `mock` for offline fallback analysis
- `openai`
- `gemini`

Workflow:

1. The user selects a snippet in Details.
2. The app builds a local explanation immediately.
3. If an online provider is enabled and a key is stored, the app sends the snippet to that provider.
4. The response is saved back into SQLite so it is available offline later.

If the provider is unavailable, the app falls back to the offline analysis path and keeps working.

## Export And Sharing

Exports can be generated as:

- `.txt`
- `.js`
- `.json`

Each export is written to local storage and can then be shared through the native share sheet.

## UI And UX Notes

The interface uses a shared component system for:

- Page headers
- Section titles
- Pills and filters
- Snippet cards
- File rows
- Empty states
- Custom dialogs

The app also supports light, dark, and system theme modes.

## Project Structure

- `src/app` - Expo Router screens
- `src/components` - shared UI primitives
- `src/context` - global app state
- `src/data` - domain types
- `src/lib` - persistence, storage, file, and AI helpers
- `src/theme.tsx` - theme tokens and runtime theme provider

## Verification

- `npm run lint`
- `npx tsc --noEmit`

## Submission Notes

This project is intentionally local-first and does not rely on seeded demo content. Any snippets or files shown in the app are created or imported on the device.
