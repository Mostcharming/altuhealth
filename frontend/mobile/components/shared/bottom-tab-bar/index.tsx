import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Platform } from "react-native";
import { Icon } from "@/components/ui/icon";
import {
  CalendarDays,
  FileHeart,
  Home,
  LucideIcon,
  Menu,
  ShieldCheck,
} from "lucide-react-native";

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

function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box className="bg-background-0">
      <HStack
        className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[78px]"
        style={{
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
          boxShadow: "0px -10px 12px 0px rgba(0, 0, 0, 0.04)",
        }}
        space="md"
      >
        {tabItems.map((item) => {
          const isActive =
            props.state.routeNames[props.state.index] === item.path;
          return (
            <Pressable
              key={item.name}
              className="flex-1 items-center justify-center"
              onPress={() => {
                props.navigation.navigate(item.path);
              }}
            >
              <Icon
                as={item.icon}
                size="xl"
                className={`${
                  isActive ? "text-primary-800" : "text-background-500"
                }`}
              />
              <Text
                size="xs"
                className={`mt-1 font-medium ${
                  isActive ? "text-primary-800" : "text-background-500"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

export default BottomTabBar;
