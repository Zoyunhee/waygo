import React, { useState } from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Modal,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "../../../components/AppButton";
import AppInput from "../../../components/AppInput";
import { translateText } from "./api";

// 간단히 쓸 언어 리스트 (원하면 더 추가)
const LANGUAGES = [
    { code: "auto", label: "언어감지" },
    { code: "ko", label: "한국어" },
    { code: "en", label: "영어" },
    { code: "ja", label: "일본어" },
    { code: "zh1", label: "중국어(간체)" },
    { code: "zh2", label: "중국어(번체)" },
    { code: "vi", label: "베트남어" },
    { code: "th", label: "태국어" },
    { code: "id", label: "인도네시아어" },
    { code: "es", label: "스페인어" },
    { code: "fr", label: "프랑스어" },
    { code: "ru", label: "러시아어" },
    { code: "de", label: "독일어" },
    { code: "it", label: "이탈리아어" },
    { code: "ar", label: "아랍어" },
];

type PickerTarget = "source" | "target" | null;

export default function TranslateMainScreen() {
    const router = useRouter();

    // 화면에는 label만 쓰고, 실제로는 code를 백엔드에 넘겨도 됨.
    const [sourceLang, setSourceLang] = useState(LANGUAGES[0]); // 언어감지
    const [targetLang, setTargetLang] = useState(LANGUAGES[1]); // 한국어

    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    // 어떤 쪽 언어를 고르는 중인지
    const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

    const openPicker = (target: PickerTarget) => {
        setPickerTarget(target);
    };

    const closePicker = () => setPickerTarget(null);

    const handleSelectLang = (lang: (typeof LANGUAGES)[number]) => {
        if (pickerTarget === "source") setSourceLang(lang);
        if (pickerTarget === "target") setTargetLang(lang);
        closePicker();
    };

    const swapLang = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    };

    const handleTranslate = async () => {
        const text = input.trim();
        if (!text) return;

        try {
            setLoading(true);
            setResult("");

            const res = await translateText({
                sourceLang: sourceLang.code,
                targetLang: targetLang.code,
                text,
            });

            setResult(res.translated);
        } catch (e: any) {
            Alert.alert("번역 실패", e?.message ?? "다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const isTranslateDisabled = loading || !input.trim();

    const languageTextStyle = {
        fontSize: 18,
        fontWeight: "700" as const,
        color: "#111",
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                {/* 상단 WayGo (아래로 조금 내리고, 프로필 아이콘 제거) */}
                <View
                    style={{
                        paddingHorizontal: 12,
                        paddingTop: 8,
                        paddingBottom: 10,
                        marginLeft: 5,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/home")}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={{
                                fontSize: 25,
                                fontWeight: "800",
                                marginLeft: 7,
                                marginBottom: 10,
                                textAlign: "left",
                            }}
                        >WayGo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 언어 선택 줄 */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        marginTop: 6,
                    }}
                >
                    {/* 왼쪽 영역 */}
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => openPicker("source")}
                        >
                            <Text style={languageTextStyle}>{sourceLang.label}</Text>
                            <Ionicons
                                name="chevron-down"
                                size={18}
                                style={{ marginLeft: 8, marginTop: 1, marginRight: 8 }}   // ← 간격 넉넉하게
                            />
                        </TouchableOpacity>
                    </View>

                    {/* 가운데 스왑 아이콘 (항상 중앙) */}
                    <View
                        style={{
                            width: 48,                  // 화면 정중앙을 위해 고정 폭
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <TouchableOpacity onPress={swapLang}>
                            <Ionicons name="swap-horizontal" size={22} />
                        </TouchableOpacity>
                    </View>

                    {/* 오른쪽 영역 */}
                    <View style={{ flex: 1, alignItems: "flex-start", marginLeft: 12, }}>
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center" }}
                            onPress={() => openPicker("target")}
                        >
                            <Text style={languageTextStyle}>{targetLang.label}</Text>
                            <Ionicons
                                name="chevron-down"
                                size={18}
                                style={{ marginLeft: 8, marginTop: 1,  }}   // ← 여기도 동일
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 본문 */}
                <ScrollView
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={{ height: 18 }} />

                    {/* 입력칸 */}
                    <AppInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="번역할 내용을 입력하세요"
                        multiline
                        style={{
                            height: 180,
                            textAlignVertical: "top",
                        }}
                    />

                    {/* 결과칸 */}
                    <AppInput
                        value={result}
                        editable={false}
                        placeholder="번역 결과..."
                        multiline
                        style={{
                            height: 180,
                            textAlignVertical: "top",
                        }}
                    />

                    {/* 번역 버튼 */}
                    <AppButton
                        title={loading ? "번역 중..." : "번역하기"}
                        onPress={handleTranslate}
                        //disabled={isTranslateDisabled}
                        style={{ marginTop: 20 }}
                    />

                    {/* 음성 / 카메라 버튼 */}
                    <AppButton
                        title="음성"
                        onPress={() => router.push("/(tabs)/translate/voice")}
                        style={{ marginTop: 35 }}
                    />

                    <AppButton
                        title="카메라"
                        onPress={() => router.push("/(tabs)/translate/camera")}
                        style={{ marginTop: 10 }}
                    />
                </ScrollView>

                {/* 언어 선택 바텀 시트 모달 */}
                <Modal
                    visible={pickerTarget !== null}
                    transparent
                    animationType="slide"
                    onRequestClose={closePicker}
                >
                    {/* 반투명 배경 */}
                    <Pressable
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.3)",
                            justifyContent: "flex-end",
                        }}
                        onPress={closePicker}
                    >
                        {/* 바텀 시트 */}
                        <View
                            style={{
                                backgroundColor: "#fff",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                paddingHorizontal: 16,
                                paddingTop: 12,
                                paddingBottom: 24,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 4,
                                    borderRadius: 999,
                                    backgroundColor: "#E5E7EB",
                                    alignSelf: "center",
                                    marginBottom: 12,
                                }}
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "700",
                                    marginBottom: 12,
                                }}
                            >
                                {pickerTarget === "source" ? "입력 언어 선택" : "번역 언어 선택"}
                            </Text>

                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={{
                                        paddingVertical: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                    onPress={() => handleSelectLang(lang)}
                                >
                                    <Text style={{ fontSize: 15 }}>{lang.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
