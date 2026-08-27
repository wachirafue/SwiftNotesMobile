import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note, useAppContext } from "../context/AppProvider";

import BottomNav from "../components/BottomNav";
import SidebarMenu from "../components/SidebarMenu";

export default function DashboardScreen() {
  const router = useRouter();
  const { notes, folders, currentFolderId, setCurrentFolderId, userProfilePic } =
    useAppContext();
  const [unlockingNoteId, setUnlockingNoteId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const handleNoteClick = (note: Note) => {
    if (note.isLocked) {
      setUnlockingNoteId(note.id);
      setPin("");
    } else {
      router.push({ pathname: "/note", params: { id: note.id } });
    }
  };

  // อัปเดตให้เช็ครหัส PIN จากโน้ตจริงๆ
  const handleUnlock = () => {
    const noteToUnlock = notes.find((n) => n.id === unlockingNoteId);
    const correctPin = noteToUnlock?.pin || "1234"; // ถ้ายกเว้นไม่มีรหัสให้ใช้ 1234

    if (pin === correctPin) {
      const targetId = unlockingNoteId;
      setUnlockingNoteId(null);
      setPin("");
      // ปลดล็อกเสร็จเด้งเข้าหน้าอ่านโน้ตเลย
      router.push({ pathname: "/note", params: { id: targetId } });
    } else {
      alert("Incorrect PIN (รหัสผ่านไม่ถูกต้อง)");
      setPin("");
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      !n.isTrash &&
      (currentFolderId === "all" || n.folderId === currentFolderId),
  );

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          onPress={() => setIsSidebarOpen(true)}
        >
          <MaterialIcons
            name="menu"
            size={24}
            color={isDarkMode ? "#f1f5f9" : "#334155"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          My Notes
        </Text>
        <TouchableOpacity
          className={`w-10 h-10 rounded-full overflow-hidden border ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
          onPress={() => router.push("/settings")}
        >
          <Image
            source={{ uri: userProfilePic }}
            className="w-full h-full"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <TouchableOpacity
          className={`flex-row items-center w-full h-12 rounded-2xl px-4 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          onPress={() => router.push("/search")}
        >
          <MaterialIcons
            name="search"
            size={24}
            color={isDarkMode ? "#94a3b8" : "#64748b"}
          />
          <Text
            className={`ml-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Search your notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Folders (แนวนอน) */}
      <View className="pb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={`border-b px-4 flex-row ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}
        >
          <TouchableOpacity
            className={`items-center justify-center border-b-2 pb-3 pt-2 mr-6 ${currentFolderId === "all" ? "border-indigo-500" : "border-transparent"}`}
            onPress={() => setCurrentFolderId("all")}
          >
            <Text
              className={`text-sm font-semibold ${currentFolderId === "all" ? "text-indigo-500" : isDarkMode ? "text-slate-500" : "text-slate-500"}`}
            >
              All
            </Text>
          </TouchableOpacity>
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              className={`items-center justify-center border-b-2 pb-3 pt-2 mr-6 ${currentFolderId === folder.id ? "border-indigo-500" : "border-transparent"}`}
              onPress={() => setCurrentFolderId(folder.id)}
            >
              <Text
                className={`text-sm font-semibold ${currentFolderId === folder.id ? "text-indigo-500" : isDarkMode ? "text-slate-500" : "text-slate-500"}`}
              >
                {folder.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notes List */}
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text
            className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            Recent Notes
          </Text>
          <Text
            className={`text-xs font-medium tracking-widest uppercase ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            {filteredNotes.length} notes
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              onPress={() => handleNoteClick(note)}
              className={`w-[48%] mb-4 p-4 rounded-2xl border ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-slate-50 border-slate-200 shadow-sm"
              }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text
                  className={`font-bold flex-1 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  numberOfLines={2}
                >
                  {note.title}
                </Text>
                {note.isLocked && (
                  <MaterialIcons name="lock" size={16} color="#6366f1" />
                )}
                {note.isPinned && !note.isLocked && (
                  <MaterialIcons name="push-pin" size={16} color="#94a3b8" />
                )}
              </View>

              {note.isLocked ? (
                <View
                  className={`flex-1 items-center justify-center py-6 rounded-xl my-1 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
                >
                  <MaterialIcons name="lock" size={24} color="#94a3b8" />
                  <Text className="text-[10px] font-semibold text-slate-400 uppercase mt-2">
                    Locked
                  </Text>
                </View>
              ) : (
                <Text
                  className={`text-sm mb-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  numberOfLines={3}
                >
                  {note.content}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button (ปุ่ม +) */}
      <View className="absolute bottom-24 right-6 z-40">
        <TouchableOpacity
          className="w-14 h-14 items-center justify-center rounded-full bg-indigo-500 shadow-xl"
          onPress={() => router.push("/note")}
        >
          <MaterialIcons name="add" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal PIN */}
      <Modal transparent visible={!!unlockingNoteId} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View
            className={`p-6 rounded-3xl w-full max-w-sm ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
          >
            <View className="items-center mb-6">
              <MaterialIcons
                name="lock"
                size={48}
                color="#6366f1"
                className="mb-2"
              />
              <Text
                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Unlock Note
              </Text>
              <Text
                className={`text-sm mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Enter your PIN to view this note.
              </Text>
            </View>

            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              value={pin}
              onChangeText={setPin}
              className={`w-full rounded-xl p-4 text-center text-2xl mb-6 ${isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
              style={{ letterSpacing: 8 }}
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                onPress={() => setUnlockingNoteId(null)}
              >
                <Text
                  className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 items-center rounded-xl bg-indigo-500"
                onPress={handleUnlock}
              >
                <Text className="font-bold text-white">Unlock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* วาง SidebarMenu ไว้ตรงนี้ */}
      <SidebarMenu
        isVisible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <BottomNav />
    </SafeAreaView>
  );
}
