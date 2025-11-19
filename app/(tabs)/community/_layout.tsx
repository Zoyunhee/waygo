// app/(tabs)/community/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function CommunityLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="post" />
            <Stack.Screen name="write" />
            <Stack.Screen name="comments" />
            <Stack.Screen name="search" />
        </Stack>
    );
}