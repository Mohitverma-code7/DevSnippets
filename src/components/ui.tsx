import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { theme, shadow } from "@/theme";
import type { ManagedFile, ManagedFolder, Snippet } from "@/data/types";
import { formatRelativeTime } from "@/lib/format";

export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return <View style={[styles.screen, padded && styles.screenPadded]}>{children}</View>;
}

export function Surface({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.surface, shadow(1), style]}>{children}</View>;
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onPress: (event: GestureResponderEvent) => void };
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ flex: 1 }} />
      {action ? (
        <Pressable onPress={action.onPress} style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.75 }]}>
          <Text style={styles.linkButtonText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: string;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          active && styles.pillActive,
          pressed ? { transform: [{ scale: 0.98 }], opacity: 0.96 } : null,
        ]}
      >
        {icon ? <Text style={[styles.pillIcon, active && styles.pillIconActive]}>{icon}</Text> : null}
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.pill, active && styles.pillActive]}>
      {icon ? <Text style={[styles.pillIcon, active && styles.pillIconActive]}>{icon}</Text> : null}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </View>
  );
}

export const SearchField = React.forwardRef<TextInput, TextInputProps>(function SearchField(
  { style, ...props },
  ref,
) {
  return (
    <View style={styles.searchField}>
      <Text style={styles.searchIcon}>Search</Text>
      <TextInput
        ref={ref}
        {...props}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.searchInput, style]}
      />
    </View>
  );
});

export function StatTile({
  title,
  subtitle,
  tone = "primary",
}: {
  title: string;
  subtitle: string;
  tone?: "primary" | "soft";
}) {
  return (
    <View style={[styles.statTile, tone === "primary" ? styles.statTilePrimary : styles.statTileSoft]}>
      <Text style={styles.statTileTitle}>{title}</Text>
      <Text style={styles.statTileSubtitle}>{subtitle}</Text>
    </View>
  );
}

export function SnippetCard({
  snippet,
  onPress,
  onFavorite,
}: {
  snippet: Snippet;
  onPress?: () => void;
  onFavorite?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.snippetCard, pressed && { transform: [{ scale: 0.99 }] }]}>
      <View style={styles.snippetCardTop}>
        <Pill label={snippet.language} active />
        <Pressable onPress={onFavorite} hitSlop={12}>
          <Text style={[styles.favoriteIcon, snippet.favorite && styles.favoriteIconActive]}>{snippet.favorite ? "★" : "☆"}</Text>
        </Pressable>
      </View>
      <Text numberOfLines={2} style={styles.snippetTitle}>
        {snippet.title}
      </Text>
      <Text numberOfLines={3} style={styles.snippetCodePreview}>
        {snippet.code}
      </Text>
      <View style={styles.snippetCardFooter}>
        <Text style={styles.metaText}>Modified {formatRelativeTime(snippet.updatedAt)}</Text>
        <View style={styles.tagRow}>
          {snippet.tags.slice(0, 2).map((tag) => (
            <Text key={tag} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export function FolderCard({ folder }: { folder: ManagedFolder }) {
  return (
    <Surface style={styles.folderCard}>
      <View style={styles.folderLeft}>
        <View style={[styles.folderIconBox, { backgroundColor: folder.accent }]}>
          <Text style={styles.folderIcon}>▣</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.folderName}>{folder.name}</Text>
          <Text style={styles.folderMeta}>
            {folder.itemCount} items • {folder.sizeLabel}
          </Text>
          <View style={styles.folderDots}>
            <View style={[styles.dot, { backgroundColor: "#fbcfe8" }]} />
            <View style={[styles.dot, { backgroundColor: "#fda4af" }]} />
            <View style={[styles.dot, { backgroundColor: "#e5e7eb" }]} />
          </View>
        </View>
      </View>
      <View style={styles.folderOutline} />
      <View style={styles.folderProgressTrack}>
        <View style={[styles.folderProgress, { width: `${Math.round(folder.progress * 100)}%` }]} />
      </View>
    </Surface>
  );
}

export function FileRow({
  file,
  onPress,
}: {
  file: ManagedFile;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.fileRow, pressed && { backgroundColor: "#fff7f8" }]}>
      <Text style={styles.fileType}>{file.icon.toUpperCase().slice(0, 4)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileMeta}>{file.modifiedLabel}</Text>
      </View>
      <Text style={styles.fileSize}>{file.sizeLabel}</Text>
    </Pressable>
  );
}

