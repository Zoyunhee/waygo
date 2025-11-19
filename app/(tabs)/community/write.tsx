// app/(tabs)/community/write.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WriteScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const pickImage = async () => {
        if (images.length >= 5) {
            Alert.alert("알림", "사진은 최대 5장까지 가능해요.");
            return;
        }

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("알림", "사진 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((a) => a.uri);
            setImages((prev) => [...prev, ...uris]);
        }
    };

    const handleSubmit = () => {
        if (!title.trim() || !body.trim()) {
            Alert.alert("알림", "제목과 내용을 입력해 주세요.");
            return;
        }

        // TODO: 백엔드 연동
        Alert.alert("알림", "임시로 글이 등록된 것으로 처리합니다.");
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* safe area + 헤더 */}
            <View style={{ height: insets.top }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>〈</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>글쓰기</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 본문 전체를 KeyboardAvoidingView로 감싸기 */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        { paddingBottom: (insets.bottom || 0) + 20 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <TextInput
                        style={styles.titleInput}
                        placeholder="제목"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <TextInput
                        style={styles.bodyInput}
                        placeholder="글과 사진으로 나의 여정을 기록해보세요!"
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                    />

                    <View style={styles.imagesRow}>
                        {images.map((uri) => (
                            <Image key={uri} source={{ uri }} style={styles.previewImage} />
                        ))}
                        <TouchableOpacity style={styles.addImageBox} onPress={pickImage}>
                            <Text style={{ fontSize: 22 }}>🖼</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.submitWrapper}>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <Text style={styles.submitText}>등록</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 48,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backIcon: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    titleInput: {
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingVertical: 12,
        marginBottom: 16,
    },
    bodyInput: {
        minHeight: 200,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
    },
    imagesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 24,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 6,
    },
    addImageBox: {
        width: 80,
        height: 80,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ddd",
        justifyContent: "center",
        alignItems: "center",
    },
    submitWrapper: {
        alignItems: "flex-end",
    },
    submitButton: {
        backgroundColor: "#000",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    submitText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
