import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppProvider";

export default function TrashScreen() {
  const router = useRouter();
  const { notes, updateNote, deleteNote, emptyTrash } = useAppContext();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // ดึงเฉพาะโน้ตที่อยู่ในถังขยะ
  const trashNotes = notes.filter((n) => n.isTrash);

  // กู้คืนโน้ต
  const handleRestore = (id: string) => {
    updateNote(id, { isTrash: false });
  };

  // ลบถิ้งทั้งหมด
  const handleEmptyTrash = () => {
    emptyTrash();
  };

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/dashboard")
            }
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={20}
              color={isDarkMode ? "#f1f5f9" : "#334155"}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Trash
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleEmptyTrash}
          disabled={trashNotes.length === 0}
        >
          <Text
            className={`font-semibold ${trashNotes.length === 0 ? "text-slate-400" : "text-rose-500"}`}
          >
            Empty Trash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View className="px-4 py-3">
        <View
          className={`rounded-xl p-3 flex-row items-start gap-3 ${isDarkMode ? "bg-slate-900" : "bg-slate-100"}`}
        >
          <MaterialIcons name="info" size={20} color="#64748b" />
          <Text
            className={`flex-1 text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            Notes in the Trash are permanently deleted after 30 days. You can
            restore them or delete them manually before then.
          </Text>
        </View>
      </View>

      {/* List Area */}
      <ScrollView className="flex-1 px-4 pt-2 pb-24">
        {trashNotes.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <MaterialIcons
              name="delete-outline"
              size={64}
              color={isDarkMode ? "#334155" : "#cbd5e1"}
            />
            <Text
              className={`mt-4 font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              Trash is empty.
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-3">
            {trashNotes.map((note) => (
              <View
                key={note.id}
                className={`p-4 rounded-xl border shadow-sm ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}
              >
                <View className="mb-3">
                  <Text
                    className={`font-bold text-lg mb-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {note.title}
                  </Text>
                  <Text
                    className={`text-sm italic ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                    numberOfLines={2}
                  >
                    {note.content || "Empty note..."}
                  </Text>
                </View>

                <View
                  className={`flex-row items-center justify-end gap-3 pt-3 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
                >
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5"
                    onPress={() => handleRestore(note.id)}
                  >
                    <MaterialIcons
                      name="restore"
                      size={20}
                      color={isDarkMode ? "#94a3b8" : "#64748b"}
                    />
                    <Text
                      className={`text-xs font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Restore
                    </Text>
                  </TouchableOpacity>

                  <View
                    className={`h-4 w-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                  />

                  <TouchableOpacity
                    className="flex-row items-center gap-1.5"
                    onPress={() => deleteNote(note.id)}
                  >
                    <MaterialIcons
                      name="delete-forever"
                      size={20}
                      color="#e11d48"
                    />
                    <Text className="text-xs font-semibold text-rose-600">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
