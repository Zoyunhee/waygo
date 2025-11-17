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
const BG_HEIGHT = (SCREEN_WIDTH * 4) / 3.5; // 가로:세로 = 3:4 → height = width * 4/3.5 (디자인 맞춘

export default function ProfileEdit() {
    const router = useRouter();
    const [profileUri, setProfileUri] = useState<string | null>(null);
    const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>("");

    useEffect(() => {
        // ===== TODO: 백엔드에서 현재 프로필 정보 가져오기 =====
        // (이미 저장된 프로필/배경 이미지 + 닉네임)
        //
        // const fetchProfile = async () => {
        //   const res = await fetch("https://api.waygo.com/profile/me", {
        //     headers: { Authorization: "Bearer 토큰" },
        //   });
        //   const data = await res.json();
        //
        //   setNickname(data.nickname);                 // 회원가입 때 쓴 닉네임
        //   setProfileUri(data.profileImageUrl);       // string | null
        //   setBackgroundUri(data.backgroundImageUrl); // string | null
        // };
        //
        // fetchProfile();
    }, []);

    const pickImage = async (type: "profile" | "background") => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한 필요", "사진을 선택하려면 앨범 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: type === "profile", //  // ios 1:1 말고 편집 ui 적용이 안 됨 그래서 그냥 빼고 7:8로 적용함 프로필만 1:1 편집창 사용
            quality: 1,
            aspect: type === "profile" ? [1, 1] : [7, 8], // 프로필 1:1, 배경 대략  7:8
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            if (type === "profile") setProfileUri(uri);
            else setBackgroundUri(uri);
        }
    };

    const handleSave = async () => {
        // ===== TODO: 백엔드로 이미지(및 닉네임 변화가 있다면 그것도) 업로드 =====
        //
        // const formData = new FormData();
        //
        // if (profileUri) {
        //   formData.append("profileImage", {
        //     uri: profileUri,
        //     name: "profile.jpg",
        //     type: "image/jpeg",
        //   } as any);
        // }
        //
        // if (backgroundUri) {
        //   formData.append("backgroundImage", {
        //     uri: backgroundUri,
        //     name: "background.jpg",
        //     type: "image/jpeg",
        //   } as any);
        // }
        //
        // formData.append("nickname", nickname);
        //
        // await fetch("https://api.waygo.com/profile/update", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //     Authorization: "Bearer 토큰",
        //   },
        //   body: formData,
        // });
        //
        // 🔺 여기까지가 “백엔드에 실제로 저장”하는 파트

        // 저장 후 이전 화면(마이페이지)으로 돌아가기
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
                onPress={() => pickImage("background")}>
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
                    onPress={() => pickImage("profile")}>
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
        //marginTop: 40,
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
        // width: "100%"  ← 이거 빼야 양쪽 여백이 같음
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
