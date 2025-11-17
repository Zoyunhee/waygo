// app/profile-edit.tsx
import { View, StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppButton from "@/components/AppButton";

export default function ProfileEdit() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>정보 수정</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.container}>
                    <AppButton
                        title="닉네임 수정"
                        onPress={() => router.push("/(tabs)/mypage/nameedit")}
                        style={styles.menuButton}
                    />
                    <AppButton
                        title="비밀번호 수정"
                        onPress={() => router.push("/(tabs)/mypage/passwordedit")}
                        style={styles.menuButton}
                    />
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 48,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#E5E5EA",
    },
    backBtn: {
        width: 32,
        height: 32,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: "800",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        backgroundColor: "#fff",
    },
    menuButton: {
        height: 52,
        marginBottom: 16,
    },
});
