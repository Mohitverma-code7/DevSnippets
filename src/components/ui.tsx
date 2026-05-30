import React from "react";
import {
  Modal,
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
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { shadow, useTheme, type AppTheme } from "@/theme";
import type { ManagedFile, ManagedFolder, Snippet } from "@/data/types";
import { formatRelativeTime } from "@/lib/format";

export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.screen, padded && styles.screenPadded]}>{children}</View>;
}

export function Surface({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <View style={[styles.surface, shadow(theme, 1), style]}>{children}</View>;
}

export type HeaderAction = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  tone?: "soft" | "primary";
};

export function AppHeader({
  title,
  subtitle,
  actions = [],
}: {
  title: string;
  subtitle?: string;
  actions?: HeaderAction[];
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Surface style={styles.headerShell}>
      <View style={styles.headerRow}>
        <View style={styles.headerMark}>
          <Ionicons name="code-slash" size={16} color={theme.colors.white} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.headerActions}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityLabel={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.headerAction,
                action.tone === "primary" ? styles.headerActionPrimary : styles.headerActionSoft,
                pressed && { opacity: 0.84, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Ionicons
                name={action.icon}
                size={17}
                color={action.tone === "primary" ? theme.colors.white : theme.colors.primary}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </Surface>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: (event: GestureResponderEvent) => void };
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
        {action ? (
          <Pressable onPress={action.onPress} style={({ pressed }) => [styles.linkButton, pressed && { opacity: 0.7 }]}>
            <Text style={styles.linkButtonText}>{action.label}</Text>
            <Ionicons name="arrow-forward" size={13} color={theme.colors.primary} />
          </Pressable>
        ) : null}
      </View>
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
  const theme = useTheme();
  const styles = createStyles(theme);
  const content = (
    <>
      {icon ? <Text style={[styles.pillIcon, active && styles.pillIconActive]}>{icon}</Text> : null}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          active && styles.pillActive,
          pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.pill, active && styles.pillActive]}>{content}</View>;
}

