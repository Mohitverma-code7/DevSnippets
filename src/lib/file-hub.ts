import type { ManagedFile, ManagedFolder } from "@/data/types";
import { formatBytes, formatRelativeTime } from "@/lib/format";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

const root = new Directory(Paths.document, "DevSnippets");
const screenshotsDir = new Directory(root, "Screenshots");
const templatesDir = new Directory(root, "Templates");
const exportsDir = new Directory(root, "Exports");
const attachmentsDir = new Directory(root, "Attachments");

let initialized = false;

function ensureBaseLayout() {
  root.create({ intermediates: true, idempotent: true });
  screenshotsDir.create({ intermediates: true, idempotent: true });
  templatesDir.create({ intermediates: true, idempotent: true });
  exportsDir.create({ intermediates: true, idempotent: true });
  attachmentsDir.create({ intermediates: true, idempotent: true });
}

export async function initializeFileHub() {
  if (initialized) return;

  ensureBaseLayout();

  initialized = true;
}

function collectFiles(directory: Directory): ManagedFile[] {
  return directory.list().map((entry) => {
    const isFolder = entry instanceof Directory;
    const info = entry.info();
    const size = info.size ?? 0;
    const modified = info.modificationTime ?? Date.now();

    return {
      name: entry.name,
      path: entry.uri,
      kind: isFolder ? "folder" : "file",
      sizeLabel: isFolder
        ? `${(size / 1024).toFixed(0)} KB`
        : formatBytes(size),
      modifiedLabel: formatRelativeTime(modified),
      modifiedAt: modified,
      icon: isFolder
        ? "folder"
        : entry.name.split(".").pop()?.toLowerCase() || "file",
    };
  });
}

function isImageFile(name: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name);
}

export async function listManagedFolders(): Promise<ManagedFolder[]> {
  await initializeFileHub();
  const items = root.list().filter((entry) => entry instanceof Directory) as Directory[];
  const accentPalette = ["#f7c9d2", "#f0bcc7", "#ef7c8f", "#f6d1d8", "#f4b8c2"];

  return items.map((directory, index) => {
    const children = directory.list();
    const totalSize = children.reduce((sum, item) => {
      const info = item.info();
      return sum + (info.size ?? 0);
    }, 0);
    const previewUri =
      children.find((item) => !(item instanceof Directory) && isImageFile(item.name))?.uri ?? null;

    return {
      name: directory.name,
      itemCount: children.length,
      sizeLabel: formatBytes(totalSize),
      accent: accentPalette[index % accentPalette.length],
      progress: Math.min(0.95, children.length / 10),
      previewUri,
    };
  });
}

export async function listManagedFiles() {
  await initializeFileHub();

  return [
    ...collectFiles(exportsDir),
    ...collectFiles(templatesDir),
    ...collectFiles(screenshotsDir),
  ]
    .sort((a, b) => b.modifiedAt - a.modifiedAt)
    .slice(0, 6);
}

export async function createFolder(name: string) {
  await initializeFileHub();
  const directory = new Directory(root, name);
  directory.create({ idempotent: true, intermediates: true });
  return directory;
}

export async function deleteManagedFolder(name: string) {
  await initializeFileHub();
  const directory = new Directory(root, name);
  if (directory.exists) {
    directory.delete();
  }
}

export async function createExportFile(
  name: string,
  content: string,
  extension: string,
) {
  await initializeFileHub();
  const safeName = name.replace(/[^\w.-]+/g, "-").toLowerCase();
  const file = new File(exportsDir, `${safeName}.${extension}`);
  file.create({ intermediates: true, overwrite: true });
  file.write(content);
  return file;
}

export async function copyFileIntoAttachments(sourcePath: string) {
  await initializeFileHub();
  const source = new File(sourcePath);
  const safeName = source.name || `attachment-${Date.now()}`;
  const destination = new File(attachmentsDir, safeName);
  if (source.exists) {
    await source.copy(destination, { overwrite: true });
  }
  return destination;
}

export async function readManagedFile(path: string) {
  await initializeFileHub();
  const file = new File(path);
  if (!file.exists) {
    return null;
  }

  return await file.text();
}

export async function copyFileToExports(source: File) {
  await initializeFileHub();
  const target = new File(exportsDir, source.name);
  if (!source.exists) return target;
  await source.copy(target, { overwrite: true });
  return target;
}

function resolveFolder(
  destinationFolder: "Screenshots" | "Templates" | "Exports",
) {
  return destinationFolder === "Screenshots"
    ? screenshotsDir
    : destinationFolder === "Templates"
      ? templatesDir
      : exportsDir;
}

export async function moveManagedFile(
  sourcePath: string,
  destinationFolder: "Screenshots" | "Templates" | "Exports",
) {
  await initializeFileHub();
  const source = new File(sourcePath);
  if (!source.exists)
    return new File(resolveFolder(destinationFolder), source.name);

  const destination = new File(resolveFolder(destinationFolder), source.name);
  await source.move(destination, { overwrite: true });
  return destination;
}

export async function copyManagedFile(
  sourcePath: string,
  destinationFolder: "Screenshots" | "Templates" | "Exports",
) {
  await initializeFileHub();
  const source = new File(sourcePath);
  if (!source.exists)
    return new File(resolveFolder(destinationFolder), source.name);

  const destination = new File(resolveFolder(destinationFolder), source.name);
  await source.copy(destination, { overwrite: true });
  return destination;
}

export async function deleteManagedFile(path: string) {
  const target = new File(path);
  if (target.exists) {
    target.delete();
  }
}

export async function shareFile(path: string) {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }
}

export async function exportSnippetPayload(
  name: string,
  format: "txt" | "js" | "json",
  content: string,
) {
  const file = await createExportFile(name, content, format);
  return file;
}

export function getRootDirectory() {
  return root;
}

export function getAttachmentsDirectory() {
  return attachmentsDir;
}
