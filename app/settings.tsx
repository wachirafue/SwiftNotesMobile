import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNav from "../components/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as ImagePicker from "expo-image-picker";
import { auth, isFirebaseConfigured, db } from "../firebaseConfig";
import { updateProfile, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAppContext } from "../context/AppProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfilePic, setUserProfilePic } = useAppContext();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const defaultName = auth?.currentUser?.displayName || "Alex Johnson";
  const email = auth?.currentUser?.email || "alex.johnson@example.com";

  const [isBioAuthEnabled, setIsBioAuthEnabled] = useState(false);
  const [displayName, setDisplayName] = useState(defaultName);

  const [showEditName, setShowEditName] = useState(false);
  const [tempName, setTempName] = useState(displayName);

  useEffect(() => {
    AsyncStorage.getItem("@swiftnotes_bioauth").then((val) => {
      if (val === "true") setIsBioAuthEnabled(true);
    });
  }, []);

  const handleToggleFaceID = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Not Supported", "Biometrics not available or not set up on this device.");
      return;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: isBioAuthEnabled ? "Authenticate to disable Security" : "Authenticate to enable Security",
    });

    if (success) {
      const newValue = !isBioAuthEnabled;
      setIsBioAuthEnabled(newValue);
      AsyncStorage.setItem("@swiftnotes_bioauth", newValue ? "true" : "false");
    }
  };

  const handleSignOut = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Sign out error", error);
      }
    }
    router.replace("/login");
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      if (isFirebaseConfigured && auth?.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: tempName.trim() });
          setDisplayName(tempName.trim());
          if (db) {
            await setDoc(doc(db, "users", auth.currentUser.uid), { displayName: tempName.trim() }, { merge: true });
          }
        } catch (e) {
          Alert.alert("Error", "Could not update name.");
        }
      } else {
        setDisplayName(tempName.trim());
      }
    }
    setShowEditName(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "We need camera roll permissions to change your picture!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUserProfilePic(base64Image);

      if (isFirebaseConfigured && auth?.currentUser) {
        try {
          if (db) {
            await setDoc(doc(db, "users", auth.currentUser.uid), { photoURL: base64Image }, { merge: true });
          }
        } catch (e) {
          console.error(e);
          Alert.alert("Error", "Could not upload profile picture to cloud.");
        }
      } else {
        AsyncStorage.setItem("@swiftnotes_profile_pic", base64Image);
      }
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          className={`w-10 h-10 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/dashboard")
          }
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#f1f5f9" : "#334155"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Settings
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pb-24">
        {/* Profile Section */}
        <View className="mt-4 mb-8 items-center">
          <View className="relative">
            <View
              className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-lg ${isDarkMode ? "border-slate-800" : "border-slate-50"}`}
            >
              <Image
                source={{ uri: userProfilePic }}
                className="w-full h-full"
              />
            </View>
            <TouchableOpacity
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-500 items-center justify-center border-2 ${isDarkMode ? "border-slate-950" : "border-white"}`}
              onPress={handlePickImage}
            >
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text
            className={`mt-3 text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            {displayName}
          </Text>
          <Text
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            {email}
          </Text>
        </View>

        {/* Account & Preference */}
        <View className="mb-6">
          <Text
            className={`px-2 mb-2 text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Account & Preference
          </Text>
          <View
            className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"}`}
          >
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? "border-slate-800" : "border-white"}`}
              onPress={() => setShowEditName(true)}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"}`}
                >
                  <MaterialIcons
                    name="person"
                    size={20}
                    color={isDarkMode ? "#60a5fa" : "#2563eb"}
                  />
                </View>
                <Text
                  className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                >
                  Personal Information
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDarkMode ? "#475569" : "#cbd5e1"}
              />
            </TouchableOpacity>

            <View
              className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? "border-slate-800" : "border-white"}`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDarkMode ? "bg-amber-900/30" : "bg-amber-100"}`}
                >
                  <MaterialIcons
                    name="dark-mode"
                    size={20}
                    color={isDarkMode ? "#fbbf24" : "#d97706"}
                  />
                </View>
                <Text
                  className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleColorScheme}
                trackColor={{ false: "#cbd5e1", true: "#6366f1" }}
              />
            </View>

            <TouchableOpacity 
              className="flex-row items-center justify-between p-4"
              onPress={() => Linking.openSettings()}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDarkMode ? "bg-rose-900/30" : "bg-rose-100"}`}
                >
                  <MaterialIcons
                    name="notifications"
                    size={20}
                    color={isDarkMode ? "#fb7185" : "#e11d48"}
                  />
                </View>
                <Text
                  className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                >
                  Notifications
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDarkMode ? "#475569" : "#cbd5e1"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & Storage */}
        <View className="mb-6">
          <Text
            className={`px-2 mb-2 text-xs font-bold uppercase tracking-widest ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}
          >
            Security & Storage
          </Text>
          <View
            className={`rounded-2xl border overflow-hidden ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-100"}`}
          >
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? "border-slate-800" : "border-white"}`}
              onPress={handleToggleFaceID}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDarkMode ? "bg-emerald-900/30" : "bg-emerald-100"}`}
                >
                  <MaterialIcons
                    name="fingerprint"
                    size={20}
                    color={isDarkMode ? "#34d399" : "#059669"}
                  />
                </View>
                <View>
                  <Text
                    className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    FaceID & Passcode
                  </Text>
                  <Text
                    className={`text-[10px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {isBioAuthEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isBioAuthEnabled}
                onValueChange={handleToggleFaceID}
                trackColor={{ false: "#cbd5e1", true: "#10b981" }}
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View
                  className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${isDarkMode ? "bg-indigo-900/30" : "bg-indigo-100"}`}
                >
                  <MaterialIcons
                    name="cloud-sync"
                    size={20}
                    color={isDarkMode ? "#818cf8" : "#4f46e5"}
                  />
                </View>
                <View>
                  <Text
                    className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Cloud Sync Status
                  </Text>
                  <Text 
                    className={`text-[10px] font-semibold uppercase ${isFirebaseConfigured && auth?.currentUser ? "text-emerald-500" : "text-amber-500"}`}
                  >
                    {isFirebaseConfigured && auth?.currentUser ? "SYNCED" : "OFFLINE MOCK MODE"}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={isDarkMode ? "#475569" : "#cbd5e1"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className={`w-full py-4 rounded-2xl mt-4 items-center border ${isDarkMode ? "bg-rose-950/40 border-rose-900/50" : "bg-rose-50 border-rose-100"}`}
          onPress={handleSignOut}
        >
          <Text
            className={`font-bold text-lg ${isDarkMode ? "text-rose-400" : "text-rose-600"}`}
          >
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text
          className={`text-center text-[10px] pb-10 mt-4 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}
        >
          Version 2.4.0 (Build 108)
        </Text>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal transparent visible={showEditName} animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View
            className={`p-6 rounded-3xl w-full max-w-sm ${isDarkMode ? "bg-slate-900" : "bg-white"}`}
          >
            <View className="items-center mb-6">
              <MaterialIcons
                name="person"
                size={48}
                color="#6366f1"
                className="mb-2"
              />
              <Text
                className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Personal Information
              </Text>
            </View>

            <Text className={`text-sm mb-2 font-medium ml-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Display Name</Text>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              className={`w-full rounded-xl p-4 text-lg mb-6 border ${isDarkMode ? "bg-slate-800 text-white border-slate-700" : "bg-slate-50 text-slate-900 border-slate-200"}`}
              placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 items-center rounded-xl ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
                onPress={() => setShowEditName(false)}
              >
                <Text
                  className={`font-bold ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 items-center rounded-xl bg-indigo-500"
                onPress={handleSaveName}
              >
                <Text className="font-bold text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}