export const SearchField = React.forwardRef<TextInput, TextInputProps>(function SearchField(
  { style, ...props },
  ref,
) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.searchField}>
      <Ionicons name="search-outline" size={18} color={theme.colors.textSoft} />
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
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <LinearGradient
      colors={tone === "primary" ? [theme.colors.primary, theme.colors.primaryDeep] : [theme.colors.surface, theme.colors.surface2]}
      style={[styles.statTile, tone === "primary" ? styles.statTilePrimary : styles.statTileSoft]}
    >
      <Text style={[styles.statTileTitle, tone === "primary" ? styles.statTileTitleLight : styles.statTileTitleDark]}>{title}</Text>
      <Text style={[styles.statTileSubtitle, tone === "primary" ? styles.statTileSubtitleLight : styles.statTileSubtitleDark]}>
        {subtitle}
      </Text>
    </LinearGradient>
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
  const theme = useTheme();
  const styles = createStyles(theme);
  const preview = snippet.code.trim().split("\n").slice(0, 4).join("\n");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.snippetCard, pressed && { transform: [{ scale: 0.992 }] }]}
    >
      <LinearGradient
        colors={
          theme.mode === "dark"
            ? ["rgba(241,70,114,0.18)", theme.colors.surface2]
            : ["rgba(190,18,60,0.12)", "rgba(255,255,255,0.92)"]
        }
        style={styles.snippetCardInner}
      >
        <View style={styles.snippetCardTop}>
          <Pill label={snippet.language} active icon="</>" />
          <Pressable onPress={onFavorite} hitSlop={12} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <Ionicons
              name={snippet.favorite ? "star" : "star-outline"}
              size={19}
              color={snippet.favorite ? theme.colors.amber : theme.colors.textSoft}
            />
          </Pressable>
        </View>
        <Text numberOfLines={2} style={styles.snippetTitle}>
          {snippet.title}
        </Text>
        <Text numberOfLines={3} style={styles.snippetCodePreview}>
          {preview}
        </Text>
        <View style={styles.snippetCardFooter}>
          <Text style={styles.metaText}>Modified {formatRelativeTime(snippet.updatedAt)}</Text>
          <View style={styles.tagRow}>
            {snippet.tags.slice(0, 3).map((tag) => (
              <Text key={tag} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function FolderCard({
  folder,
  onDelete,
}: {
  folder: ManagedFolder;
  onDelete?: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Surface style={styles.folderCard}>
      <View style={styles.folderLeft}>
        <View style={[styles.folderIconBox, { backgroundColor: folder.accent }]}>
          <Ionicons name="folder-open-outline" size={24} color={theme.colors.primaryDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.folderName}>{folder.name}</Text>
          <Text style={styles.folderMeta}>
            {folder.itemCount} items - {folder.sizeLabel}
          </Text>
          <View style={styles.folderDots}>
            <View style={[styles.dot, { backgroundColor: "#f9c6d4" }]} />
            <View style={[styles.dot, { backgroundColor: "#f19cb4" }]} />
            <View style={[styles.dot, { backgroundColor: "#f5dbe0" }]} />
          </View>
        </View>
      </View>
      <View style={styles.folderPreviewShell}>
        {folder.previewUri ? (
          <Image
            source={{ uri: folder.previewUri }}
            style={styles.folderPreviewImage}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View style={styles.folderPreviewFallback}>
            <Ionicons name="image-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.folderPreviewText}>Preview</Text>
          </View>
        )}
      </View>
      {onDelete ? (
        <View style={styles.folderActions}>
          <Pressable
            style={({ pressed }) => [styles.folderActionButton, pressed && { opacity: 0.78 }]}
            accessibilityLabel={`Delete ${folder.name}`}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.primary} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.folderProgressTrack}>
        <View style={[styles.folderProgress, { width: `${Math.round(folder.progress * 100)}%` }]} />
      </View>
    </Surface>
  );
}

function getFileIcon(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "js":
    case "jsx":
      return "logo-javascript";
    case "ts":
    case "tsx":
      return "logo-react";
    case "py":
      return "logo-python";
    case "json":
      return "code-slash-outline";
    case "md":
      return "document-text-outline";
    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
      return "image-outline";
    default:
      return "document-outline";
  }
}

function isImageFile(name: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name);
}

export function FileRow({
  file,
  onPress,
}: {
  file: ManagedFile;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fileRow, pressed && { backgroundColor: theme.colors.surface2 }]}
    >
      {isImageFile(file.name) ? (
        <Image source={{ uri: file.path }} style={styles.fileThumb} contentFit="cover" transition={150} />
      ) : (
        <View style={styles.fileTypeBadge}>
          <Ionicons name={getFileIcon(file.name)} size={16} color={theme.colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.fileMeta}>{file.modifiedLabel}</Text>
      </View>
      <View style={styles.fileRight}>
        <Text style={styles.fileSize}>{file.sizeLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={theme.colors.textMuted} />
      </View>
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
  const theme = useTheme();
  const styles = createStyles(theme);
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
            <Ionicons name="copy-outline" size={14} color={theme.colors.textSoft} />
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
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Surface style={styles.infoCard}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </Surface>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Surface style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="sparkles-outline" size={22} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.emptyAction} onPress={onAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}

export function StatusDialog({
  visible,
  title,
  message,
  actionLabel = "OK",
  onAction,
}: {
  visible: boolean;
  title: string;
  message: string;
  actionLabel?: string;
  onAction: () => void;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onAction}>
      <View style={styles.dialogBackdrop}>
        <View style={styles.dialogCard}>
          <View style={styles.dialogIcon}>
            <Ionicons name="sparkles-outline" size={22} color={theme.colors.primary} />
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <Pressable style={styles.dialogButton} onPress={onAction}>
            <Text style={styles.dialogButtonText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.dialogBackdrop}>
        <View style={styles.dialogCard}>
          <View style={styles.dialogIcon}>
            <Ionicons
              name={danger ? "warning-outline" : "sparkles-outline"}
              size={22}
              color={danger ? theme.colors.amber : theme.colors.primary}
            />
          </View>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <Pressable style={styles.dialogSecondaryButton} onPress={onCancel}>
              <Text style={styles.dialogSecondaryButtonText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.dialogButton, danger && styles.dialogDangerButton]} onPress={onConfirm}>
              <Text style={styles.dialogButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
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
  headerShell: {
    padding: theme.space.md,
    marginBottom: theme.space.md,
    marginTop: theme.space.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  headerMark: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerActionSoft: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  headerActionPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sectionWrap: {
    marginTop: theme.space.xl,
    marginBottom: theme.space.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.space.sm,
  },
  sectionBar: {
    width: 6,
    height: 34,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 26,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  linkButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(190, 18, 60, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.12)",
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: theme.colors.white,
  },
  pillIcon: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
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
    minHeight: 92,
    justifyContent: "space-between",
  },
  statTilePrimary: {
    borderColor: "rgba(190, 18, 60, 0.22)",
  },
  statTileSoft: {
    borderColor: theme.colors.border,
  },
  statTileTitle: {
    fontSize: 21,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  statTileTitleLight: {
    color: theme.colors.white,
  },
  statTileTitleDark: {
    color: theme.colors.text,
  },
  statTileSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  statTileSubtitleLight: {
    color: "rgba(255,255,255,0.9)",
  },
  statTileSubtitleDark: {
    color: theme.colors.textSoft,
  },
  snippetCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginBottom: theme.space.md,
  },
  snippetCardInner: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.mode === "dark" ? "rgba(241,70,114,0.18)" : "rgba(190, 18, 60, 0.14)",
    padding: theme.space.md,
    gap: theme.space.sm,
  },
  snippetCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  snippetTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
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
    fontWeight: "800",
    backgroundColor: "rgba(190, 18, 60, 0.08)",
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
  folderName: {
    color: theme.colors.text,
    fontSize: 18,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  folderMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
    marginTop: 2,
  },
  folderDots: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 14,
  },
  folderPreviewShell: {
    position: "absolute",
    right: 10,
    top: 30,
    width: 112,
    height: 76,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.12)",
    backgroundColor: theme.colors.surface2,
  },
  folderPreviewImage: {
    width: "100%",
    height: "100%",
  },
  folderPreviewFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: theme.colors.surface2,
  },
  folderPreviewText: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: "700",
  },
  folderActions: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  folderActionButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  folderProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(190, 18, 60, 0.12)",
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
    backgroundColor: theme.colors.surface,
  },
  fileTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(190, 18, 60, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffe9ee",
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
  fileRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  fileSize: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    minWidth: 56,
    textAlign: "right",
  },
  codeShell: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface2,
    overflow: "hidden",
  },
  codeHeader: {
    minHeight: 50,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.space.md,
    gap: theme.space.sm,
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
    fontSize: 13,
    fontFamily: theme.fonts.mono,
    flex: 1,
    textAlign: "center",
  },
  copyBadge: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  copyButton: {
    minWidth: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
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
    color: theme.colors.textMuted,
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
    fontWeight: "800",
    fontFamily: theme.fonts.display,
  },
  infoBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    padding: theme.space.lg,
    gap: theme.space.sm,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(190, 18, 60, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  emptyBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  emptyActionText: {
    color: theme.colors.white,
    fontWeight: "800",
  },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: theme.mode === "dark" ? "rgba(0, 0, 0, 0.68)" : "rgba(31, 7, 14, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space.lg,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: theme.colors.card,
    padding: theme.space.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...shadow(theme, 2),
  },
  dialogIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.space.sm,
  },
  dialogTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontFamily: theme.fonts.display,
    fontWeight: "800",
  },
  dialogMessage: {
    color: theme.colors.textSoft,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: theme.space.lg,
  },
  dialogButton: {
    alignSelf: "flex-end",
    minWidth: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  dialogButtonText: {
    color: theme.colors.white,
    fontWeight: "800",
    fontSize: 15,
  },
  dialogDangerButton: {
    backgroundColor: theme.colors.amber,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  dialogSecondaryButton: {
    minWidth: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  dialogSecondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  });
}
