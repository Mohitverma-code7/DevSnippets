import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { CodePanel, Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { theme } from "@/theme";
import { copyFileIntoAttachments } from "@/lib/file-hub";

export default function EditorScreen() {
  const { snippets, selectedSnippet, setActiveSnippetId, createSnippet, updateSnippet } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isNewDraft = params.mode === "new";
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (isNewDraft) {
      setTitle("");
      setLanguage("TypeScript");
      setTags("");
      setCode("");
      setNotes("");
      setAttachments([]);
      return;
    }

    if (selectedSnippet) {
      setTitle(selectedSnippet.title);
      setLanguage(selectedSnippet.language);
      setTags(selectedSnippet.tags.join(", "));
      setCode(selectedSnippet.code);
      setNotes(selectedSnippet.notes);
      setAttachments(selectedSnippet.attachments ?? []);
    }
  }, [isNewDraft, selectedSnippet]);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  async function handleSave() {
    if (isNewDraft || !selectedSnippet) {
      await createSnippet({
        title: title.trim() || "Untitled Snippet",
        language: language as any,
        tags: tagList,
        code,
        notes,
        attachments,
      });
      router.push("/details");
      return;
    }

    await updateSnippet({
      ...selectedSnippet,
      title,
      language: language as any,
      tags: tagList,
      code,
      notes,
      attachments,
    });
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
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets[0];
    const stored = await copyFileIntoAttachments(picked.uri);
    setAttachments((current) => Array.from(new Set([...current, stored.uri])));
  }

  async function handleCopyCode() {
    await Share.share({
      message: code || "// Write your code here",
      title: title || "DevSnippets code",
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: theme.space.md, paddingBottom: 80 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{`<>`} DevSnippets AI</Text>
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={styles.searchIcon}>Search</Text>
          </Pressable>
        </View>

        <SectionTitle title="Snippet Editor" />

        <Text style={styles.label}>FILENAME</Text>
        <Surface style={styles.inputSurface}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="main_auth_handler.py"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
        </Surface>

        <Text style={styles.label}>LANGUAGE</Text>
        <Surface style={styles.inputSurface}>
          <View style={styles.languageRow}>
            <TextInput
              value={language}
              onChangeText={setLanguage}
              placeholder="TypeScript"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { flex: 1 }]}
            />
            <Text style={styles.chevron}>⌄</Text>
          </View>
        </Surface>

        <Text style={styles.label}>TAGS</Text>
        <View style={styles.tagCloud}>
          {tagList.map((tag) => (
            <Pill key={tag} label={`#${tag}`} active />
          ))}
        </View>
        <View style={styles.tagAdder}>
          <Text style={styles.tagAdderPlus}>+</Text>
          <TextInput
            value={tags}
            onChangeText={setTags}
            placeholder="Add comma-separated tags"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.tagAdderInput}
          />
        </View>

        <Surface style={styles.codeSurface}>
          <View style={styles.editorToolbar}>
            <Text style={styles.editorDot}>01</Text>
            <Text style={styles.editorDot}>02</Text>
            <Text style={styles.editorDot}>03</Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={handleCopyCode} hitSlop={10}>
              <Text style={styles.copyIcon}>Copy</Text>
            </Pressable>
          </View>
          <CodePanel title={title || "snippet.ts"} code={code || "// Write your code here"} lineNumbers onCopy={handleCopyCode} />
          <TextInput
            value={code}
            onChangeText={setCode}
            multiline
            placeholder="Write or paste code here..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.codeInput}
          />
        </Surface>

        <Text style={styles.label}>NOTES</Text>
        <Surface style={styles.noteSurface}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Why this snippet matters"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={styles.notesInput}
          />
          <View style={styles.attachmentRow}>
            <Pressable style={styles.attachButton} onPress={handleAttachFile}>
              <Text style={styles.attachButtonText}>Attach File</Text>
            </Pressable>
            <Text style={styles.attachMeta}>{attachments.length} attachment{attachments.length === 1 ? "" : "s"}</Text>
          </View>
          {attachments.length > 0 ? (
            <View style={styles.attachmentList}>
              {attachments.map((uri) => (
                <Text key={uri} style={styles.attachmentItem} numberOfLines={1}>
                  {uri.split(/[/\\]/).pop()}
                </Text>
              ))}
            </View>
          ) : null}
        </Surface>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryAction} onPress={handleLoadSeed}>
            <Text style={styles.secondaryActionText}>Load Seed</Text>
          </Pressable>
          <Pressable style={styles.primaryAction} onPress={handleSave}>
            <Text style={styles.primaryActionText}>Save Snippet</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={handleSave}>
        <Text style={styles.fabText}>⟙</Text>
      </Pressable>
    </KeyboardAvoidingView>
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
  label: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
    marginTop: theme.space.md,
    marginBottom: 8,
    fontFamily: theme.fonts.display,
    letterSpacing: 0.5,
  },
  inputSurface: {
    backgroundColor: theme.colors.surface,
  },
  input: {
    color: theme.colors.text,
    fontSize: 18,
    paddingHorizontal: theme.space.md,
    paddingVertical: 16,
  },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    color: theme.colors.textSoft,
    fontSize: 24,
    paddingRight: theme.space.md,
  },
  tagCloud: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  tagAdder: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    borderRadius: theme.radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: theme.space.md,
  },
  tagAdderPlus: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  tagAdderInput: {
    color: theme.colors.text,
    minWidth: 150,
    paddingVertical: 0,
  },
  codeSurface: {
    marginTop: theme.space.sm,
    paddingBottom: theme.space.md,
  },
  editorToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: 0,
  },
  editorDot: {
    color: theme.colors.primary,
    fontSize: 11,
    marginRight: 10,
    fontWeight: "700",
  },
  copyIcon: {
    color: theme.colors.textSoft,
    fontSize: 14,
    fontWeight: "800",
  },
  codeInput: {
    color: theme.colors.text,
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    minHeight: 220,
    paddingHorizontal: theme.space.md,
    paddingTop: theme.space.sm,
    textAlignVertical: "top",
  },
  noteSurface: {
    padding: theme.space.md,
  },
  notesInput: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: "top",
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: theme.space.md,
  },
  attachButton: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  attachButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  attachMeta: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  attachmentList: {
    marginTop: theme.space.sm,
    gap: 6,
  },
  attachmentItem: {
    color: theme.colors.textSoft,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginTop: theme.space.lg,
    marginBottom: 30,
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
    backgroundColor: theme.colors.primary,
  },
  primaryActionText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...{
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
  },
  fabText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
});
