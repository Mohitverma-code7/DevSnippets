import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, CodePanel, EmptyState, Pill, SectionTitle, StatusDialog, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { useTheme } from "@/theme";
import { copyFileIntoAttachments } from "@/lib/file-hub";
import type { Snippet, SnippetLanguage } from "@/data/types";

const languageOptions: SnippetLanguage[] = ["TypeScript", "JavaScript", "Python", "React", "Bash", "SQL", "CSS", "JSON", "Markdown"];

type DraftState = {
  title: string;
  language: SnippetLanguage;
  tags: string;
  code: string;
  notes: string;
  attachments: string[];
};

function buildDraft(snippet: Snippet | null, isNewDraft: boolean): DraftState {
  if (isNewDraft || !snippet) {
    return {
      title: "",
      language: "TypeScript",
      tags: "",
      code: "",
      notes: "",
      attachments: [],
    };
  }

  return {
    title: snippet.title,
    language: snippet.language,
    tags: snippet.tags.join(", "),
    code: snippet.code,
    notes: snippet.notes,
    attachments: snippet.attachments ?? [],
  };
}

export default function EditorScreen() {
  const { snippets, selectedSnippet, setActiveSnippetId, createSnippet, updateSnippet, showNotice } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isNewDraft = params.mode === "new";
  const draftKey = isNewDraft ? "new" : selectedSnippet?.id ?? "draft";
  const draft = useMemo(() => buildDraft(selectedSnippet, isNewDraft), [isNewDraft, selectedSnippet]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <EditorForm
        key={draftKey}
        draft={draft}
        isNewDraft={isNewDraft}
        currentSnippet={selectedSnippet}
        snippets={snippets}
        router={router}
        setActiveSnippetId={setActiveSnippetId}
        createSnippet={createSnippet}
        updateSnippet={updateSnippet}
        showNotice={showNotice}
      />
    </KeyboardAvoidingView>
  );
}

