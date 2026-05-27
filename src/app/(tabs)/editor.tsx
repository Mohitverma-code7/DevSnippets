import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";


import { CodePanel, Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { theme } from "@/theme";
import { useRouter } from "expo-router";

export default function EditorScreen() {
  const { snippets, selectedSnippet, activeSnippetId, setActiveSnippetId, createSnippet, updateSnippet } = useApp();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("TypeScript");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (selectedSnippet) {
      setTitle(selectedSnippet.title);
      setLanguage(selectedSnippet.language);
      setTags(selectedSnippet.tags.join(", "));
      setCode(selectedSnippet.code);
      setNotes(selectedSnippet.notes);
    }
  }, [selectedSnippet]);

  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags]
  );

  async function handleSave() {
    if (!selectedSnippet) {
      await createSnippet({
        title: title.trim() || "Untitled Snippet",
        language: language as any,
        tags: tagList,
        code,
        notes,
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
    });
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
          <View style={styles.headerRow}>
            <Text style={styles.brand}>{`<>`} DevSnippets AI</Text>
            <Pressable onPress={() => router.push("/settings")}>
              <Text style={styles.searchIcon}>⌕</Text>
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
            <Text style={styles.copyIcon}>⧉</Text>
          </View>
          <CodePanel title={title || "snippet.ts"} code={code || "// Write your code here"} lineNumbers />
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
        </Surface>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryAction} onPress={() => setActiveSnippetId(snippets[0]?.id ?? "")}>
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
    fontSize: 26,
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
    fontSize: 18,
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

