import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { useAppContext } from "../context/AppProvider";

export default function SearchScreen() {
  const router = useRouter();
  const { notes, setCurrentFolderId } = useAppContext();
  const [query, setQuery] = useState("");

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const filteredNotes = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.content.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Search Header */}
      <View className="px-4 pt-4 pb-2 flex-row items-center gap-3">
        <View
          className={`flex-1 flex-row items-center rounded-2xl px-3 h-12 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <MaterialIcons
            name="search"
            size={24}
            color={isDarkMode ? "#94a3b8" : "#64748b"}
          />
          <TextInput
            autoFocus
            className={`flex-1 ml-2 text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}
            placeholder="Search notes..."
            placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <MaterialIcons
                name="cancel"
                size={20}
                color={isDarkMode ? "#64748b" : "#94a3b8"}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
        >
          <Text
            className={`font-semibold ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-24">
        {query.trim() === "" ? (
          <View className="items-center justify-center mt-20">
            <MaterialIcons
              name="manage-search"
              size={64}
              color={isDarkMode ? "#334155" : "#e2e8f0"}
            />
            <Text
              className={`mt-4 text-center ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Type something to search{"\n"}your notes and ideas.
            </Text>
          </View>
        ) : (
          <View>
            <Text
              className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Search Results ({filteredNotes.length})
            </Text>

            {filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                className={`p-4 rounded-2xl border mb-3 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200 shadow-sm"}`}
                onPress={() => {
                  if (note.isLocked) {
                    setCurrentFolderId("all");
                    router.replace("/dashboard");
                  } else {
                    router.push({ pathname: "/note", params: { id: note.id } });
                  }
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {note.title}
                  </Text>
                  {note.isLocked && (
                    <MaterialIcons name="lock" size={16} color="#6366f1" />
                  )}
                </View>
                <Text
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  numberOfLines={2}
                >
                  {note.isLocked ? "This note is locked" : note.content}
                </Text>
              </TouchableOpacity>
            ))}

            {filteredNotes.length === 0 && (
              <Text
                className={`text-center mt-10 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
              >
                No notes found matching "{query}"
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}