function EditorForm({
  draft,
  isNewDraft,
  currentSnippet,
  snippets,
  router,
  setActiveSnippetId,
  createSnippet,
  updateSnippet,
  showNotice,
}: {
  draft: DraftState;
  isNewDraft: boolean;
  currentSnippet: Snippet | null;
  snippets: Snippet[];
  router: ReturnType<typeof useRouter>;
  setActiveSnippetId: (id: string) => void;
  createSnippet: (input: {
    title: string;
    code: string;
    language: SnippetLanguage;
    tags: string[];
    notes: string;
    attachments?: string[];
  }) => Promise<void>;
  updateSnippet: (snippet: Snippet) => Promise<void>;
  showNotice: (input: { title: string; message: string; actionLabel?: string }) => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [title, setTitle] = useState(draft.title);
  const [language, setLanguage] = useState<SnippetLanguage>(draft.language);
  const [tags, setTags] = useState(draft.tags);
  const [code, setCode] = useState(draft.code);
  const [notes, setNotes] = useState(draft.notes);
  const [attachments, setAttachments] = useState<string[]>(draft.attachments);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  async function handleSave() {
    if (isNewDraft) {
      await createSnippet({
        title: title.trim() || "Untitled Snippet",
        language,
        tags: tagList,
        code: code.trim() || "// Start typing your snippet here",
        notes,
        attachments,
      });
      router.push("/details");
      return;
    }

    if (!currentSnippet) {
      showNotice({
        title: "No snippet selected",
        message: "Create a new snippet or go back to the library.",
      });
      return;
    }

    await updateSnippet({
      ...currentSnippet,
      title: title.trim() || currentSnippet.title,
      language,
      tags: tagList,
      code: code.trim() || currentSnippet.code,
      notes,
      attachments,
    });
    setSaveDialogVisible(true);
  }

  function handleLoadSeed() {
    const seed = snippets[0];
    if (!seed) {
      return;
    }

    setActiveSnippetId(seed.id);
    setTitle(seed.title);
    setLanguage(seed.language);
    setTags(seed.tags.join(", "));
    setCode(seed.code);
    setNotes(seed.notes);
    setAttachments(seed.attachments ?? []);
  }

  async function handleAttachFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ["image/*", "text/*", "application/json", "application/javascript"],
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets[0];
    const stored = await copyFileIntoAttachments(picked.uri);
    setAttachments((current) => Array.from(new Set([...current, stored.uri])));
  }

  async function handleShareCode() {
    await Share.share({
      message: code || "// Write your code here",
      title: title || "DevSnippets code",
    });
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <AppHeader
        title={isNewDraft ? "Create snippet" : "Edit snippet"}
        subtitle="Offline-first editing with local attachments and export tools."
        actions={[
          { icon: "settings-outline", label: "Settings", onPress: () => router.push("/settings"), tone: "soft" },
          { icon: "checkmark", label: "Save", onPress: handleSave, tone: "primary" },
        ]}
      />

      <Surface style={styles.headerCard}>
        <View>
          <Text style={styles.kicker}>Snippet editor</Text>
          <Text style={styles.headerTitle}>{isNewDraft ? "Create a new snippet" : "Edit your current snippet"}</Text>
          <Text style={styles.headerBody}>
            Everything saves locally first, so your work stays available even without a connection.
          </Text>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionTitle title="Snippet metadata" subtitle="Give the snippet a clear title, language, and tags." />
        <Text style={styles.label}>TITLE</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="main_auth_handler.ts"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>LANGUAGE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
          {languageOptions.map((item) => (
            <Pill key={item} label={item} active={language === item} onPress={() => setLanguage(item)} />
          ))}
        </ScrollView>

        <Text style={styles.label}>TAGS</Text>
        <View style={styles.tagCloud}>
          {tagList.map((tag) => (
            <Pill key={tag} label={`#${tag}`} active />
          ))}
        </View>
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="Add comma-separated tags like react, auth, api"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.tagInput}
        />
      </Surface>

      <Surface style={styles.panel}>
        <SectionTitle title="Code" subtitle="Write, paste, or review the snippet body." />
        <CodePanel title={title || "snippet.ts"} code={code || "// Write your code here"} lineNumbers onCopy={handleShareCode} />
        <TextInput
          value={code}
          onChangeText={setCode}
          multiline
          placeholder="Write or paste code here..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.codeInput}
        />
        <View style={styles.inlineActions}>
          <Pressable style={styles.inlineButton} onPress={handleShareCode}>
            <Ionicons name="share-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.inlineButtonText}>Share code</Text>
          </Pressable>
          <Pressable style={styles.inlineButton} onPress={handleAttachFile}>
            <Ionicons name="attach-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.inlineButtonText}>Attach screenshot</Text>
          </Pressable>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionTitle title="Notes & attachments" subtitle="Capture context, links, or visual references." />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Why this snippet matters and when to use it."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={styles.notesInput}
        />
        <View style={styles.attachmentRow}>
          <Pressable style={styles.attachButton} onPress={handleAttachFile}>
            <Ionicons name="image-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.attachButtonText}>Attach file</Text>
          </Pressable>
          <Text style={styles.attachMeta}>
            {attachments.length} attachment{attachments.length === 1 ? "" : "s"}
          </Text>
        </View>
        {attachments.length > 0 ? (
          <View style={styles.attachmentList}>
            {attachments.map((uri) => (
              <View key={uri} style={styles.attachmentItem}>
                <Ionicons name="document-outline" size={14} color={theme.colors.primary} />
                <Text style={styles.attachmentText} numberOfLines={1}>
                  {uri.split(/[/\\]/).pop()}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No attachments yet"
            body="Add screenshots, reference docs, or helper files to keep the snippet self-contained."
          />
        )}
      </Surface>

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryAction} onPress={handleLoadSeed}>
          <Text style={styles.secondaryActionText}>Load latest</Text>
        </Pressable>
        <Pressable style={styles.primaryAction} onPress={handleSave}>
          <Text style={styles.primaryActionText}>{isNewDraft ? "Save snippet" : "Update snippet"}</Text>
        </Pressable>
      </View>
      <Pressable style={styles.secondaryActionWide} onPress={handleShareCode}>
        <Ionicons name="sparkles-outline" size={16} color={theme.colors.primary} />
        <Text style={styles.secondaryActionText}>Quick share preview</Text>
      </Pressable>
      <StatusDialog
        visible={saveDialogVisible}
        title="Saved locally"
        message="Your snippet changes were stored on the device and are ready for offline use."
        onAction={() => setSaveDialogVisible(false)}
      />
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  content: {
    padding: theme.space.md,
    paddingBottom: 92,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: theme.space.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.space.md,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    marginTop: 4,
  },
  headerBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  panel: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    gap: theme.space.sm,
  },
  label: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    marginTop: theme.space.sm,
    marginBottom: 6,
    letterSpacing: 1,
  },
  input: {
    color: theme.colors.text,
    fontSize: 18,
    paddingHorizontal: 0,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  languageRow: {
    gap: 8,
  },
  tagCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tagInput: {
    color: theme.colors.text,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.space.md,
    backgroundColor: theme.colors.surface,
  },
  codeInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    minHeight: 220,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
    marginTop: theme.space.md,
  },
  inlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: theme.space.md,
  },
  inlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: theme.colors.surface,
  },
  inlineButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 12,
  },
  notesInput: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.md,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.space.md,
  },
  attachButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  attachButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  attachMeta: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  attachmentList: {
    marginTop: theme.space.sm,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  attachmentText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginTop: theme.space.md,
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  secondaryActionWide: {
    marginTop: theme.space.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    flexDirection: "row",
    gap: 8,
  },
  secondaryActionText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  primaryAction: {
    flex: 1,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  primaryActionText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  });
}
