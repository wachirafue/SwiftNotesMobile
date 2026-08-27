import { MaterialIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import {
    Image,
    Modal,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useAppContext } from "../context/AppProvider";
import { auth } from "../firebaseConfig";

type SidebarMenuProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function SidebarMenu({ isVisible, onClose }: SidebarMenuProps) {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { userProfilePic } = useAppContext();
  const displayName = auth?.currentUser?.displayName || "SwiftNotes User";
  const email = auth?.currentUser?.email || "Free Plan";
  const router = useRouter();
  const pathname = usePathname();

  // รายการเมนูทางลัด
  const menuItems = [
    { icon: "dashboard", label: "My Notes", path: "/dashboard" },
    { icon: "folder", label: "Folders", path: "/folders" },
    { icon: "people", label: "Shared Notes", path: "/shared" },
    { icon: "delete", label: "Trash", path: "/trash" },
    { icon: "settings", label: "Settings", path: "/settings" },
  ];

  const handleNavigate = (path: string) => {
    onClose(); // ปิดเมนูก่อน
    if (pathname !== path) {
      router.replace(path as any); // เปลี่ยนหน้า
    }
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 flex-row">
        {/* แถบเมนูด้านซ้าย (Sidebar) */}
        <View
          className={`w-[75%] max-w-[320px] h-full shadow-2xl p-6 pt-16 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
        >
          {/* ปุ่มปิด (กากบาท) */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-12 right-4 p-2"
          >
            <MaterialIcons
              name="close"
              size={28}
              color={isDarkMode ? "#94a3b8" : "#64748b"}
            />
          </TouchableOpacity>

          {/* ข้อมูลโปรไฟล์ */}
          <View className="mb-6">
            <Image
              source={{ uri: userProfilePic }}
              className={`w-16 h-16 rounded-full mb-3 border-2 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
            />
            <Text
              className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {displayName}
            </Text>
            <Text
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {email}
            </Text>
          </View>

          {/* เส้นคั่น */}
          <View
            className={`h-[1px] w-full mb-4 ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          />

          {/* รายการเมนู */}
          <View className="flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleNavigate(item.path)}
                  className={`flex-row items-center p-3 rounded-xl ${isActive ? (isDarkMode ? "bg-indigo-500/20" : "bg-indigo-50") : ""}`}
                >
                  <MaterialIcons
                    name={item.icon as any}
                    size={24}
                    color={
                      isActive ? "#6366f1" : isDarkMode ? "#94a3b8" : "#64748b"
                    }
                  />
                  <Text
                    className={`ml-4 font-semibold text-base ${isActive ? "text-indigo-500" : isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ปุ่ม Help ด้านล่างสุด */}
          <View className="absolute bottom-10 left-6 right-6">
            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
            >
              <MaterialIcons
                name="help-outline"
                size={24}
                color={isDarkMode ? "#94a3b8" : "#64748b"}
              />
              <Text
                className={`ml-4 font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Help & Feedback
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* พื้นที่สีดำใสๆ ด้านขวา (กดเพื่อปิดเมนูได้) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/50" />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}
