import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import AppInput from "../../../components/AppInput";
import RoundIconButton from "../../../components/RoundIconButton";
import { transcribeAudio, translateText } from "./api";

export default function VoiceScreen() {
    const router = useRouter();
    const recordingRef = useRef<Audio.Recording | null>(null);

    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [recording, setRecording] = useState(false);
    const [busy, setBusy] = useState(false);

    const [sourceLang] = useState("한국어");
    const [targetLang] = useState("언어감지");

    const [recognizedText, setRecognizedText] = useState("");
    const [translatedText, setTranslatedText] = useState("");

    useEffect(() => {
        Audio.requestPermissionsAsync().then(({ status }) => {
            setHasPermission(status === "granted");
        });
    }, []);

    const startRecording = async () => {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== "granted") {
                return Alert.alert("마이크 권한이 필요합니다.");
            }

            setRecognizedText("");
            setTranslatedText("");

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            await recording.startAsync();

            recordingRef.current = recording;
            setRecording(true);
        } catch (e: any) {
            Alert.alert("녹음 시작 실패", e?.message ?? "다시 시도해 주세요.");
        }
    };

    const stopRecording = async () => {
        try {
            const recording = recordingRef.current;
            if (!recording) return;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(false);
            recordingRef.current = null;

            if (!uri) return;

            setBusy(true);

            const { text } = await transcribeAudio(uri, sourceLang);
            setRecognizedText(text);

            const { translated } = await translateText({
                sourceLang,
                targetLang,
                text,
            });
            setTranslatedText(translated);
        } catch (e: any) {
            Alert.alert("처리 실패", e?.message ?? "다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    };

    const toggleRecording = () => {
        if (busy) return;
        if (recording) {
            void stopRecording();
        } else {
            void startRecording();
        }
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top", "left", "right"]}
        >
            {/* 커스텀 헤더  맞추기*/}
            <View style={styles.header}>
                <View style={styles.headerSide}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        onPress={() => router.push("/(tabs)/translate")}
                    />
                </View>
                <Text style={styles.headerTitle}>음성 번역</Text>
                <View style={styles.headerSide} />
            </View>

            {/* 본문 */}
            <View style={styles.content}>
                <RoundIconButton
                    icon="mic"
                    size={96}
                    iconSize={40}
                    onPress={toggleRecording}
                    loading={busy}
                    disabled={hasPermission === false}
                />

                <Text style={styles.guideText}>
                    {hasPermission === false
                        ? "마이크 권한이 없습니다. 설정에서 허용해 주세요."
                        : recording
                            ? "지금 말하면 녹음됩니다. 다시 누르면 종료합니다."
                            : "동그란 버튼을 눌러 녹음을 시작하세요."}
                </Text>

                <View style={{ width: "100%", marginTop: 32 }}>
                    <AppInput
                        label="인식된 문장"
                        value={recognizedText}
                        editable={false}
                        multiline
                        placeholder="음성에서 추출된 텍스트가 여기에 표시됩니다."
                        style={{
                            height: 150,
                            textAlignVertical: "top",
                        }}
                    />

                    <AppInput
                        label="번역 결과"
                        value={translatedText}
                        editable={false}
                        multiline
                        placeholder="번역된 결과가 여기에 표시됩니다."
                        style={{
                            height: 150,
                            textAlignVertical: "top",
                        }}
                    />
                </View>
            </View>
        </SafeAreaView>
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
    headerSide: {
        width: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    guideText: {
        marginTop: 16,
        fontSize: 13,
        color: "#666",
        textAlign: "center",
    },
});
