// app/login.tsx
import { useRef, useState } from "react";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    Text,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | undefined>();
    const pwRef = useRef<TextInput>(null);

    const onSubmit = async () => {
        if (loading) return;
        setErrorText(undefined);
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 500));
            const ok = username.trim().length > 0 && password.trim().length > 0;
            if (ok) {
                router.replace("/(tabs)"); // ← 홈 탭으로 이동
            } else {
                setErrorText("아이디 비밀번호가 틀렸습니다 다시 입력하세요");
            }
        } catch {
            setErrorText("아이디 비밀번호가 틀렸습니다 다시 입력하세요");
        } finally {
            setLoading(false);
        }
    };

    const goJoin = () => router.push("/join");

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>로그인</Text>
                    <View style={{ width: 24 }} />
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                        <View style={styles.container}>
                            <Text style={styles.logo}>WayGo</Text>

                            <AppInput
                                placeholder="아이디"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                onSubmitEditing={() => pwRef.current?.focus()}
                                style={styles.input}
                            />

                            <AppInput
                                ref={pwRef}
                                placeholder="비밀번호"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                returnKeyType="done"
                                onSubmitEditing={onSubmit}
                                style={styles.input}
                            />

                            {errorText ? <Text style={styles.error}>{errorText}</Text> : <View style={{ height: 4 }} />}

                            {/* loading prop 제거 → 타입 에러 해결 */}
                            <AppButton
                                title={loading ? "처리 중..." : "계속"}
                                onPress={onSubmit}
                                disabled={loading}
                                style={styles.cta}
                            />

                            <View style={styles.dividerWrap}>
                                <View style={styles.divider} />
                                <Text style={styles.orText}>또는</Text>
                                <View style={styles.divider} />
                            </View>

                            <AppButton title="회원가입 하러 가기" onPress={goJoin} variant="ghost" style={styles.signupBtn} />
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
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
        backgroundColor: "#fff",
    },
    backBtn: { width: 32, height: 32, justifyContent: "center", alignItems: "center", marginRight: 4 },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: "800" },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 36, backgroundColor: "#fff" },
    logo: { fontSize: 44, fontWeight: "900", alignSelf: "center", marginBottom: 28 },
    input: { height: 44, marginBottom: 10 },
    error: { color: "#E53935", fontSize: 13, marginTop: 2, marginBottom: 8, paddingHorizontal: 4 },
    cta: { height: 44 },
    dividerWrap: { flexDirection: "row", alignItems: "center", marginTop: 26, marginBottom: 12, paddingHorizontal: 4 },
    divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#E6E6E6" },
    orText: { marginHorizontal: 12, color: "#9E9E9E", fontSize: 12 },
    signupBtn: { height: 44 },
});
