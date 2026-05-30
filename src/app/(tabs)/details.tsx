import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, CodePanel, ConfirmDialog, EmptyState, Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { useTheme } from "@/theme";
import { formatRelativeTime } from "@/lib/format";

export default function DetailsScreen() {
  const { snippets, selectedSnippet, setActiveSnippetId, generateInsights, exportSnippet, removeSnippet } = useApp();
  const theme = useTheme();
  const snippet = selectedSnippet ?? snippets[0];
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const relatedTags = useMemo(() => snippet?.tags.slice(0, 4) ?? [], [snippet]);

  if (!snippet) {
    return (
      <Screen>
        <EmptyState
          title="No snippets yet"
          body="Create your first snippet to unlock details, exports, and AI explanations."
          actionLabel="Create snippet"
          onAction={() => router.push("/editor?mode=new")}
        />
      </Screen>
    );
  }

  async function handleShareCode() {
    await Share.share({
      message: snippet.code,
      title: snippet.title,
    });
  }

  async function handleDelete() {
    setDeleteConfirmVisible(true);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} >
        <AppHeader
          title="Snippet details"
          subtitle="Browse, share, export, and explain the selected snippet."
          actions={[
            { icon: "settings-outline", label: "Settings", onPress: () => router.push("/settings"), tone: "primary" },
            { icon: "create-outline", label: "Edit", onPress: () => router.push("/editor"), tone: "soft" },
          ]}
        />

        <Surface style={styles.headerCard}>
          <Text style={styles.kicker}>Current snippet</Text>
          <Text style={styles.title}>{snippet.title}</Text>
          <Text style={styles.subtitle}>{snippet.notes || "A local-first snippet ready for explanation and sharing."}</Text>

          <View style={styles.metaRow}>
            <Pill label={snippet.language} active />
            <Pill label={`Updated ${formatRelativeTime(snippet.updatedAt)}`} />
            <Pill label={`${snippet.attachments?.length ?? 0} attachment${(snippet.attachments?.length ?? 0) === 1 ? "" : "s"}`} />
            <Pill label={snippet.favorite ? "Favorite" : "Not pinned"} />
          </View>
        </Surface>

        <SectionTitle title="Switch snippets" subtitle="Tap any item to move the detail view." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {snippets.map((item) => (
            <Pill
              key={item.id}
              label={item.title}
              active={item.id === snippet.id}
              onPress={() => setActiveSnippetId(item.id)}
            />
          ))}
        </ScrollView>

        <Surface style={styles.codeWrap}>
          <CodePanel title={`${snippet.title}.${snippet.language === "Python" ? "py" : snippet.language === "JavaScript" ? "js" : "ts"}`} code={snippet.code} onCopy={handleShareCode} lineNumbers />
        </Surface>

        <View style={styles.actionGrid}>
          <Pressable style={styles.primaryAction} onPress={() => generateInsights(snippet.id)}>
            <Ionicons name="sparkles-outline" size={16} color={theme.colors.white} />
            <Text style={styles.primaryActionText}>Run AI explanation</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={handleShareCode}>
            <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.secondaryActionText}>Share code</Text>
          </Pressable>
        </View>

        <SectionTitle title="AI insight" subtitle="Generated locally or via your chosen provider." />
        <Surface style={styles.aiPanel}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.aiTitle}>Explanation</Text>
          </View>
          <Text style={styles.aiBody}>{snippet.aiSummary || "Tap the AI button above to generate a readable summary."}</Text>
        </Surface>

        <Surface style={styles.aiPanel}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIcon}>
              <Ionicons name="list-outline" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.aiTitle}>Suggestions</Text>
          </View>
          <View style={styles.suggestionList}>
            {(snippet.aiSuggestions?.length ? snippet.aiSuggestions : ["Generate insights to see improvement suggestions."]).map((item) => (
              <View key={item} style={styles.suggestionRow}>
                <View style={styles.suggestionDot} />
                <Text style={styles.aiBody}>{item}</Text>
              </View>
            ))}
          </View>
        </Surface>

        <SectionTitle title="Tags and attachments" subtitle="Helpful metadata that travels with the snippet." />
        <View style={styles.tagRow}>
          {relatedTags.length > 0 ? relatedTags.map((tag) => <Pill key={tag} label={`#${tag}`} />) : <Pill label="No tags" />}
        </View>
        <Surface style={styles.attachmentsCard}>
          {snippet.attachments?.length ? (
            snippet.attachments.map((uri) => (
              <View key={uri} style={styles.attachmentRow}>
                <Ionicons name="image-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.attachmentText} numberOfLines={1}>
                  {uri.split(/[/\\]/).pop()}
                </Text>
              </View>
            ))
          ) : (
            <EmptyState title="No attachments" body="Add screenshots, logs, or reference files in the editor." />
          )}
        </Surface>

        <SectionTitle title="Exports" subtitle="Save a shareable file for docs, gists, or handoffs." />
        <View style={styles.exportRow}>
          <Pressable style={styles.exportButton} onPress={() => exportSnippet(snippet.id, "txt")}>
            <Text style={styles.exportButtonText}>.txt</Text>
          </Pressable>
          <Pressable style={styles.exportButton} onPress={() => exportSnippet(snippet.id, "js")}>
            <Text style={styles.exportButtonText}>.js</Text>
          </Pressable>
          <Pressable style={styles.exportButton} onPress={() => exportSnippet(snippet.id, "json")}>
            <Text style={styles.exportButtonText}>.json</Text>
          </Pressable>
        </View>

        <View style={styles.bottomActions}>
          <Pressable style={styles.secondaryAction} onPress={() => router.push("/editor")}>
            <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.secondaryActionText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.secondaryActionText}>Delete</Text>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={() => router.push("/favorites")}>
            <Ionicons name="star-outline" size={16} color={theme.colors.white} />
            <Text style={styles.primaryActionText}>Favorites</Text>
          </Pressable>
        </View>
        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete snippet?"
          message="This removes the snippet from local SQLite storage."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          danger
          onCancel={() => setDeleteConfirmVisible(false)}
          onConfirm={async () => {
            setDeleteConfirmVisible(false);
            await removeSnippet(snippet.id);
            router.replace("/(tabs)");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  content: {
    paddingBottom: 28,
    paddingHorizontal: theme.space.md,
  },
  headerCard: {
    marginBottom: theme.space.md,
    padding: theme.space.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: theme.space.md,
  },
  selectorRow: {
    gap: 8,
    paddingBottom: 4,
  },
  codeWrap: {
    marginTop: theme.space.sm,
    marginBottom: theme.space.md,
    padding: 0,
  },
  actionGrid: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 13,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  aiPanel: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    gap: theme.space.sm,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  aiBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionList: {
    gap: 10,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.md,
  },
  attachmentsCard: {
    padding: theme.space.md,
    gap: 10,
    marginBottom: theme.space.md,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  attachmentText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    flex: 1,
  },
  exportRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.space.md,
  },
  exportButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  exportButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  bottomActions: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: 10,
  },
  });
}
