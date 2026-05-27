import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import { CodePanel, Pill, Screen, SectionTitle, Surface } from "@/components/ui";
import { theme } from "@/theme";
import { formatRelativeTime } from "@/lib/format";

export default function DetailsScreen() {
  const { snippets, selectedSnippet, setActiveSnippetId, generateInsights, exportSnippet } = useApp();
  const snippet = selectedSnippet ?? snippets[0];

  const relatedTags = useMemo(() => snippet?.tags.slice(0, 4) ?? [], [snippet]);

  if (!snippet) {
    return (
      <Screen>
        <Text style={{ color: theme.colors.text }}>No snippets are available yet.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{`<>`} DevSnippets AI</Text>
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={styles.searchIcon}>⌕</Text>
          </Pressable>
        </View>

        <SectionTitle title="Snippet Details" />

        <View style={styles.selectorRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {snippets.map((item) => (
                <Pill
                  key={item.id}
                  label={item.title.split(" ").slice(0, 2).join(" ")}
                  active={item.id === snippet.id}
                  onPress={() => setActiveSnippetId(item.id)}
                />
              ))}
            </View>
          </ScrollView>
          <Pressable style={styles.shareButton} onPress={() => exportSnippet(snippet.id, "json")}>
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{snippet.title}</Text>
        <Text style={styles.subtitle}>{snippet.notes || "A local-first snippet ready for explanation and sharing."}</Text>

        <View style={styles.metaRow}>
          <Pill label={`Updated ${formatRelativeTime(snippet.updatedAt)}`} />
          <Pill label={snippet.language} />
          <Pill label={`${Math.max(1, Math.round(snippet.code.length / 32))} Views`} />
        </View>

        <Surface style={styles.codeWrap}>
          <CodePanel title={`${snippet.title}.${snippet.language === "Python" ? "py" : "ts"}`} code={snippet.code} />
        </Surface>

        <Text style={styles.associated}>ASSOCIATED TAGS</Text>
        <View style={styles.tagRow}>
          {relatedTags.map((tag) => (
            <Pill key={tag} label={`#${tag}`} />
          ))}
        </View>

        <Surface style={styles.aiPanel}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>✧</Text>
            <Text style={styles.aiTitle}>AI Insights</Text>
          </View>

          <Surface style={styles.insightCard}>
            <Text style={styles.insightLabel}>EXPLANATION</Text>
            <Text style={styles.insightBody}>{snippet.aiSummary}</Text>
          </Surface>

          <Surface style={styles.insightCard}>
            <Text style={styles.insightLabel}>OPTIMIZATION</Text>
            <Text style={styles.insightBody}>{snippet.aiSuggestions[0]}</Text>
          </Surface>

          <Surface style={styles.insightCard}>
            <Text style={styles.insightLabel}>COMPLEXITY</Text>
            <View style={styles.complexityRow}>
              <Text style={styles.insightBody}>O(1) Memory | O(n) Network</Text>
              <Text style={styles.badge}>OPTIMAL</Text>
            </View>
          </Surface>
        </Surface>

        <Pressable style={styles.featureCard} onPress={() => generateInsights(snippet.id)}>
          <Text style={styles.featureEyebrow}>NEXT LEVEL</Text>
          <Text style={styles.featureTitle}>Error Boundaries & Hooks</Text>
          <Text style={styles.featureSubtitle}>Regenerate local AI analysis for the selected snippet.</Text>
        </Pressable>

        <View style={styles.bottomButtons}>
          <Pressable style={styles.secondaryButton} onPress={() => router.push("/editor")}>
            <Text style={styles.secondaryButtonText}>Edit Snippet</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => generateInsights(snippet.id)}>
            <Text style={styles.primaryButtonText}>Run AI Explanation</Text>
          </Pressable>
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
    fontSize: 26,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: theme.space.md,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
  },
  shareText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: theme.space.md,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.md,
  },
  codeWrap: {
    padding: 0,
    marginBottom: theme.space.lg,
  },
  associated: {
    color: theme.colors.text,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: "800",
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.lg,
  },
  aiPanel: {
    padding: theme.space.md,
    gap: theme.space.md,
    marginBottom: theme.space.lg,
    borderWidth: 1,
    borderColor: "rgba(200, 16, 58, 0.24)",
    backgroundColor: "#fff2f4",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiIcon: {
    color: theme.colors.primary,
    fontSize: 18,
  },
  aiTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  insightCard: {
    padding: theme.space.md,
    gap: 6,
  },
  insightLabel: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  insightBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  complexityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.sm,
  },
  badge: {
    color: theme.colors.green,
    backgroundColor: "rgba(15, 157, 88, 0.12)",
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: "800",
    fontSize: 11,
  },
  featureCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.primary,
    padding: theme.space.md,
    marginBottom: theme.space.lg,
  },
  featureEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 11,
  },
  featureTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    marginTop: 4,
  },
  featureSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
    fontSize: 13,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
});

