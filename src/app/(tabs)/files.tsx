import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useApp } from "@/context/app-context";
import { FileRow, FolderCard, Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { theme } from "@/theme";
import { copyManagedFile, deleteManagedFile, moveManagedFile } from "@/lib/file-hub";

export default function FilesScreen() {
  const { folders, files, refresh, createFolder, importFileAsSnippet } = useApp();
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);

  useEffect(() => {
    if (!selectedPath && files[0]?.path) {
      setSelectedPath(files[0].path);
    }
  }, [files, selectedPath]);

  const selectedFile = useMemo(
    () => files.find((file) => file.path === selectedPath) ?? files[0] ?? null,
    [files, selectedPath]
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
      Alert.alert("Select a file", "Choose a file row first, then import it into the snippet editor.");
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{`<>`} DevSnippets AI</Text>
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={styles.searchIcon}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.breadcrumbs}>
          <Text style={styles.crumb}>Local Storage</Text>
          <Text style={styles.arrow}>›</Text>
          <Text style={styles.crumb}>DevSnippets</Text>
          <Text style={styles.arrow}>›</Text>
          <Text style={styles.crumbActive}>Files</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={handleUseFile}>
            <Text style={styles.actionButtonText}>Use File</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleNewFolder}>
            <Text style={styles.actionButtonText}>New Folder</Text>
          </Pressable>
          <Pressable style={styles.actionButtonFilled} onPress={handleImport}>
            <Text style={styles.actionButtonFilledText}>Import</Text>
          </Pressable>
        </View>

        <SectionTitle title="Active Folders" />
        {folders.map((folder) => (
          <FolderCard key={folder.name} folder={folder} />
        ))}

        <SectionTitle title="Recent Files" action={{ label: "Refresh", onPress: refresh }} />
        <Surface style={styles.filesTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>NAME</Text>
            <Text style={styles.tableHeaderText}>SIZE</Text>
          </View>
          {files.map((file) => (
            <FileRow key={file.path} file={file} onPress={() => setSelectedPath(file.path)} />
          ))}
        </Surface>

        <Surface style={styles.syncCard}>
          <View style={styles.syncTop}>
            <View style={styles.syncIcon}>
              <Text style={styles.syncIconText}>↻</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.syncTitle}>Syncing to Cloud</Text>
              <Text style={styles.syncSubtitle}>8 files remaining • 42 MB total</Text>
            </View>
          </View>
          <View style={styles.syncTrack}>
            <View style={styles.syncProgress} />
          </View>
        </Surface>

        <Surface style={styles.actionsPanel}>
          <Text style={styles.panelTitle}>Selected File</Text>
          <Text style={styles.panelSubtitle}>{selectedFile ? selectedFile.name : "Choose a file above"}</Text>
          <View style={styles.fileActions}>
            <Pill label="Copy" onPress={handleCopy} />
            <Pill label="Move" onPress={handleMove} />
            <Pill label="Delete" onPress={handleDelete} />
          </View>
        </Surface>

        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>File management lives completely on device using Expo FileSystem.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginHorizontal: -theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: "#ffe8ec",
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  searchIcon: {
    color: theme.colors.textSoft,
    fontSize: 16,
    fontWeight: "700",
  },
  breadcrumbs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: theme.space.lg,
    marginBottom: theme.space.md,
  },
  crumb: {
    color: theme.colors.textSoft,
    fontSize: 15,
  },
  crumbActive: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  arrow: {
    color: theme.colors.borderStrong,
    fontSize: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
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
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  actionButtonFilled: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  actionButtonFilledText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  filesTable: {
    marginBottom: theme.space.lg,
    paddingBottom: 0,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffe3e8",
    paddingHorizontal: theme.space.md,
    paddingVertical: 14,
  },
  tableHeaderText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  syncCard: {
    padding: theme.space.md,
    gap: theme.space.md,
    marginBottom: theme.space.lg,
  },
  syncTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  syncIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fde3ea",
    alignItems: "center",
    justifyContent: "center",
  },
  syncIconText: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  syncTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  syncSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginTop: 2,
  },
  syncTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(200, 16, 58, 0.12)",
    overflow: "hidden",
  },
  syncProgress: {
    width: "72%",
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
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
  },
  bottomNote: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
  },
  bottomNoteText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
});
