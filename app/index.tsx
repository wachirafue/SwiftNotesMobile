import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem("@swiftnotes_has_seen_onboarding");
        setTimeout(() => {
          if (hasSeenOnboarding === "true") {
            router.replace("/login");
          } else {
            router.replace("/onboarding");
          }
        }, 2000);
      } catch (e) {
        setTimeout(() => {
          router.replace("/onboarding");
        }, 2000);
      }
    };

    checkOnboarding();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center relative">
      {/* Background */}
      <View className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full" />
      <View className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full" />

      <View className="flex-1 items-center justify-center w-full px-6 z-10">
        <View className="items-center justify-center mb-8">
          <View className="w-24 h-24 bg-indigo-500 rounded-3xl items-center justify-center shadow-lg">
            <Text className="text-white text-4xl font-bold">SN</Text>
          </View>
        </View>

        <View className="items-center">
          <Text className="text-slate-900 text-4xl font-bold mb-2">
            SwiftNotes
          </Text>
          <Text className="text-slate-500 text-base font-medium">
            Personal & Professional Note-taking
          </Text>
        </View>
      </View>

      <View className="w-full pb-12 items-center z-10">
        <Text className="text-slate-600 text-sm font-medium mb-4">
          Preparing your workspace...
        </Text>
        <View className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <View className="h-full bg-indigo-500 w-1/3 rounded-full" />
        </View>
        <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase mt-8">
          Secured & Synced
        </Text>
      </View>
    </SafeAreaView>
  );
}
