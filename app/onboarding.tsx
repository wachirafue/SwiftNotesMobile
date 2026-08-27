import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ONBOARDING_DATA = [
  {
    id: "1",
    title: "Capture Your Thoughts",
    description: "Write down your ideas seamlessly with a clean, fast, and simple editor.",
    icon: "edit-note",
    color: "bg-indigo-500",
  },
  {
    id: "2",
    title: "Stay Organized",
    description: "Group your notes into custom folders to keep everything structured.",
    icon: "folder",
    color: "bg-emerald-500",
  },
  {
    id: "3",
    title: "Collaborate Together",
    description: "Share notes with friends and co-workers in real-time.",
    icon: "people",
    color: "bg-amber-500",
  },
  {
    id: "4",
    title: "Secure & Private",
    description: "Lock your most intimate notes with a PIN or FaceID.",
    icon: "lock",
    color: "bg-rose-500",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem("@swiftnotes_has_seen_onboarding", "true");
      router.replace("/login");
    } catch (error) {
      console.error("Error saving onboarding state", error);
      router.replace("/login");
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 relative ${isDarkMode ? "bg-slate-950" : "bg-white"}`}
    >
      {/* Skip Button */}
      <View className="w-full flex-row justify-end p-6 z-10">
        <TouchableOpacity onPress={handleFinish}>
          <Text
            className={`font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {ONBOARDING_DATA.map((item, index) => (
          <View
            key={item.id}
            style={{ width }}
            className="flex-1 items-center justify-center px-8 pb-20"
          >
            {/* Icon Circle */}
            <View
              className={`w-40 h-40 rounded-full mb-12 items-center justify-center shadow-2xl ${item.color} shadow-${item.color.split('-')[1]}-500/30`}
            >
              <MaterialIcons name={item.icon as any} size={72} color="white" />
            </View>

            {/* Text Content */}
            <Text
              className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              {item.title}
            </Text>
            <Text
              className={`text-base text-center leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {item.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Footer Controls */}
      <View className="absolute bottom-0 w-full px-8 pb-12 items-center">
        {/* Pagination Dots */}
        <View className="flex-row gap-2 mb-8">
          {ONBOARDING_DATA.map((_, dotIndex) => {
            const isActive = dotIndex === currentIndex;
            return (
              <View
                key={dotIndex}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-8 bg-indigo-500"
                    : isDarkMode
                    ? "w-2 bg-slate-800"
                    : "w-2 bg-slate-200"
                }`}
              />
            );
          })}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          className="w-full h-14 bg-indigo-500 rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/20"
        >
          <Text className="text-white font-bold text-lg">
            {currentIndex === ONBOARDING_DATA.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
