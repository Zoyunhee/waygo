// app/join.tsx
import { useRef, useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TextInput, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 사용
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import ErrorDialog from "../components/ErrorDialog";

export default function Join() {
    const router = useRouter();

    // form states
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");

    // errors
    const [errUser, setErrUser] = useState<string | undefined>();
    const [errPw, setErrPw] = useState<string | undefined>();
    const [errPw2, setErrPw2] = useState<string | undefined>();
    const [errNick, setErrNick] = useState<string | undefined>();

    // dialog
    const [showCodeError, setShowCodeError] = useState(false);
    const codeRef = useRef<TextInput>(null);

    // ▼ 정규식: 아이디(영문+숫자 모두 포함), 비밀번호(대/소문자+숫자+특수문자)
    const ID_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/;
    const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}\[\]|\\:;"'<>,.?/]).{8,16}$/;

    // 버튼 눌렀을 때만 검사
    const validate = () => {
        let ok = true;
        setErrUser(undefined);
        setErrPw(undefined);
        setErrPw2(undefined);
        setErrNick(undefined);

        const uid = username.trim();
        const nick = nickname.trim();

        if (!ID_REGEX.test(uid)) {
            setErrUser("* 4 - 20자, 영문 + 숫자 조합으로 입력하세요");
            ok = false;
        }
        if (!PW_REGEX.test(password)) {
            setErrPw("* 8 - 16자, 영문 대소문자, 숫자, 특수문자 포함하세요");
            ok = false;
        }
        if (password2 !== password) {
            setErrPw2("* 비밀번호를 확인하세요");
            ok = false;
        }
        if (nick.length < 2 || nick.length > 10) {
            setErrNick("* 2 - 10자 닉네임");
            ok = false;
        }
        return ok;
    };

    const sendCode = async () => {
        // TODO: 이메일 인증코드 발송 API
        // await api.sendVerifyCode(email)
        codeRef.current?.focus();
    };

    const checkCode = async () => {
        // TODO: 실제 검증 API
        const isValid = code === "123456"; // 데모: 틀리면 다이얼로그
        if (!isValid) {
            setShowCodeError(true);
            return;
        }
    };

    const createAccount = async () => {
        if (!validate()) return;
        // TODO: 회원가입 API 호출
        router.replace("/login");
    };

    return (
        <>
            {/* 네이티브 헤더 숨김 → 화면 안에서 커스텀 헤더 */}
            <Stack.Screen options={{ headerShown: false }} />

            {/* top 포함: 상단 안전영역까지 컨트롤 */}
            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                {/* 커스텀 헤더 */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>회원가입</Text>
                    {/* 우측 공간 맞춤용 더미 */}
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="automatic"
                    >
                        {/* 상단 타이틀은 헤더에서 표시하므로 여기서는 제거해도 됨 */}
                        {/* <Text style={styles.title}>회원가입</Text> */}

                        <AppInput
                            label="아이디 *"
                            placeholder="4 - 20자, 영문 + 숫자만 사용"
                            value={username}
                            onChangeText={setUsername}
                            errorText={errUser}
                            autoCapitalize="none"
                        />

                        <AppInput
                            label="비밀번호 *"
                            placeholder="8 - 16자, 영문 대소문자, 숫자, 특수문자"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            errorText={errPw}
                        />

                        <AppInput
                            label="비밀번호 확인 *"
                            placeholder="8 - 16자, 영문 대소문자, 숫자, 특수문자"
                            secureTextEntry
                            value={password2}
                            onChangeText={setPassword2}
                            errorText={errPw2}
                        />

                        <AppInput
                            label="닉네임 *"
                            placeholder="2 - 10자"
                            value={nickname}
                            onChangeText={setNickname}
                            errorText={errNick}
                        />

                        <Text style={styles.sectionLabel}>이메일 본인 인증 *</Text>
                        <AppInput
                            placeholder="이메일 입력"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <AppButton title="인증코드 전송하기" onPress={sendCode} style={{ marginBottom: 8 }} />

                        <AppInput
                            ref={codeRef}
                            placeholder="인증코드 입력"
                            value={code}
                            onChangeText={setCode}
                            keyboardType="number-pad"
                        />
                        <AppButton title="인증코드 확인하기" onPress={checkCode} variant="ghost" />

                        <AppButton title="계정 생성" onPress={createAccount} style={{ marginTop: 20 }} />
                    </ScrollView>

                    <ErrorDialog visible={showCodeError} onClose={() => setShowCodeError(false)} />
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

    container: { padding: 20, paddingBottom: 40, backgroundColor: "#fff" },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
    sectionLabel: { fontSize: 14, color: "#111", marginTop: 6, marginBottom: 6, fontWeight: "600" },
});
