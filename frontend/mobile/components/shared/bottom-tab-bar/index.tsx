import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { BlurView } from "expo-blur";
import { Animated, Dimensions, Platform, StyleSheet } from "react-native";
import { Icon } from "@/components/ui/icon";
import {
  CalendarDays,
  FileHeart,
  Home,
  LucideIcon,
  Menu,
  ShieldCheck,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef } from "react";

interface TabItem {
  name: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

const tabItems: TabItem[] = [
  {
    name: "index",
    label: "Home",
    path: "index",
    icon: Home,
  },
  {
    name: "medical-history",
    label: "History",
    path: "medical-history",
    icon: FileHeart,
  },
  {
    name: "appointments",
    label: "Visits",
    path: "appointments",
    icon: CalendarDays,
  },
  {
    name: "benefits",
    label: "Benefits",
    path: "benefits",
    icon: ShieldCheck,
  },
  {
    name: "more",
    label: "More",
    path: "more",
    icon: Menu,
  },
];

function LiquidTabItem({
  item,
  isActive,
  onPress,
}: {
  item: TabItem;
  isActive: boolean;
  onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [isActive, progress]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.04],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  return (
    <Pressable
      key={item.name}
      className="flex-1 items-center justify-center"
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale }, { translateY }],
        }}
        className="h-[58px] min-w-[58px] items-center justify-center rounded-[24px] px-2"
      >
        <Icon
          as={item.icon}
          size="lg"
          className={`${isActive ? "text-primary-800" : "text-background-500"}`}
        />
        <Text
          size="xs"
          className={`mt-1 font-medium ${
            isActive ? "text-primary-800" : "text-background-500"
          }`}
        >
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 16;
  const tabWidth = useMemo(
    () => (screenWidth - horizontalPadding * 2) / tabItems.length,
    [screenWidth]
  );
  const activeIndex = Math.max(
    0,
    tabItems.findIndex(
      (item) => props.state.routeNames[props.state.index] === item.path
    )
  );
  const activePosition = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.spring(activePosition, {
      toValue: activeIndex,
      useNativeDriver: true,
      friction: 9,
      tension: 85,
    }).start();
  }, [activeIndex, activePosition]);

  const translateX = activePosition.interpolate({
    inputRange: tabItems.map((_, index) => index),
    outputRange: tabItems.map((_, index) => index * tabWidth),
  });

  return (
    <Box className="bg-transparent px-3 pb-2">
      <HStack
        className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white/70 pt-3 px-4 min-h-[82px]"
        style={{
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
          boxShadow: "0px -18px 34px 0px rgba(37, 99, 235, 0.14)",
        }}
        space="xs"
      >
        <BlurView
          intensity={42}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={{
            width: tabWidth - 8,
            transform: [{ translateX }],
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22,
            shadowRadius: 18,
            elevation: 5,
          }}
          className="absolute left-4 top-3 h-[58px] rounded-[26px] border border-white/80 bg-primary-0/80"
        >
          <Box className="absolute left-2 top-1 h-4 w-10 rounded-full bg-white/80" />
        </Animated.View>
        {tabItems.map((item) => {
          const isActive =
            props.state.routeNames[props.state.index] === item.path;
          return (
            <LiquidTabItem
              key={item.name}
              item={item}
              isActive={isActive}
              onPress={() => {
                props.navigation.navigate(item.path);
              }}
            />
          );
        })}
      </HStack>
    </Box>
  );
}

export default BottomTabBar;
