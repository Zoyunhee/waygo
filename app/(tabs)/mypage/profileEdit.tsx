import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    Alert,
    Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BG_HEIGHT = SCREEN_WIDTH; // 1:1 배경

export default function ProfileEdit() {
    const router = useRouter();
    const [profileUri, setProfileUri] = useState<string | null>(null);
    const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>("");

    // ===== TODO: 백엔드에서 현재 프로필 정보 가져오기 =====
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                /*
                const res = await fetch("https://api.waygo.com/profile/me", {
                    headers: { Authorization: `Bearer 토큰` },
                });
                const data = await res.json();

                setNickname(data.nickname);
                setProfileUri(data.profileImageUrl);       // string | null
                setBackgroundUri(data.backgroundImageUrl); // string | null
                */
            } catch (e) {
                console.log("프로필 편집용 데이터 불러오기 실패:", e);
            }
        };

        fetchProfile();
    }, []);

    const pickImage = async (type: "profile" | "background") => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한 필요", "사진을 선택하려면 앨범 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // 프로필/배경 둘 다 크롭 UI
            quality: 1,
            aspect: [1, 1], // 1:1 정사각형
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            if (type === "profile") setProfileUri(uri);
            else setBackgroundUri(uri);
        }
    };

    const handleSave = async () => {
        // ===== TODO: 백엔드로 이미지 + 닉네임 저장 =====
        try {
            /*
            const formData = new FormData();

            if (profileUri) {
                formData.append("profileImage", {
                    uri: profileUri,
                    name: "profile.jpg",
                    type: "image/jpeg",
                } as any);
            }

            if (backgroundUri) {
                formData.append("backgroundImage", {
                    uri: backgroundUri,
                    name: "background.jpg",
                    type: "image/jpeg",
                } as any);
            }

            formData.append("nickname", nickname);

            await fetch("https://api.waygo.com/profile/update", {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer 토큰`,
                },
                body: formData,
            });
            */
        } catch (e) {
            console.log("프로필 저장 실패:", e);
        }

        // 🔹 저장 후 마이페이지로 돌아가기
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 상단 바 */}
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.topText}>취소</Text>
                </Pressable>
                <Pressable onPress={handleSave}>
                    <Text style={styles.topText}>완료</Text>
                </Pressable>
            </View>

            {/* 배경 이미지 */}
            <Pressable
                style={styles.backgroundArea}
                onPress={() => pickImage("background")}
            >
                {backgroundUri ? (
                    <Image source={{ uri: backgroundUri }} style={styles.backgroundImage} />
                ) : (
                    <Text>배경 사진 추가</Text>
                )}
            </Pressable>

            {/* 프로필 이미지 */}
            <View style={styles.profileArea}>
                <Pressable
                    style={styles.profileCircle}
                    onPress={() => pickImage("profile")}
                >
                    {profileUri ? (
                        <Image source={{ uri: profileUri }} style={styles.profileImage} />
                    ) : (
                        <Text>프로필</Text>
                    )}
                </Pressable>
                <Text style={styles.nickname}>{nickname || "닉네임"}</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#e8f0ff" },
    topBar: {
        paddingTop: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    topText: { fontSize: 16 },
    backgroundArea: {
        marginTop: 16,
        marginHorizontal: 16,
        height: BG_HEIGHT,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    backgroundImage: { width: "100%", height: "100%", resizeMode: "cover" },
    profileArea: { alignItems: "center", marginTop: -50 },
    profileCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#000",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    profileImage: { width: "100%", height: "100%" },
    nickname: { marginTop: 8, fontSize: 16 },
});
