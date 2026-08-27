import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, isFirebaseConfigured } from "../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      setProfilePic(base64Image);
    }
  };

  const handleForgotPassword = async () => {
    if (isFirebaseConfigured && auth) {
      if (!email.trim()) {
        Alert.alert("Email Required", "Please enter your email address in the field above to reset your password.");
        return;
      }
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        Alert.alert("Success", "Password reset email sent! Please check your inbox.");
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Mock Mode", "Password reset is not available in mock mode.");
    }
  };

  const handleLogin = async () => {
    if (isFirebaseConfigured && auth) {
      if (!email.trim() || !password) {
        Alert.alert("Error", "Please enter both email and password");
        return;
      }
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.replace("/dashboard");
      } catch (error: any) {
        Alert.alert("Login Failed", error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for Mock Mode
      router.replace("/dashboard");
    }
  };

  const handleRegister = async () => {
    if (isFirebaseConfigured && auth) {
      if (!email.trim() || !password || !displayName.trim()) {
        Alert.alert("Error", "Please enter your name, email, and password to register");
        return;
      }
      setIsLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: displayName.trim(),
          photoURL: null,
        });

        if (db) {
          await setDoc(doc(db, "users", user.uid), {
            displayName: displayName.trim(),
            email: email.trim(),
            photoURL: profilePic || null,
            createdAt: new Date().toISOString()
          });
        }

        Alert.alert("Success", "Account created successfully!");
        router.replace("/dashboard");
      } catch (error: any) {
        Alert.alert("Registration Failed", error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 p-6 relative justify-center ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Background Blobs (ทำให้อ่อนลงในโหมดมืด) */}
      <View
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${isDarkMode ? "bg-indigo-500/5" : "bg-indigo-500/10"}`}
      />
      <View
        className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full ${isDarkMode ? "bg-indigo-500/5" : "bg-indigo-500/5"}`}
      />

      <View className="w-full max-w-[400px] self-center z-10">
        {/* Logo or Profile Picker */}
        {isRegistering ? (
          <View className="items-center mb-6 mt-4">
            <TouchableOpacity onPress={handlePickImage} className="relative">
              <View className={`w-20 h-20 rounded-full overflow-hidden border-4 ${isDarkMode ? "border-slate-800" : "border-slate-50"} items-center justify-center bg-slate-200`}>
                {profilePic ? (
                  <Image source={{ uri: profilePic }} className="w-full h-full" />
                ) : (
                  <MaterialIcons name="person" size={40} color="#94a3b8" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-500 items-center justify-center border-2 border-white">
                <MaterialIcons name="camera-alt" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="self-center mb-8 items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
            <MaterialIcons name="edit-note" size={36} color="white" />
          </View>
        )}

        {/* Text Header */}
        <View className="items-center mb-10">
          <Text
            className={`text-3xl font-bold tracking-tight mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
          >
            {isRegistering ? "Create Account" : "Welcome Back"}
          </Text>
          <Text className={isDarkMode ? "text-slate-400" : "text-slate-500"}>
            {isRegistering ? "Join SwiftNotes today." : "Capture your thoughts, anywhere."}
          </Text>
        </View>

        {/* Form Area */}
        <View className="w-full">
          {isRegistering && (
            <View className="mb-4">
              <Text
                className={`text-sm font-medium ml-1 mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}
              >
                Full Name
              </Text>
              <TextInput
                className={`w-full h-14 px-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                placeholder="Alex Johnson"
                placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
          )}

          <View className="mb-4">
            <Text
              className={`text-sm font-medium ml-1 mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}
            >
              Email Address
            </Text>
            <TextInput
              className={`w-full h-14 px-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
              placeholder="name@company.com"
              placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-2">
            <Text
              className={`text-sm font-medium ml-1 mb-2 ${isDarkMode ? "text-slate-400" : "text-slate-700"}`}
            >
              Password
            </Text>
            <View className="relative justify-center">
              <TextInput
                className={`w-full h-14 px-4 rounded-xl border pr-12 ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                className="absolute right-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={24}
                  color={isDarkMode ? "#64748b" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-end mb-6">
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text
                className={`text-sm font-medium ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className={`w-full h-14 rounded-xl items-center justify-center mb-8 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-500'}`}
            onPress={isRegistering ? handleRegister : handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white font-semibold text-lg">{isLoading ? "Loading..." : (isRegistering ? "Sign Up" : "Sign In")}</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View
            className={`flex-1 h-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
          />
          <Text
            className={`mx-4 text-xs font-semibold uppercase tracking-widest ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}
          >
            or continue with
          </Text>
          <View
            className={`flex-1 h-[1px] ${isDarkMode ? "bg-slate-800" : "bg-slate-200"}`}
          />
        </View>

        {/* Social Buttons */}
        <View className="flex-row justify-between gap-4">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center h-14 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <Text
              className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center h-14 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
          >
            <MaterialIcons
              name="apple"
              size={20}
              color={isDarkMode ? "white" : "#0f172a"}
              style={{ marginRight: 8 }}
            />
            <Text
              className={`font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Apple
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create Account Toggle */}
        <View className="flex-row justify-center mt-10">
          <Text
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text
              className={`font-semibold text-sm ${isDarkMode ? "text-indigo-400" : "text-indigo-500"}`}
            >
              {isRegistering ? "Sign In" : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
