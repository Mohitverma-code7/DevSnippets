import { AppHeader, InfoCard, Pill, SearchField, SectionTitle, SnippetCard, StatTile, Surface, EmptyState } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { snippets, files, toggleFavorite, setActiveSnippetId } = useApp();
  const theme = useTheme();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const languages = useMemo(() => ["All", ...Array.from(new Set(snippets.map((item) => item.language)))], [snippets]);
  const favoriteSnippets = snippets.filter((snippet) => snippet.favorite);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const haystack = `${snippet.title} ${snippet.code} ${snippet.tags.join(" ")} ${snippet.language} ${snippet.notes}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      const matchesFilter = filter === "All" || snippet.language.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [filter, query, snippets]);

  const recentFiles = files.slice(0, 4);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <AppHeader
        title="DevSnippets"
        subtitle="Offline-first code vault"
        actions={[
          { icon: "search-outline", label: "Search", onPress: () => searchRef.current?.focus() },
          { icon: "settings-outline", label: "Settings", onPress: () => router.push("/settings"), tone: "primary" },
        ]}
      />
      <LinearGradient
        colors={
          theme.mode === "dark"
            ? [theme.colors.bg, theme.colors.surface2, theme.colors.surface]
            : ["#fff7f8", "#fff2f5", "#ffe6eb"]
        }
        style={styles.heroShell}
      >
        <Surface style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Local storage ready</Text>
            </View>
            <Text style={styles.heroTitle}>Your snippets, files, and AI notes in one calm workspace.</Text>
            <Text style={styles.heroBody}>
              Search, edit, pin, export, and explain code without relying on the network.
            </Text>
          </View>

          <View style={styles.heroStats}>
            <StatTile title={String(snippets.length).padStart(2, "0")} subtitle="Snippet library" tone="soft" />
            <StatTile title={String(favoriteSnippets.length).padStart(2, "0")} subtitle="Favorites pinned" tone="soft" />
          </View>
        </Surface>
      </LinearGradient>

      <SearchField
        ref={searchRef}
        value={query}
        onChangeText={setQuery}
        placeholder="Search snippets, notes, or tags..."
      />

      <Pressable style={styles.createCard} onPress={() => router.push("/editor?mode=new")}>
        <View style={styles.createIcon}>
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.createTextWrap}>
          <Text style={styles.createTitle}>New Snippet</Text>
          <Text style={styles.createSubtitle}>Capture an idea before it slips away.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </Pressable>

      <View style={styles.quickActionsRow}>
        <Pressable style={styles.actionCard} onPress={() => router.push("/files")}>
          <View style={styles.actionIcon}>
            <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Files</Text>
          <Text style={styles.actionSubtitle}>Browse templates and attachments.</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => router.push("/favorites")}>
          <View style={styles.actionIcon}>
            <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.actionTitle}>Favorites</Text>
          <Text style={styles.actionSubtitle}>Jump back to pinned snippets.</Text>
        </Pressable>
      </View>

      <SectionTitle title="Search filters" subtitle="Narrow the library by language." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {languages.map((label) => (
          <Pill key={label} label={label} active={filter === label} onPress={() => setFilter(label)} />
        ))}
      </ScrollView>

      <SectionTitle title="Recent snippets" subtitle="Sorted locally by favorites and recency." action={{ label: "Open Library", onPress: () => router.push("/details") }} />
      {filteredSnippets.length > 0 ? (
        filteredSnippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            onPress={() => {
              setActiveSnippetId(snippet.id);
              router.push("/details");
            }}
            onFavorite={() => toggleFavorite(snippet.id)}
          />
        ))
      ) : (
        <EmptyState
          title="No snippets match"
          body="Try a different keyword or clear the language filter to see the full offline library."
          actionLabel="Create a snippet"
          onAction={() => router.push("/editor?mode=new")}
        />
      )}

      <SectionTitle title="Pinned snippets" subtitle="One-tap access to your most-used helpers." action={{ label: "View all", onPress: () => router.push("/favorites") }} />
      {favoriteSnippets.length > 0 ? (
        <View style={styles.favoriteGrid}>
          {favoriteSnippets.slice(0, 4).map((snippet) => (
            <Pill
              key={snippet.id}
              label={snippet.title}
              active
              onPress={() => {
                setActiveSnippetId(snippet.id);
                router.push("/details");
              }}
            />
          ))}
        </View>
      ) : (
        <InfoCard
          eyebrow="Starter tip"
          title="Pin the snippets you reuse every week"
          body="Favorites stay local and always sort to the top of the library, even when you are offline."
        />
      )}

      <SectionTitle title="Recent files" subtitle="Local assets, exports, and templates." action={{ label: "Open files", onPress: () => router.push("/files") }} />
      <Surface style={styles.filesCard}>
        <View style={styles.fileHeader}>
          <Text style={styles.fileHeaderLabel}>NAME</Text>
          <Text style={styles.fileHeaderLabel}>SIZE</Text>
        </View>
        {recentFiles.length > 0 ? (
          recentFiles.map((file) => (
            <View key={file.path} style={styles.fileItem}>
              <View style={styles.fileBadge}>
                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileMeta}>{file.modifiedLabel}</Text>
              </View>
              <Text style={styles.fileSize}>{file.sizeLabel}</Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="No local files yet"
            body="Use the Files tab to import resources, create folders, and save exports on device."
            actionLabel="Open files"
            onAction={() => router.push("/files")}
          />
        )}
      </Surface>

      <InfoCard
        eyebrow="Offline-first"
        title="SQLite for snippets. SecureStore for secrets. FileSystem for everything else."
        body="That split keeps the core app usable without internet while still supporting AI providers when you choose to connect."
      />
    </ScrollView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.space.md,
    paddingBottom: 38,
  },
  heroShell: {
    marginHorizontal: -theme.space.md,
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroCard: {
    padding: theme.space.lg,
    gap: theme.space.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroHeader: {
    gap: theme.space.sm,
  },
  statusChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 29,
    lineHeight: 34,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroBody: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: "row",
    gap: theme.space.sm,
    
  },
  
  quickActionsRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginTop: theme.space.sm,
  },
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    padding: theme.space.md,
    gap: theme.space.md,
    minHeight: 112,
    marginTop: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  createIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  createTextWrap: {
    flex: 1,
    gap: 4,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCard: {
    flex: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space.md,
    gap: 8,
    minHeight: 136,
  },
  createTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  createSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  actionSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 2,
  },
  favoriteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filesCard: {
    marginBottom: theme.space.lg,
  },
  fileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: theme.space.md,
    paddingVertical: 14,
  },
  fileHeaderLabel: {
    color: theme.colors.text,
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: "800",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    paddingHorizontal: theme.space.md,
    paddingVertical: theme.space.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  fileBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(190, 18, 60, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  fileMeta: {
    color: theme.colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  fileSize: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    minWidth: 60,
    textAlign: "right",
  },
  });
}
