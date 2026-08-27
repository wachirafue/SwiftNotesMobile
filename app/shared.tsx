import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppProvider";

export default function SharedNotesScreen() {
  const router = useRouter();
  const { notes, addNote, currentUserEmail } = useAppContext();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // สร้าง State สำหรับเก็บว่าตอนนี้เปิดแท็บไหน และค้นหาคำว่าอะไร
  const [activeTab, setActiveTab] = useState<"with_me" | "by_me">("with_me");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. กรองเฉพาะโน้ตที่ไม่ใช่ขยะ + ตรงกับแท็บที่เลือก + ตรงกับคำค้นหา
  const sharedNotes = notes.filter((n) => {
    if (n.isTrash) return false;
    
    // Check Search
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Check Tab
    const userEmail = currentUserEmail || "mock@mock.com";
    if (activeTab === "with_me") {
      return n.collaborators?.includes(userEmail) || n.sharedType === "with_me";
    } else {
      // If it has collaborators and you aren't one of them, it implies you are the owner who shared it.
      return (n.collaborators && n.collaborators.length > 0 && !n.collaborators.includes(userEmail)) || n.sharedType === "by_me";
    }
  });

  // 2. ฟังก์ชันจำลองการแชร์โน้ต (ใช้เพื่อเทสต์ UI)
  const handleMockShare = () => {
    addNote({
      title:
        activeTab === "with_me"
          ? "Marketing Strategy 2024"
          : "Product Specs - v2.0",
      content:
        activeTab === "with_me"
          ? "Reviewing the Q1 roadmap for social media expansion and influencer partnerships."
          : "Defining the core requirements for the upcoming dark mode overhaul.",
      folderId: "all",
      isLocked: false,
      isPinned: activeTab === "with_me",
      isTrash: false,
      sharedType: activeTab, // กำหนดให้เป็นโน้ตที่ถูกแชร์
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 pb-2">
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/folders")
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
          Shared Notes
        </Text>
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <MaterialIcons
            name="more-horiz"
            size={24}
            color={isDarkMode ? "#f1f5f9" : "#334155"}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3">
        <View
          className={`flex-row items-center w-full h-12 rounded-2xl px-4 ${isDarkMode ? "bg-slate-900" : "bg-slate-100"}`}
        >
          <MaterialIcons
            name="search"
            size={24}
            color={isDarkMode ? "#94a3b8" : "#64748b"}
          />
          <TextInput
            className={`flex-1 ml-2 text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}
            placeholder="Search shared notes"
            placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons
                name="cancel"
                size={20}
                color={isDarkMode ? "#64748b" : "#94a3b8"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Interactive Tabs */}
      <View className="px-4 pb-4">
        <View
          className={`flex-row p-1 rounded-xl ${isDarkMode ? "bg-slate-900" : "bg-slate-100"}`}
        >
          <TouchableOpacity
            className={`flex-1 py-2 items-center justify-center rounded-lg ${activeTab === "with_me" ? (isDarkMode ? "bg-slate-700 shadow-sm" : "bg-white shadow-sm") : ""}`}
            onPress={() => setActiveTab("with_me")}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === "with_me" ? (isDarkMode ? "text-white" : "text-slate-900") : isDarkMode ? "text-slate-500" : "text-slate-500"}`}
            >
              Shared with me
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 items-center justify-center rounded-lg ${activeTab === "by_me" ? (isDarkMode ? "bg-slate-700 shadow-sm" : "bg-white shadow-sm") : ""}`}
            onPress={() => setActiveTab("by_me")}
          >
            <Text
              className={`text-sm font-semibold ${activeTab === "by_me" ? (isDarkMode ? "text-white" : "text-slate-900") : isDarkMode ? "text-slate-500" : "text-slate-500"}`}
            >
              Shared by me
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shared Notes List */}
      <ScrollView className="flex-1 px-4 pb-24">
        {sharedNotes.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <MaterialIcons
              name="folder-shared"
              size={64}
              color={isDarkMode ? "#334155" : "#cbd5e1"}
            />
            <Text
              className={`mt-4 font-bold text-lg ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              No shared notes found
            </Text>
            <Text
              className={`text-center mt-2 text-sm px-6 ${isDarkMode ? "text-slate-500" : "text-slate-500"}`}
            >
              {activeTab === "with_me"
                ? "You don't have any notes shared with you yet. Tap the button below to simulate receiving one!"
                : "You haven't shared any notes. Tap the button below to simulate sharing one!"}
            </Text>
          </View>
        ) : (
          <View className="flex-col gap-4">
            {sharedNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                className={`p-4 rounded-2xl border shadow-sm ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}
                onPress={() =>
                  router.push({ pathname: "/note", params: { id: note.id } })
                }
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-2">
                    <Text
                      className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    >
                      {note.title}
                    </Text>
                    <Text
                      className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Updated recently
                    </Text>
                  </View>
                  {note.isPinned && (
                    <MaterialIcons name="star" size={24} color="#6366f1" />
                  )}
                </View>
                <Text
                  className={`text-sm mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                  numberOfLines={2}
                >
                  {note.content}
                </Text>
                <View
                  className={`flex-row items-center justify-between pt-3 border-t ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
                >
                  {/* แสดงรูปโปรไฟล์จำลองตามหมวดหมู่ */}
                  <View className="flex-row">
                    {activeTab === "with_me" ? (
                      <>
                        <Image
                          source={{ uri: "https://i.pravatar.cc/150?img=1" }}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200"
                        />
                        <View className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-500 items-center justify-center -ml-2">
                          <Text className="text-[10px] font-bold text-white">
                            JD
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 items-center justify-center">
                          <Text className="text-[10px] font-bold text-white">
                            MK
                          </Text>
                        </View>
                        <Image
                          source={{ uri: "https://i.pravatar.cc/150?img=2" }}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 -ml-2"
                        />
                      </>
                    )}
                  </View>

                  {/* สิทธิ์การเข้าถึง */}
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons
                      name={activeTab === "with_me" ? "visibility" : "edit"}
                      size={14}
                      color={activeTab === "with_me" ? "#94a3b8" : "#10b981"}
                    />
                    <Text
                      className={`text-[11px] font-medium ${activeTab === "with_me" ? "text-slate-400" : "text-emerald-500"}`}
                    >
                      {activeTab === "with_me" ? "View Only" : "Can Edit"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button (ปุ่มจำลองการสร้าง Shared Note) */}
      <View className="absolute bottom-10 right-6 z-40">
        <TouchableOpacity
          className="w-14 h-14 items-center justify-center rounded-full bg-indigo-500 shadow-xl"
          onPress={handleMockShare}
        >
          <MaterialIcons name="person-add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
