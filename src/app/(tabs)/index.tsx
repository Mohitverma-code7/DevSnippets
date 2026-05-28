import { InfoCard, Pill, SearchField, SectionTitle, SnippetCard, Surface } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const { snippets, files, toggleFavorite, setActiveSnippetId } = useApp();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("All");

  const favoriteSnippets = snippets.filter((snippet) => snippet.favorite);

  const filteredSnippets = useMemo(() => {
    return snippets.filter((snippet) => {
      const haystack = `${snippet.title} ${snippet.code} ${snippet.tags.join(" ")} ${snippet.language}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      const matchesFilter = filter === "All" || snippet.language.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [filter, query, snippets]);

  const recentFiles = files.slice(0, 3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ padding: theme.space.md }} contentContainerStyle={{ paddingBottom: 38 }}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>{`<>`}</Text>
        <Text style={styles.brandText}>
          DevSnippets{"\n"}
          AI
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => searchRef.current?.focus()}>
          <Text style={styles.topIcon}><Ionicons name="search" size={24} /></Text>
        </Pressable>
        <Pressable onPress={() => router.push("/settings")} style={styles.avatar}>
          <Text style={styles.avatarText}><Ionicons name="settings-outline" size={24} /></Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>Welcome back, Dev</Text>
          <View style={styles.offlineChip}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        </View>
        <Text style={styles.heroSubtitle}>Your technical workspace is ready for local editing.</Text>
      </View>

      <SearchField
        ref={searchRef}
        value={query}
        onChangeText={setQuery}
        placeholder="Search snippets, docs, or files..."
        style={{ marginBottom: theme.space.md }}
      />

      <Pressable
        style={({ pressed }) => [styles.createCard, pressed && { transform: [{ scale: 0.99 }] }]}
        onPress={() => router.push("/editor?mode=new")}
      >
        <View style={styles.createCardInner}>
          <Text style={styles.createPlus}>+</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.createTitle}>Create New</Text>
            <Text style={styles.createSubtitle}>Start a fresh snippet or file</Text>
          </View>
          <Text style={styles.createGhost}>▣</Text>
        </View>
      </Pressable>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickCard} onPress={() => router.push("/files")}>
          <Text style={styles.quickIcon}>↺</Text>
          <Text style={styles.quickTitle}>Recent Files</Text>
          <Text style={styles.quickSubtitle}>Jump back into your work</Text>
        </Pressable>
        <Pressable style={styles.quickCard} onPress={() => router.push("/favorites")}>
          <Text style={styles.quickIcon}>★</Text>
          <Text style={styles.quickTitle}>Favorites</Text>
          <Text style={styles.quickSubtitle}>Access pinned resources</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {["All", "React", "Python", "TypeScript"].map((label) => (
          <Pill key={label} label={label} active={filter === label} onPress={() => setFilter(label)} />
        ))}
      </View>

      <SectionTitle title="Recent Snippets" action={{ label: "View All", onPress: () => router.push("/details") }} />
      {filteredSnippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onPress={() => {
            setActiveSnippetId(snippet.id);
            router.push("/details");
          }}
          onFavorite={() => toggleFavorite(snippet.id)}
        />
      ))}

      <SectionTitle title="Favorites" action={{ label: "View All", onPress: () => router.push("/favorites") }} />
      <View style={styles.favoriteRow}>
        {favoriteSnippets.map((snippet) => (
          <View key={snippet.id} style={styles.favoritePillWrap}>
            <Pill label={snippet.title.split(" ").slice(0, 2).join(" ")} active />
          </View>
        ))}
      </View>

      <SectionTitle title="Recent Files" action={{ label: "View All", onPress: () => router.push("/files") }} />
      <Surface style={styles.filesCard}>
        <View style={styles.fileHeader}>
          <Text style={styles.fileHeaderLabel}>NAME</Text>
          <Text style={styles.fileHeaderLabel}>SIZE</Text>
        </View>
        {recentFiles.map((file) => (
          <View key={file.path} style={styles.fileItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.modifiedLabel}</Text>
            </View>
            <Text style={styles.fileSize}>{file.sizeLabel}</Text>
          </View>
        ))}
      </Surface>

      <InfoCard
        eyebrow="Bonus"
        title="Visual Debugging Pro"
        body="Extra space in the workspace makes room for screenshots, templates, and exported snippets without leaving the app."
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginHorizontal: -theme.space.md,
    paddingHorizontal: theme.space.md,
    backgroundColor: "#ffe8ec",
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
  },
  brandText: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 28,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  topIcon: {
    color: theme.colors.textSoft,
    fontSize: 16,
    marginTop: 10,
    fontWeight: "700",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  hero: {
    paddingTop: theme.space.lg,
    gap: theme.space.xs,
  },
  heroTextBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space.sm,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    flex: 1,
  },
  offlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    marginTop: 6,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.textSoft,
  },
  offlineText: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: theme.space.xs,
  },
  createCard: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    padding: theme.space.md,
    marginBottom: theme.space.md,
    marginTop: 10 
  },
  createCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  createPlus: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
  },
  createTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  createSubtitle: {
    color: "rgba(255,255,255,0.92)",
    marginTop: 3,
    fontSize: 13,
  },
  createGhost: {
    color: "rgba(255,255,255,0.18)",
    fontSize: 58,
    fontWeight: "900",
  },
  quickGrid: {
    flexDirection: "row",
    gap: theme.space.md,
    marginBottom: theme.space.md,
  },
  quickCard: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.space.md,
    minHeight: 120,
  },
  quickIcon: {
    color: theme.colors.primary,
    fontSize: 20,
    marginBottom: theme.space.xs,
  },
  quickTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  quickSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.sm,
  },
  favoriteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.space.lg,
  },
  favoritePillWrap: {
    marginBottom: 4,
  },
  filesCard: {
    marginBottom: theme.space.lg,
  },
  fileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffe3e8",
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
  fileName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  fileMeta: {
    color: theme.colors.textSoft,
    fontSize: 12,
    marginTop: 2,
  },
  fileSize: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "700",
    minWidth: 60,
    textAlign: "right",
  },
});
