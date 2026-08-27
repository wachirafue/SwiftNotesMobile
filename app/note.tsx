import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppProvider";

// 🌟 นำเข้าเครื่องมือจัดการเวลาและการแจ้งเตือน
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

export default function NoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { notes, addNote, updateNote, currentFolderId, currentUserEmail } = useAppContext();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isLocked, setIsLocked] = useState(false);
  const [notePin, setNotePin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempPin, setTempPin] = useState("");

  // 🌟 State สำหรับระบบแจ้งเตือน
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notificationId, setNotificationId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // 🌟 State สำหรับระบบใช้งานร่วมกัน (Co-work)
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");

  useEffect(() => {
    if (id) {
      const existingNote = notes.find((n) => n.id === id);
      if (existingNote) {
        setTitle(existingNote.title);
        setContent(existingNote.content);
        setIsLocked(existingNote.isLocked || false);
        setNotePin(existingNote.pin || "");
        if (existingNote.dueDate) setDueDate(new Date(existingNote.dueDate));
        setNotificationId(existingNote.notificationId || null);
        setCollaborators(existingNote.collaborators || []);
      }
    }
  }, [id]);

  // 🌟 ฟังก์ชันจัดการเวลาที่เลือก
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const current = dueDate || new Date();
      current.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      setDueDate(new Date(current));
      // พอเลือกวันเสร็จ ให้เด้งเลือกเวลาต่อเลย (บน Android)
      if (Platform.OS === "android") setShowTimePicker(true);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && dueDate) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
      setDueDate(newDate);
    }
  };

  // 🌟 ฟังก์ชัน Save แบบ Async (เพราะต้องรอเซฟระบบแจ้งเตือน)
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      router.canGoBack() ? router.back() : router.replace("/dashboard");
      return;
    }

    let newNotificationId = notificationId;

    // ถ้ายกเลิกการแจ้งเตือน หรือเปลี่ยนเวลา ให้ลบการแจ้งเตือนเก่าทิ้งก่อน
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      newNotificationId = null;
    }

    // ถ้าตั้งเวลาแจ้งเตือนไว้ และเวลาต้องมากกว่าปัจจุบัน
    if (dueDate && dueDate > new Date()) {
      newNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Reminder: ${title || "Untitled Note"}`,
          body: content
            ? content.substring(0, 50) + "..."
            : "You have a task to check!",
          sound: true,
        },
        trigger: { date: dueDate },
      });
    }

    if (id) {
      updateNote(id as string, {
        title,
        content,
        isLocked,
        pin: notePin,
        dueDate: dueDate ? dueDate.toISOString() : null,
        notificationId: newNotificationId,
        collaborators,
      });
    } else {
      addNote({
        title: title || "Untitled Note",
        content,
        folderId: currentFolderId === "all" ? "1" : currentFolderId,
        isLocked,
        pin: notePin,
        isPinned: false,
        isTrash: false,
        sharedType: null,
        dueDate: dueDate ? dueDate.toISOString() : null,
        notificationId: newNotificationId,
        collaborators,
      });
    }

    router.canGoBack() ? router.back() : router.replace("/dashboard");
  };

  const handleDelete = async () => {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId); // ยกเลิกแจ้งเตือนถ้าลบโน้ต
    }
    if (id) updateNote(id as string, { isTrash: true });
    router.canGoBack() ? router.back() : router.replace("/dashboard");
  };

  const toggleLock = () => {
    if (isLocked) {
      setIsLocked(false);
      setNotePin("");
    } else {
      setTempPin("");
      setShowPinModal(true);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      <View
        className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}
      >
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

        <View className="flex-row items-center gap-2">
          {/* 🌟 ปุ่มตั้งเวลาแจ้งเตือน (รูปกระดิ่ง/นาฬิกา) */}
          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ${dueDate ? (isDarkMode ? "bg-amber-900/30" : "bg-amber-100") : isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
            onPress={() => setShowDatePicker(true)}
            onLongPress={() => setDueDate(null)} // กดค้างเพื่อลบเวลาทิ้ง
          >
            <MaterialIcons
              name={dueDate ? "alarm-on" : "add-alarm"}
              size={20}
              color={dueDate ? "#d97706" : isDarkMode ? "#94a3b8" : "#64748b"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
            onPress={toggleLock}
          >
            <MaterialIcons
              name={isLocked ? "lock" : "lock-open"}
              size={20}
              color={isLocked ? "#6366f1" : isDarkMode ? "#94a3b8" : "#64748b"}
            />
          </TouchableOpacity>

          {/* 🌟 ปุ่ม Share (เฉพาะเมื่อมีระบบ) */}
          <TouchableOpacity
            className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
            onPress={() => setShowShareModal(true)}
          >
            <MaterialIcons
              name="person-add"
              size={20}
              color={isDarkMode ? "#94a3b8" : "#64748b"}
            />
          </TouchableOpacity>

          {id && (
            <TouchableOpacity
              className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-rose-50"}`}
              onPress={handleDelete}
            >
              <MaterialIcons
                name="delete-outline"
                size={22}
                color={isDarkMode ? "#f43f5e" : "#e11d48"}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="px-5 h-10 items-center justify-center rounded-full bg-indigo-500"
            onPress={handleSave}
          >
            <Text className="text-white font-bold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🌟 แสดงแบนเนอร์ถ้ามีการตั้งเวลาไว้ */}
      {dueDate && (
        <View
          className={`px-5 py-2 flex-row items-center justify-between ${isDarkMode ? "bg-amber-900/20" : "bg-amber-50"}`}
        >
          <View className="flex-row items-center">
            <MaterialIcons
              name="notifications-active"
              size={16}
              color="#d97706"
            />
            <Text className={`ml-2 text-xs font-semibold text-amber-600`}>
              Reminder set for:{" "}
              {dueDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setDueDate(null)}>
            <MaterialIcons name="close" size={16} color="#d97706" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView className="flex-1 px-5 pt-4">
        <TextInput
          placeholder="Note Title"
          placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
          className={`text-3xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          value={title}
          onChangeText={setTitle}
          multiline
        />
        <TextInput
          placeholder="Start typing your thoughts..."
          placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
          className={`text-base leading-relaxed pb-20 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          style={{ minHeight: 400 }}
        />
      </ScrollView>

      {/* 🌟 หน้าต่างปฏิทินและนาฬิกา */}
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()} // ห้ามตั้งเวลาย้อนหลัง
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {/* Modal PIN (ปล่อยเหมือนเดิม) */}
      <Modal transparent visible={showPinModal} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View
            className={`p-6 rounded-3xl w-full max-w-sm ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
          >
            <View className="items-center mb-4">
              <MaterialIcons
                name="lock-outline"
                size={48}
                color="#6366f1"
                className="mb-2"
              />
              <Text
                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Set Passcode
              </Text>
            </View>
            <TextInput
              secureTextEntry
              keyboardType="number-pad"
              maxLength={4}
              value={tempPin}
              onChangeText={setTempPin}
              autoFocus
              className={`w-full rounded-xl p-4 text-center text-2xl mb-6 ${isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
              style={{ letterSpacing: 8 }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                onPress={() => setShowPinModal(false)}
              >
                <Text
                  className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 items-center rounded-xl bg-indigo-500"
                onPress={() => {
                  setNotePin(tempPin);
                  setIsLocked(true);
                  setShowPinModal(false);
                }}
              >
                <Text className="font-bold text-white">Lock</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal transparent visible={showShareModal} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className={`p-6 rounded-3xl w-full max-w-sm ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
            <View className="items-center mb-4">
              <MaterialIcons name="group-add" size={48} color="#6366f1" className="mb-2" />
              <Text className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Share Note
              </Text>
            </View>

            <TextInput
              value={collabEmail}
              onChangeText={setCollabEmail}
              placeholder="co-worker@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className={`w-full rounded-xl p-4 text-center text-lg mb-4 ${isDarkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                onPress={() => setShowShareModal(false)}
              >
                <Text className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 items-center rounded-xl bg-indigo-500"
                onPress={() => {
                  if (collabEmail.trim()) {
                    setCollaborators([...collaborators, collabEmail.trim()]);
                    setCollabEmail("");
                  }
                }}
              >
                <Text className="font-bold text-white">Add</Text>
              </TouchableOpacity>
            </View>

            {collaborators.length > 0 && (
              <View className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Text className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Shared with:</Text>
                {collaborators.map((email, idx) => (
                  <View key={idx} className="flex-row justify-between items-center mb-1">
                    <Text className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{email}</Text>
                    <TouchableOpacity onPress={() => setCollaborators(collaborators.filter(c => c !== email))}>
                      <MaterialIcons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
