import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const tint = Colors[colorScheme ?? "light"].tint;

    return (
        <Tabs
            initialRouteName="home/index"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: tint,
                tabBarButton: HapticTab,
                tabBarStyle: { display: "none" }, //기본탭바 감추기
            }}
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}

            />

            {/* 필요하면 translate 관련 탭들을 명시적으로 추가해도 됨 */}
            {/* <Tabs.Screen name="translate/index" options={{ href: "/(tabs)/translate/index" }} /> */}

            {/* 루트 index 탭 숨기기 */}
            <Tabs.Screen name="index" options={{ href: null }} />
        </Tabs>
    );
}
