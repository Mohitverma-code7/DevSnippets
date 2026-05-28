import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import { Pill, Screen, SectionTitle, SnippetCard, Surface } from "@/components/ui";
import { theme } from "@/theme";

export default function FavoritesScreen() {
  const { snippets, toggleFavorite, setActiveSnippetId } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const favorites = useMemo(() => snippets.filter((snippet) => snippet.favorite), [snippets]);

  const filteredFavorites = useMemo(() => {
    return favorites.filter((snippet) => {
      const haystack = `${snippet.title} ${snippet.code} ${snippet.tags.join(" ")} ${snippet.language}`.toLowerCase();
      const matchesSearch = haystack.includes(query.toLowerCase());
      const matchesFilter = filter === "All" || snippet.language.toLowerCase() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [favorites, filter, query]);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>{`<>`} DevSnippets AI</Text>
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={styles.searchIcon}>Search</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Favorites</Text>
          <Text style={styles.heroSubtitle}>Pinned snippets, local and ready to reuse offline.</Text>
          <View style={styles.statRow}>
            <Surface style={styles.statCard}>
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </Surface>
            <Surface style={styles.statCard}>
              <Text style={styles.statValue}>{new Set(favorites.map((snippet) => snippet.language)).size}</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </Surface>
          </View>
        </View>

        <View style={styles.filterRow}>
          {["All", "React", "Python", "TypeScript"].map((label) => (
            <Pill key={label} label={label} active={filter === label} onPress={() => setFilter(label)} />
          ))}
        </View>

        <SectionTitle title="Pinned Snippets" action={{ label: "Create New", onPress: () => router.push("/editor?mode=new") }} />
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((snippet) => (
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
          <Surface style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyBody}>Tap the star on any snippet to pin it here for quick access.</Text>
            <Pressable style={styles.emptyButton} onPress={() => router.push("/details")}>
              <Text style={styles.emptyButtonText}>Browse Snippets</Text>
            </Pressable>
          </Surface>
        )}
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
  hero: {
    paddingTop: theme.space.lg,
    gap: theme.space.sm,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 32,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 21,
  },
  statRow: {
    flexDirection: "row",
    gap: theme.space.md,
    marginTop: theme.space.sm,
  },
  statCard: {
    flex: 1,
    padding: theme.space.md,
    gap: 4,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 26,
    fontWeight: "900",
    fontFamily: theme.fonts.display,
  },
  statLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: theme.space.lg,
    marginBottom: theme.space.sm,
  },
  emptyCard: {
    padding: theme.space.md,
    gap: theme.space.sm,
    marginTop: theme.space.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  emptyBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: theme.space.xs,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
});
