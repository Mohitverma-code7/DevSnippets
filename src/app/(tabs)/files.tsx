import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/context/app-context";
import { AppHeader, ConfirmDialog, EmptyState, FileRow, FolderCard, Pill, Screen, SearchField, SectionTitle, Surface, StatTile } from "@/components/ui";
import { useTheme } from "@/theme";
import { copyManagedFile, deleteManagedFile, deleteManagedFolder, moveManagedFile } from "@/lib/file-hub";

export default function FilesScreen() {
  const { folders, files, refresh, createFolder, importFileAsSnippet, showNotice } = useApp();
  const theme = useTheme();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);
  const [query, setQuery] = useState("");
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredFiles = useMemo(() => {
    const term = query.toLowerCase();
    return files.filter((file) => `${file.name} ${file.icon} ${file.modifiedLabel}`.toLowerCase().includes(term));
  }, [files, query]);

  const selectedFile = useMemo(
    () => filteredFiles.find((file) => file.path === selectedPath) ?? filteredFiles[0] ?? null,
    [filteredFiles, selectedPath]
  );

  async function handleNewFolder() {
    await createFolder(`Playgrounds-${Date.now().toString().slice(-4)}`);
    await refresh();
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    await importFileAsSnippet(result.assets[0].uri);
    await refresh();
    router.push("/editor");
  }

  async function handleUseFile() {
    if (!selectedFile || selectedFile.kind === "folder") {
      showNotice({
        title: "Select a file",
        message: "Choose a file row first, then import it into the snippet editor.",
      });
      return;
    }

    await importFileAsSnippet(selectedFile.path);
    router.push("/editor");
  }

  async function handleDelete() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await deleteManagedFile(selectedFile.path);
    await refresh();
  }

  async function handleCopy() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await copyManagedFile(selectedFile.path, "Exports");
    await refresh();
  }

  async function handleMove() {
    if (!selectedFile || selectedFile.kind === "folder") {
      return;
    }
    await moveManagedFile(selectedFile.path, "Templates");
    await refresh();
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} >
        <AppHeader
          title="Files"
          subtitle="Browse local assets, templates, and exports."
          actions={[
            { icon: "settings-outline", label: "Settings", onPress: () => router.push("/settings"), tone: "soft" },
            { icon: "add", label: "New folder", onPress: handleNewFolder, tone: "primary" },
          ]}
        />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Browse folders, move files, and import resources directly on device.</Text>
          <View style={styles.statRow}>
            <StatTile title={String(folders.length).padStart(2, "0")} subtitle="Folders" tone="primary" />
            <StatTile title={String(files.length).padStart(2, "0")} subtitle="Recent files" tone="soft" />
          </View>
        </View>

        <SearchField value={query} onChangeText={setQuery} placeholder="Search files and assets..." style={styles.search} />

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={handleUseFile}>
            <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Use file</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleNewFolder}>
            <Ionicons name="folder-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>New folder</Text>
          </Pressable>
          <Pressable style={styles.actionButtonFilled} onPress={handleImport}>
            <Ionicons name="cloud-download-outline" size={16} color={theme.colors.white} />
            <Text style={styles.actionButtonFilledText}>Import</Text>
          </Pressable>
        </View>

        <SectionTitle title="Active folders" subtitle="The app keeps screenshots, templates, and exports organized automatically." />
        {folders.length > 0 ? folders.map((folder) => (
          <FolderCard
            key={folder.name}
            folder={folder}
            onDelete={() => setFolderToDelete(folder.name)}
          />
        )) : <EmptyState title="No folders yet" body="Create a folder to start organizing local resources." actionLabel="New folder" onAction={handleNewFolder} />}

        <SectionTitle title="Recent files" subtitle="Tap a row to preview and manage it." action={{ label: "Refresh", onPress: refresh }} />
        <Surface style={styles.filesTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>NAME</Text>
            <Text style={styles.tableHeaderText}>SIZE</Text>
          </View>
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <FileRow
                key={file.path}
                file={file}
                onPress={() => setSelectedPath(file.path)}
              />
            ))
          ) : (
            <EmptyState title="No file matches" body="Try a different search term or clear the filter." />
          )}
        </Surface>

        <Surface style={styles.actionsPanel}>
          <Text style={styles.panelTitle}>Selected file</Text>
          <Text style={styles.panelSubtitle}>{selectedFile ? selectedFile.name : "Choose a file above"}</Text>
          <View style={styles.fileActions}>
            <Pill label="Copy" icon="C" onPress={handleCopy} />
            <Pill label="Move" icon="M" onPress={handleMove} />
            <Pill label="Delete" icon="D" onPress={handleDelete} />
          </View>
        </Surface>

        <Surface style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>Resource library</Text>
          <Text style={styles.resourceBody}>
            Imported screenshots and generated exports stay grouped locally, so the file manager reflects what is actually on the device.
          </Text>
        </Surface>

        <ConfirmDialog
          visible={!!folderToDelete}
          title="Delete folder?"
          message={`This removes the "${folderToDelete ?? ""}" folder and everything inside it from device storage.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onCancel={() => setFolderToDelete(null)}
          onConfirm={async () => {
            if (!folderToDelete) {
              return;
            }
            await deleteManagedFolder(folderToDelete);
            setFolderToDelete(null);
            await refresh();
          }}
        />
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  content: {
    paddingHorizontal: theme.space.md,
    paddingBottom: 28,
  },
  hero: {
    paddingTop: theme.space.sm,
    gap: theme.space.md,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  statRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  search: {
    // marginTop: theme.space.md,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: theme.space.md,
    marginBottom: theme.space.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  actionButtonFilled: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  actionButtonFilledText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 12,
  },
  filesTable: {
    marginBottom: theme.space.lg,
    paddingBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: theme.space.md,
    paddingVertical: 14,
  },
  tableHeaderText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  actionsPanel: {
    padding: theme.space.md,
    marginBottom: theme.space.lg,
    gap: 6,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  panelSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginBottom: 8,
  },
  fileActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  resourceCard: {
    padding: theme.space.md,
    gap: 6,
    marginBottom: theme.space.md,
  },
  resourceTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  resourceBody: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  });
}
