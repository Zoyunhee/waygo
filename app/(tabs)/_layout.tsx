// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

// 진동(햅틱) 피드백이 들어간 탭 버튼
import { HapticTab } from '@/components/haptic-tab';

// 아이콘 심볼 (탭 아이콘)
import { IconSymbol } from '@/components/ui/icon-symbol';

// 테마 색상
import { Colors } from '@/constants/theme';

// 현재 다크모드/라이트모드 상태
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const tint = Colors[colorScheme ?? 'light'].tint;

    return (
        <Tabs
            // ✅ 앱 실행 시 처음 표시될 탭
            initialRouteName="home/index"

            // ✅ 모든 탭 공통 옵션
            screenOptions={{
                headerShown: false, // 상단 헤더 숨김
                tabBarActiveTintColor: tint, // 활성 탭 색상
                tabBarButton: HapticTab, // 햅틱 탭 버튼
            }}
        >
            {/* ✅ 현재 존재하는 홈 탭만 등록 */}
            <Tabs.Screen
                name="home/index"
                options={{
                    title: 'Home',
                    // ✅ 홈이 포커스일 때 기본 탭바를 숨김
                    tabBarStyle: { display: 'none' },
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />

            {/* ⚠️ 다른 탭은 나중에 파일 만든 뒤에 추가 */}

            {/* (남아있다면) index 탭 숨기기 */}
            <Tabs.Screen name="index" options={{ href: null }} />
        </Tabs>
    );
}
