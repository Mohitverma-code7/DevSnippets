import { Tabs } from "expo-router";
import { theme } from "@/theme";
import { Text } from "react-native";

function TabGlyph({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, color: focused ? theme.colors.primary : theme.colors.textSoft, fontWeight: "700" }}>
      {symbol}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSoft,
        tabBarStyle: {
          backgroundColor: "#fff6f7",
          borderTopColor: theme.colors.border,
          height: 66,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabGlyph focused={focused} symbol="⌂" />,
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: "Editor",
          tabBarIcon: ({ focused }) => <TabGlyph focused={focused} symbol="</>" />,
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: "Details",
          tabBarIcon: ({ focused }) => <TabGlyph focused={focused} symbol="✦" />,
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: "Files",
          tabBarIcon: ({ focused }) => <TabGlyph focused={focused} symbol="▣" />,
        }}
      />
    </Tabs>
  );
}

