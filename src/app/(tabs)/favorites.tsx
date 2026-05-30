import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useApp } from "@/context/app-context";
import { AppHeader, EmptyState, Pill, Screen, SearchField, SectionTitle, SnippetCard, Surface, StatTile } from "@/components/ui";
import { useTheme } from "@/theme";

export default function FavoritesScreen() {
  const { snippets, toggleFavorite, setActiveSnippetId } = useApp();
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const styles = useMemo(() => createStyles(theme), [theme]);

  const favorites = useMemo(() => snippets.filter((snippet) => snippet.favorite), [snippets]);
  const languages = useMemo(() => ["All", ...Array.from(new Set(favorites.map((item) => item.language)))], [favorites]);

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
      <ScrollView showsVerticalScrollIndicator={false} >
        <AppHeader
          title="Favorites"
          subtitle="Pinned snippets for quick offline access."
          actions={[
            { icon: "settings-outline", label: "Settings", onPress: () => router.push("/settings"), tone: "soft" },
            { icon: "add", label: "Create snippet", onPress: () => router.push("/editor?mode=new"), tone: "primary" },
          ]}
        />

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Snippets you trust, sorted locally and ready for reuse offline.</Text>
          <View style={styles.statRow}>
            <StatTile title={String(favorites.length).padStart(2, "0")} subtitle="Pinned snippets" tone="primary" />
            <StatTile title={String(new Set(favorites.map((snippet) => snippet.language)).size).padStart(2, "0")} subtitle="Languages" tone="soft" />
          </View>
        </View>

        <SearchField value={query} onChangeText={setQuery} placeholder="Search favorites..." style={styles.search} />

        <SectionTitle title="Language filter" subtitle="Keep your pinned snippets focused." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {languages.map((label) => (
            <Pill key={label} label={label} active={filter === label} onPress={() => setFilter(label)} />
          ))}
        </ScrollView>

        <SectionTitle title="Pinned snippets" subtitle="Tap to open, share, or regenerate insights." action={{ label: "Create", onPress: () => router.push("/editor?mode=new") }} />
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
          <EmptyState
            title={favorites.length ? "No favorites match" : "No favorites yet"}
            body={favorites.length ? "Try a different search or language filter." : "Tap the star icon on any snippet to pin it here."}
            actionLabel="Browse snippets"
            onAction={() => router.push("/details")}
          />
        )}

        <Surface style={styles.tipCard}>
          <Text style={styles.tipTitle}>Tip for teams</Text>
          <Text style={styles.tipBody}>
            Favorites are stored in SQLite with the rest of the library, so the order and pin state stay intact after restarts.
          </Text>
        </Surface>
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
  heroSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  statRow: {
    flexDirection: "row",
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  search: {
    marginTop: theme.space.md,
  },
  filterRow: {
    gap: 8,
  },
  tipCard: {
    marginTop: theme.space.md,
    padding: theme.space.md,
  },
  tipTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  tipBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  });
}
