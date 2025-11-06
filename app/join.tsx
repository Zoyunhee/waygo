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
    const [errEmail, setErrEmail] = useState<string | undefined>();
    const [errCode, setErrCode] = useState<string | undefined>();

    // dialog
    const [showCodeError, setShowCodeError] = useState(false);
    const codeRef = useRef<TextInput>(null);

    // 이메일 인증 상태
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);

    // ▼ 정규식: 아이디/비밀번호/이메일
    const ID_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/;
    const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}\[\]|\\:;"'<>,.?/]).{8,16}$/;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validate = () => {
        let ok = true;
        setErrUser(undefined);
        setErrPw(undefined);
        setErrPw2(undefined);
        setErrNick(undefined);
        setErrEmail(undefined);

        const uid = username.trim();
        const nick = nickname.trim();
        const mail = email.trim();

        if (!ID_REGEX.test(uid)) { setErrUser("* 4 - 20자, 영문 + 숫자 조합으로 입력하세요"); ok = false; }
        if (!PW_REGEX.test(password)) { setErrPw("* 8 - 16자, 영문 대소문자, 숫자, 특수문자 포함하세요"); ok = false; }
        if (password2 !== password) { setErrPw2("* 비밀번호를 확인하세요"); ok = false; }
        if (nick.length < 2 || nick.length > 10) { setErrNick("* 2 - 10자 닉네임"); ok = false; }
        if (!EMAIL_REGEX.test(mail)) { setErrEmail("* 올바른 이메일 형식을 입력하세요"); ok = false; }
        return ok;
    };

    const sendCode = async () => {
        setErrEmail(undefined);
        if (!EMAIL_REGEX.test(email.trim())) {
            setErrEmail("* 올바른 이메일 형식을 입력하세요");
            return;
        }
        // TODO: 이메일 인증코드 발송 API
        setIsCodeSent(true);
        setIsCodeVerified(false);
        setErrCode(undefined);
        codeRef.current?.focus();
    };

    const checkCode = async () => {
        // TODO: 실제 검증 API
        const isValid = code === "123456"; // demo
        if (!isValid) {
            setIsCodeVerified(false);
            setErrCode("* 인증코드가 일치하지 않습니다");
            setShowCodeError(true);
            return;
        }
        setIsCodeVerified(true);
        setErrCode(undefined);
    };

    const createAccount = async () => {
        const ok = validate();
        if (!ok) return;

        if (!isCodeVerified) {
            setErrCode("* 이메일 인증을 완료하세요");
            codeRef.current?.focus();
            return;
        }

        // TODO: 회원가입 API 호출
        router.replace("/login");
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
                {/* 커스텀 헤더 */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>회원가입</Text>
                    <View style={{ width: 24 }} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                        contentInsetAdjustmentBehavior="automatic"
                    >
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
                            onChangeText={(t) => {
                                setEmail(t);
                                setErrEmail(undefined);
                            }}
                            errorText={errEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        {/* ✅ 회색 배경 + 검정 텍스트 (AppButton 수정 없이 구현) */}
                        <View style={styles.grayWrapWithMargin}>
                            <AppButton
                                title={isCodeSent ? "인증코드 다시 전송하기" : "인증코드 전송하기"}
                                onPress={sendCode}
                                // AppButton은 투명(ghost)로, 텍스트는 컴포넌트 기본색(대개 검정)
                                variant="ghost"
                                style={styles.ghostFill}
                            />
                        </View>

                        <AppInput
                            ref={codeRef}
                            placeholder="인증코드 입력"
                            value={code}
                            onChangeText={(t) => {
                                setCode(t);
                                setErrCode(undefined);
                            }}
                            keyboardType="number-pad"
                            editable={!isCodeVerified}
                            errorText={errCode}
                        />

                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                            <View style={[styles.grayWrap, { flex: 1 }]}>
                                <AppButton
                                    title={isCodeVerified ? "인증 완료" : "인증코드 확인하기"}
                                    onPress={checkCode}
                                    disabled={isCodeVerified}
                                    variant="ghost"
                                    style={styles.ghostFill}
                                />
                            </View>
                            {isCodeVerified && <Text style={styles.verifiedText}>이메일 인증이 완료되었습니다</Text>}
                        </View>

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

    verifiedText: {
        marginLeft: 10,
        fontSize: 12,
        color: "#2e7d32",
        fontWeight: "600",
    },

    // ✅ 회색 버튼 래퍼: 진짜 배경/라운드/높이는 여기서
    grayWrap: {
        backgroundColor: "#E5E5E5",
        borderRadius: 8,
        overflow: "hidden",
        height: 44,
        justifyContent: "center",
    },
    grayWrapWithMargin: {
        backgroundColor: "#E5E5E5",
        borderRadius: 8,
        overflow: "hidden",
        height: 44,
        justifyContent: "center",
        marginBottom: 8,
    },
    // AppButton은 투명으로 꽉 채우기 (array 금지 → 단일 스타일)
    ghostFill: {
        backgroundColor: "transparent",
        height: 44,
        width: "100%",
    },
});
