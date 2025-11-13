import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";

import AppInput from "../../../components/AppInput";
import RoundIconButton from "../../../components/RoundIconButton";
import { extractTextFromImage } from "./api";

export default function CameraScreen() {
    const router = useRouter();
    const cameraRef = useRef<CameraView | null>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);

    const [sourceLang] = useState("한국어");
    const [extractedText, setExtractedText] = useState("");
    const [translatedText, setTranslatedText] = useState("");

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleTakePicture = async () => {
        try {
            if (!cameraRef.current) return;

            setBusy(true);
            setExtractedText("");
            setTranslatedText("");

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                skipProcessing: true,
            });

            if (!photo?.uri) {
                throw new Error("사진 촬영에 실패했습니다.");
            }

            const { text, translated } = await extractTextFromImage(
                photo.uri,
                sourceLang
            );

            setExtractedText(text);
            setTranslatedText(translated);
        } catch (e: any) {
            Alert.alert("처리 실패", e?.message ?? "다시 시도해 주세요.");
        } finally {
            setBusy(false);
        }
    };

    if (!permission?.granted) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: "#fff" }}
                edges={["top", "left", "right"]}
            >
                <View style={styles.header}>
                    <View style={styles.headerSide}>
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            onPress={() => router.push("/(tabs)/translate")}
                        />
                    </View>
                    <Text style={styles.headerTitle}>카메라 번역</Text>
                    <View style={styles.headerSide} />
                </View>

                <View style={styles.permissionContainer}>
                    <Text style={{ marginBottom: 12, textAlign: "center" }}>
                        카메라 권한이 필요합니다.
                    </Text>
                    <RoundIconButton
                        icon="camera"
                        onPress={requestPermission}
                        size={72}
                        iconSize={32}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#fff" }}
            edges={["top", "left", "right"]}
        >
            {/* 커스텀 헤더 – VoiceScreen 스타일 맞춤 */}
            <View style={styles.header}>
                <View style={styles.headerSide}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        onPress={() => router.push("/(tabs)/translate")}
                    />
                </View>
                <Text style={styles.headerTitle}>카메라 번역</Text>
                <View style={styles.headerSide} />
            </View>

            {/* 본문 */}
            <View style={styles.cameraContent}>
                {/* 카메라 영역 */}
                <View style={styles.cameraContainer}>
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                    />

                    <View style={styles.shutterContainer}>
                        <RoundIconButton
                            icon="camera"
                            size={88}
                            iconSize={40}
                            onPress={handleTakePicture}
                            loading={busy}
                        />
                    </View>
                </View>

                {/* 텍스트 / 번역 결과 */}
                <View style={styles.resultContainer}>
                    <AppInput
                        label="추출된 텍스트"
                        value={extractedText}
                        editable={false}
                        multiline
                        placeholder="사진에서 추출된 텍스트가 여기에 표시됩니다."
                        style={{
                            height: 80,
                            textAlignVertical: "top",
                        }}
                    />

                    <AppInput
                        label="번역 결과"
                        value={translatedText}
                        editable={false}
                        multiline
                        placeholder="번역된 내용이 여기에 표시됩니다."
                        style={{
                            height: 80,
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
        backgroundColor: "#fff",
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
    permissionContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    cameraContent: {
        flex: 1,
        backgroundColor: "#fff",
    },
    cameraContainer: {
        flex: 1,
        overflow: "hidden",
    },
    shutterContainer: {
        position: "absolute",
        bottom: 24,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    resultContainer: {
        padding: 16,
        paddingBottom: 24,
        backgroundColor: "#fff",
    },
});
