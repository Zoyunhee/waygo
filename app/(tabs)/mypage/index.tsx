import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

type Post = {
    id: string;
    imageUrl: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const BG_HEIGHT = (SCREEN_WIDTH * 4) / 3.5; // 가로:세로 = 3:4 → height = width * 4/3.5 편집 화면과 동일 비율

export default function ProfileScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<"my" | "like">("my");

    // 🔹 프로필 / 배경 / 닉네임 (백엔드에서 받아올 값들)
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
        null
    );
    const [nickname, setNickname] = useState<string>("");

    // 🔹 내가 쓴 글 / 좋아요 글 리스트
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);

    useEffect(() => {
        // ===== TODO: 백엔드에서 프로필 정보(닉네임/프로필/배경) 가져오기 =====
        //
        // 예시 응답 형태:
        // {
        //   nickname: "홍길동",
        //   profileImageUrl: "https://waygo.com/profiles/123.jpg",
        //   backgroundImageUrl: "https://waygo.com/backgrounds/bg123.jpg"
        // }
        //
        // setNickname(data.nickname);
        // setProfileImageUrl(data.profileImageUrl);
        // setBackgroundImageUrl(data.backgroundImageUrl);
    }, []);

    useEffect(() => {
        // ===== TODO: 백엔드에서 내가 쓴 글 목록 / 좋아요 글 목록 가져오기 =====
        //
        // 예시 응답 형태:
        // myPosts = [
        //   { id: "post1", imageUrl: "https://..." },
        //   { id: "post2", imageUrl: "https://..." }
        // ]
        //
        // likedPosts = [
        //   { id: "liked1", imageUrl: "https://..." },
        //   { id: "liked2", imageUrl: "https://..." }
        // ]
        //
        // setMyPosts(myData);
        // setLikedPosts(likedData);
    }, []);


    const list = tab === "my" ? myPosts : likedPosts;

    return (
        <View style={styles.container}>
            {/* 상단 배경 영역 */}
            <View style={styles.header}>
                {/* 뒤로가기(홈 탭으로 이동) */}
                <Pressable
                    onPress={() => router.push("/(tabs)/home")}
                    style={styles.backButton}
                >
                    <Text style={{ fontSize: 20 }}>{"<"}</Text>
                </Pressable>

                {/* 배경 이미지 자리 */}
                <View style={styles.backgroundImagePlaceholder}>
                    {/* backgroundImageUrl이 있을 때만 실제 이미지 렌더링 */}
                    {backgroundImageUrl && (
                        <Image
                            source={{ uri: backgroundImageUrl }}
                            style={styles.backgroundImage}
                        />
                    )}
                </View>

                {/* 프로필 사진 */}
                <View style={styles.profileArea}>
                    <View style={styles.profileImageWrapper}>
                        {profileImageUrl ? (
                            <Image
                                source={{ uri: profileImageUrl }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <Image
                                source={require("../../../assets/profile-placeholder.png")}
                                style={styles.profileImage}
                            />
                        )}
                    </View>
                    <Text style={styles.nickname}>{nickname || "닉네임"}</Text>
                </View>
            </View>

            {/* 프로필 수정 / 정보 수정 버튼 */}
            <View style={styles.buttonRow}>
                <Pressable
                    style={styles.mainButton}
                    onPress={() => router.push("/(tabs)/mypage/profileEdit")}
                >
                    <Text style={styles.mainButtonText}>프로필 편집</Text>
                </Pressable>
                <Pressable
                    style={styles.mainButton}
                    onPress={() => router.push("/(tabs)/mypage/infoedit")}
                >
                    <Text style={styles.mainButtonText}>정보 수정</Text>
                </Pressable>
            </View>

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 내가 쓴 글 / 좋아요 탭 */}
            <View style={styles.communityTabs}>
                <Pressable onPress={() => setTab("my")} style={styles.communityTab}>
                    <Text
                        style={[
                            styles.communityTabText,
                            tab === "my" && styles.communityTabTextActive,
                        ]}
                    >
                        내가 쓴 글
                    </Text>
                    {tab === "my" && <View style={styles.communityTabUnderline} />}
                </Pressable>
                <Pressable onPress={() => setTab("like")} style={styles.communityTab}>
                    <Text
                        style={[
                            styles.communityTabText,
                            tab === "like" && styles.communityTabTextActive,
                        ]}
                    >
                        좋아요
                    </Text>
                    {tab === "like" && <View style={styles.communityTabUnderline} />}
                </Pressable>
            </View>

            {/* 게시물 그리드 (많아지면 아래로 스크롤) */}
            <ScrollView style={styles.postScroll} contentContainerStyle={styles.postGrid}>
                {list.map((post) => (
                    <View key={post.id} style={styles.postItem}>
                        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        backgroundColor: "#e8f0ff",
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    backButton: {
        position: "absolute",
        top: 45,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    backIcon: {
        fontSize: 22,
    },

    // 🔹 배경 박스와 이미지 크기를 동일하게 + 살짝 아래로 내리기
    backgroundImagePlaceholder: {
        height: BG_HEIGHT,
        width: "100%",
        overflow: "hidden",
        marginTop: 15, // ⬅️ 위쪽에 파란 여백 조금 주기 (원하는 만큼 4~16 사이로 조절)
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    // 🔹 프로필을 조금 더 위로 끌어올려서 아래 파란 여백 줄이기
    profileArea: {
        alignItems: "center",
        marginTop: -80, // 원래 -50 이었는데 -60으로 올려서 아래 간격 줄임
    },

    profileImageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 2,
        borderColor: "#000",
        backgroundColor: "#fff",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    profileImage: { width: "100%", height: "100%" },
    nickname: { marginTop: 8, fontSize: 16, fontWeight: "500" },

    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    mainButton: {
        flex: 1,
        height: 40,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 4,
    },
    mainButtonText: { fontSize: 14 },

    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginHorizontal: 16,
        marginBottom: 8,
    },

    communityTabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 8,
    },
    communityTab: { alignItems: "center", flex: 1 },
    communityTabText: { fontSize: 14, color: "#999" },
    communityTabTextActive: { color: "#000", fontWeight: "600" },
    communityTabUnderline: {
        marginTop: 4,
        width: 40,
        height: 2,
        backgroundColor: "#000",
    },

    postScroll: { flex: 1 },

    postGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 4,
        paddingBottom: 16,
    },
    postItem: {
        width: "33.33%",
        aspectRatio: 1,
        padding: 4,
    },
    postImage: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: "#eee",
    },
});
