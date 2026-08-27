import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useColorScheme } from "nativewind"; // นำเข้าตัวเช็คธีม
import { Text, TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const tabs = [
    { name: "Notes", path: "/dashboard", icon: "dashboard" },
    { name: "Folders", path: "/folders", icon: "folder" },
    { name: "Search", path: "/search", icon: "search" },
    { name: "Settings", path: "/settings", icon: "settings" },
  ];

  return (
    <View
      className={`flex-row items-center justify-around border-t pt-3 pb-2 px-2 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            className="items-center justify-center p-2 flex-1"
            onPress={() => router.replace(tab.path as any)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={26}
              color={isActive ? "#6366f1" : isDarkMode ? "#64748b" : "#94a3b8"}
            />
            <Text
              className={`text-[10px] mt-1 font-semibold ${isActive ? "text-indigo-500" : isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
