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

    // true면 카메라 false면 번역 결과 , 다시카메라버튼
    const [showCamera, setShowCamera] = useState(true);

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

            // 텍스트까지 다 나오면 카메라 숨기고 번역결과랑 카메라 다시 버튼
            setShowCamera(false);
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
            {/* 헤더 */}
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
                {showCamera ? (
                    // 카메라 모드 : 카메라만 전체 화면
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
                ) : (
                    // 번역 결과 텍스트 겹침 해결함 , 다시 찍기 버튼
                    <View style={styles.resultWrapper}>
                        <View style={styles.resultContainer}>
                            <AppInput
                                label="추출된 텍스트"
                                value={extractedText}
                                editable={false}
                                multiline
                                placeholder="사진에서 추출된 텍스트가 여기에 표시됩니다."
                                style={{
                                    minHeight: 180,
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
                                    minHeight: 180,
                                    textAlignVertical: "top",
                                }}
                            />
                        </View>

                        <View style={styles.retryContainer}>
                            <RoundIconButton
                                icon="camera"
                                size={64}
                                iconSize={28}
                                onPress={() => {
                                    setShowCamera(true);
                                    setExtractedText("");
                                    setTranslatedText("");
                                }}
                            />
                        </View>
                    </View>
                )}
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
        flex: 1, // 카메라 영역 전체 확장
        overflow: "hidden",
    },
    shutterContainer: {
        position: "absolute",
        bottom: 24,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    // 결과 화면 전체 래퍼
    resultWrapper: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 16,
    },
    // 텍스트 인풋 들어가는
    resultContainer: {
        flex: 1,
        padding: 16,
        paddingBottom: 8,
        backgroundColor: "#fff",
        justifyContent: "flex-start",
        gap: 150,
    },
    // 다시 찍기 버튼
    retryContainer: {
        paddingBottom: 24,
        paddingTop: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
});
