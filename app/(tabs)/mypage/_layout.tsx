// app/(tabs)/mypage/_layout.tsx
import { Stack } from "expo-router";

export default function MyPageLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="ProfileEdit" />
            <Stack.Screen name="InfoEdit" />
            <Stack.Screen name="NameEdit" />
            <Stack.Screen name="PasswordEdit" />
        </Stack>
    );
}
