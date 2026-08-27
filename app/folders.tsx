import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import { useAppContext } from "../context/AppProvider";

import SidebarMenu from "../components/SidebarMenu"; // 🌟 1. นำเข้า SidebarMenu

export default function FoldersScreen() {
  const router = useRouter();
  const { folders, notes, setCurrentFolderId, addFolder, updateFolder, deleteFolder } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // 🌟 2. เพิ่ม State สำหรับเปิด/ปิด Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleFolderClick = (folderId: string | "all") => {
    setCurrentFolderId(folderId);
    router.replace("/dashboard");
  };

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreating(false);
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      updateFolder(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
    }
  };

  const handleDeleteFolder = () => {
    if (editingFolderId) {
      deleteFolder(editingFolderId);
      setEditingFolderId(null);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          onPress={() => setIsSidebarOpen(true)} // 🌟 3. ใส่คำสั่งเปิด Sidebar ตรงนี้
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
          Folders
        </Text>
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50"}`}
          onPress={() => setIsCreating(true)}
        >
          <MaterialIcons
            name="create-new-folder"
            size={24}
            color={isDarkMode ? "#818cf8" : "#6366f1"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-2 pb-24">
        <View className="space-y-3">
          {/* ส่วนสร้างโฟลเดอร์ใหม่ */}
          {isCreating && (
            <View
              className={`p-4 rounded-2xl border mb-3 ${isDarkMode ? "bg-indigo-950/30 border-indigo-900" : "bg-indigo-50 border-indigo-200"}`}
            >
              <TextInput
                autoFocus
                placeholder="Folder name"
                placeholderTextColor={isDarkMode ? "#6366f1" : "#818cf8"}
                value={newFolderName}
                onChangeText={setNewFolderName}
                className={`font-bold text-lg border-b pb-1 mb-3 ${isDarkMode ? "text-indigo-300 border-indigo-800" : "text-slate-900 border-indigo-200"}`}
              />
              <View className="flex-row justify-end gap-2">
                <TouchableOpacity onPress={() => setIsCreating(false)}>
                  <Text
                    className={`px-3 py-1 font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-indigo-500 px-4 py-1 rounded-lg" onPress={handleCreateFolder}>
                  <Text className="text-white font-bold">Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* รายการ All Notes */}
          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-sm mb-3 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
            onPress={() => handleFolderClick("all")}
          >
            <View className="flex-row items-center gap-4">
              <View
                className={`w-12 h-12 items-center justify-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
              >
                <MaterialIcons
                  name="all-inbox"
                  size={28}
                  color={isDarkMode ? "#94a3b8" : "#475569"}
                />
              </View>
              <View>
                <Text
                  className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  All Notes
                </Text>
                <Text
                  className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                >
                  {notes.length} notes
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isDarkMode ? "#475569" : "#cbd5e1"}
            />
          </TouchableOpacity>

          {/* 🌟 ปุ่ม Shared Notes */}
          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-sm mb-3 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
            onPress={() => router.push("/shared")}
          >
            <View className="flex-row items-center gap-4">
              <View
                className={`w-12 h-12 items-center justify-center rounded-xl ${isDarkMode ? "bg-blue-900/30" : "bg-blue-50"}`}
              >
                <MaterialIcons
                  name="people"
                  size={28}
                  color={isDarkMode ? "#60a5fa" : "#3b82f6"}
                />
              </View>
              <Text
                className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Shared Notes
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isDarkMode ? "#475569" : "#cbd5e1"}
            />
          </TouchableOpacity>

          {/* 🌟 ปุ่ม Trash (ถังขยะ) */}
          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-sm mb-6 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
            onPress={() => router.push("/trash")}
          >
            <View className="flex-row items-center gap-4">
              <View
                className={`w-12 h-12 items-center justify-center rounded-xl ${isDarkMode ? "bg-rose-900/30" : "bg-rose-50"}`}
              >
                <MaterialIcons
                  name="delete"
                  size={28}
                  color={isDarkMode ? "#fb7185" : "#f43f5e"}
                />
              </View>
              <Text
                className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Trash
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isDarkMode ? "#475569" : "#cbd5e1"}
            />
          </TouchableOpacity>

          {/* รายการ Folders */}
          {folders.map((folder) => (
            <TouchableOpacity
              key={folder.id}
              className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-sm mb-3 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}
              onPress={() => handleFolderClick(folder.id)}
              onLongPress={() => {
                setEditingFolderId(folder.id);
                setEditingFolderName(folder.name);
              }}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className={`w-12 h-12 items-center justify-center rounded-xl ${isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50"}`}
                >
                  <MaterialIcons
                    name="folder"
                    size={28}
                    color={isDarkMode ? "#818cf8" : "#6366f1"}
                  />
                </View>
                <View>
                  <Text
                    className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    {folder.name}
                  </Text>
                  <Text
                    className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                  >
                    {notes.filter((n) => n.folderId === folder.id).length} notes
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDarkMode ? "#475569" : "#cbd5e1"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit/Delete Folder Modal */}
      <Modal transparent visible={!!editingFolderId} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View
            className={`p-6 rounded-3xl w-full max-w-sm ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
          >
            <View className="items-center mb-6">
              <MaterialIcons
                name="folder"
                size={48}
                color="#6366f1"
                className="mb-2"
              />
              <Text
                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Edit Folder
              </Text>
            </View>

            <TextInput
              value={editingFolderName}
              onChangeText={setEditingFolderName}
              className={`w-full rounded-xl p-4 text-center text-xl mb-6 ${isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              autoFocus
            />

            <View className="flex-col gap-3">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 items-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                  onPress={() => setEditingFolderId(null)}
                >
                  <Text
                    className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 items-center rounded-xl bg-indigo-500"
                  onPress={handleUpdateFolder}
                >
                  <Text className="font-bold text-white">Save</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                className="w-full py-3 items-center rounded-xl bg-rose-500"
                onPress={handleDeleteFolder}
              >
                <Text className="font-bold text-white">Delete Folder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🌟 4. วาง SidebarMenu ไว้เหนือ BottomNav */}
      <SidebarMenu
        isVisible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <BottomNav />
    </SafeAreaView>
  );
}
