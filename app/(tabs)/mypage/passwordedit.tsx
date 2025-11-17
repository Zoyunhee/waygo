// app/profile-edit-pw.tsx
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

export default function ProfileEditPw() {
    const router = useRouter();

    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [errPw, setErrPw] = useState<string | undefined>();
    const [errPw2, setErrPw2] = useState<string | undefined>();

    const PW_REGEX =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}\[\]|\\:;"'<>,.?/]).{8,16}$/;

    const validate = () => {
        let ok = true;
        setErrPw(undefined);
        setErrPw2(undefined);

        if (!PW_REGEX.test(pw)) {
            setErrPw("* 8 - 16자, 영문 대소문자, 숫자, 특수문자 포함하세요");
            ok = false;
        }
        if (pw2 !== pw) {
            setErrPw2("* 비밀번호를 확인하세요");
            ok = false;
        }

        return ok;
    };

    const onSubmit = async () => {
        const ok = validate();
        if (!ok) return;

        // TODO: 비밀번호 수정 API 호출
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
                    <Text style={styles.headerTitle}>비밀번호 수정</Text>
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
                            label="새 비밀번호 *"
                            placeholder="8 - 16자, 영문 대소문자, 숫자, 특수문자 포함"
                            secureTextEntry
                            value={pw}
                            onChangeText={(t) => {
                                setPw(t);
                                setErrPw(undefined);
                            }}
                            errorText={errPw}
                        />

                        <AppInput
                            label="새 비밀번호 확인 *"
                            placeholder="8 - 16자, 영문 대소문자, 숫자, 특수문자 포함"
                            secureTextEntry
                            value={pw2}
                            onChangeText={(t) => {
                                setPw2(t);
                                setErrPw2(undefined);
                            }}
                            errorText={errPw2}
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
