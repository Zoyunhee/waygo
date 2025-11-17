// app/profile-edit-nick.tsx
import { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppInput from "@/components/AppInput";
import AppButton from "@/components/AppButton";

export default function ProfileEditNick() {
    const router = useRouter();

    const [nickname, setNickname] = useState("");
    const [errNick, setErrNick] = useState<string | undefined>();

    // 2~10자 검증 + (데모용) 중복 체크
    const validate = () => {
        const nick = nickname.trim();
        setErrNick(undefined);

        if (nick.length < 2 || nick.length > 10) {
            setErrNick("* 2 - 10자 닉네임");
            return false;
        }

        // TODO: 중복 체크 API 호출
        if (nick === "taken") {
            setErrNick("* 중복된 닉네임입니다");
            return false;
        }

        return true;
    };

    const onSubmit = async () => {
        const ok = validate();
        if (!ok) return;

        // TODO: 닉네임 수정 API 호출
        router.back();
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>닉네임 수정</Text>
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                    >
                        <AppInput
                            label="닉네임 *"
                            placeholder="2 - 10자"
                            value={nickname}
                            onChangeText={(t) => {
                                setNickname(t);
                                setErrNick(undefined);
                            }}
                            errorText={errNick}
                        />

                        <AppButton title="완료" onPress={onSubmit} style={{ marginTop: 24 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
        backgroundColor: "#fff",
    },
});