export function CodePanel({
  title,
  code,
  lineNumbers = false,
  onCopy,
}: {
  title: string;
  code: string;
  lineNumbers?: boolean;
  onCopy?: () => void;
}) {
  const lines = code.split("\n");
  return (
    <View style={styles.codeShell}>
      <View style={styles.codeHeader}>
        <View style={styles.windowDots}>
          <View style={[styles.windowDot, { backgroundColor: "#fb7185" }]} />
          <View style={[styles.windowDot, { backgroundColor: "#f59e0b" }]} />
          <View style={[styles.windowDot, { backgroundColor: "#34d399" }]} />
        </View>
        <Text style={styles.codeTitle}>{title}</Text>
        {onCopy ? (
          <Pressable onPress={onCopy} hitSlop={10} style={({ pressed }) => [styles.copyButton, pressed && { opacity: 0.7 }]}>
            <Text style={styles.copyBadge}>Copy</Text>
          </Pressable>
        ) : (
          <Text style={styles.copyBadge}>Code</Text>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeBody}>
          {lines.map((line, index) => (
            <View key={`${title}-${index}`} style={styles.codeLine}>
              {lineNumbers ? <Text style={styles.lineNo}>{String(index + 1).padStart(2, "0")}</Text> : null}
              <Text style={styles.codeText}>{line || " "}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function InfoCard({
  title,
  body,
  eyebrow,
}: {
  title: string;
  body: string;
  eyebrow?: string;
}) {
  return (
    <Surface style={styles.infoCard}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  screenPadded: {
    paddingHorizontal: theme.space.md,
    paddingBottom: theme.space.xl,
  },
  surface: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
    marginTop: theme.space.xl,
    marginBottom: theme.space.md,
  },
  sectionBar: {
    width: 6,
    height: 34,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  linkButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(200, 16, 58, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(200, 16, 58, 0.14)",
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  pillTextActive: {
    color: theme.colors.white,
  },
  pillIcon: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  pillIconActive: {
    color: theme.colors.white,
  },
  searchField: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
    gap: theme.space.sm,
  },
  searchIcon: {
    color: theme.colors.textSoft,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    paddingVertical: 12,
  },
  statTile: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.space.md,
    gap: 4,
  },
  statTilePrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statTileSoft: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  statTileTitle: {
    color: theme.colors.white,
    fontSize: 20,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  statTileSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  snippetCard: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#fff4f5",
    padding: theme.space.md,
    gap: theme.space.sm,
    marginBottom: theme.space.md,
  },
  snippetCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteIcon: {
    color: theme.colors.textSoft,
    fontSize: 18,
  },
  favoriteIconActive: {
    color: theme.colors.primary,
  },
  snippetTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  snippetCodePreview: {
    color: theme.colors.textSoft,
    fontFamily: theme.fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
  snippetCardFooter: {
    gap: theme.space.xs,
  },
  metaText: {
    color: theme.colors.textSoft,
    fontSize: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    color: theme.colors.primaryDeep,
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "rgba(200, 16, 58, 0.08)",
    borderRadius: theme.radius.full,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  folderCard: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    gap: theme.space.md,
  },
  folderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
  },
  folderIconBox: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  folderIcon: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },
  folderName: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "700",
  },
  folderMeta: {
    color: theme.colors.textSoft,
    fontSize: 14,
    marginTop: 2,
  },
  folderDots: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 16,
  },
  folderOutline: {
    position: "absolute",
    right: 10,
    top: 34,
    width: 112,
    height: 76,
    borderRadius: 16,
    borderWidth: 8,
    borderColor: "rgba(200, 16, 58, 0.12)",
    borderTopColor: "transparent",
  },
  folderProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(200, 16, 58, 0.12)",
    overflow: "hidden",
  },
  folderProgress: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.md,
    paddingVertical: theme.space.md,
    paddingHorizontal: theme.space.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fileType: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 12,
    width: 34,
    textAlign: "center",
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
    fontSize: 16,
    fontWeight: "700",
    minWidth: 56,
    textAlign: "right",
  },
  codeShell: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#ffecef",
    overflow: "hidden",
  },
  codeHeader: {
    height: 50,
    backgroundColor: "#fff2f3",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
  },
  windowDots: {
    flexDirection: "row",
    gap: 8,
    width: 80,
  },
  windowDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  codeTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.mono,
    flex: 1,
    textAlign: "center",
  },
  copyBadge: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
    width: 48,
    textAlign: "right",
  },
  copyButton: {
    minWidth: 48,
    alignItems: "flex-end",
  },
  codeBody: {
    padding: theme.space.md,
    minWidth: 500,
  },
  codeLine: {
    flexDirection: "row",
    gap: theme.space.md,
    minHeight: 22,
  },
  lineNo: {
    width: 28,
    color: "#c7a1a8",
    fontFamily: theme.fonts.mono,
    fontSize: 12,
  },
  codeText: {
    color: theme.colors.primaryDeep,
    fontFamily: theme.fonts.mono,
    fontSize: 13,
    lineHeight: 21,
  },
  infoCard: {
    padding: theme.space.md,
    gap: theme.space.xs,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: theme.fonts.display,
  },
  infoBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
