import {
    View,
    Text,
    StyleSheet,
    Image,
    Pressable,
    ScrollView,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

type Post = {
    id: string;
    imageUrl: string;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const BG_HEIGHT = SCREEN_WIDTH; // 1:1 배경

export default function ProfileScreen() {
    const router = useRouter();
    const [tab, setTab] = useState<"my" | "like">("my");

    // 🔹 프로필 / 배경 / 닉네임
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const [nickname, setNickname] = useState<string>("");

    // 🔹 내가 쓴 글 / 좋아요 글 리스트
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);

    // ===== TODO: 백엔드에서 프로필 정보(닉네임/프로필/배경) 가져오기 =====
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                /*
                const res = await fetch("https://api.waygo.com/profile/me", {
                    headers: {
                        Authorization: `Bearer 토큰`,
                    },
                });
                const data = await res.json();

                setNickname(data.nickname);
                setProfileImageUrl(data.profileImageUrl);       // string | null
                setBackgroundImageUrl(data.backgroundImageUrl); // string | null
                */
            } catch (e) {
                console.log("프로필 불러오기 실패:", e);
            }
        };

        fetchProfile();
    }, []);

    // ===== TODO: 백엔드에서 내가 쓴 글 / 좋아요 글 목록 가져오기 =====
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                /*
                const myRes = await fetch("https://api.waygo.com/profile/my-posts", {
                    headers: { Authorization: `Bearer 토큰` },
                });
                const myData: Post[] = await myRes.json();
                setMyPosts(myData);

                const likedRes = await fetch("https://api.waygo.com/profile/liked-posts", {
                    headers: { Authorization: `Bearer 토큰` },
                });
                const likedData: Post[] = await likedRes.json();
                setLikedPosts(likedData);
                */
            } catch (e) {
                console.log("게시글 목록 불러오기 실패:", e);
            }
        };

        fetchPosts();
    }, []);

    const list = tab === "my" ? myPosts : likedPosts;

    return (
        <View style={styles.container}>
            {/* 상단 배경 + 프로필 영역 */}
            <View style={styles.header}>
                {/* 뒤로가기(홈 탭으로 이동) */}
                <Pressable
                    onPress={() => router.push("/(tabs)/home")}
                    style={styles.backButton}
                >
                    <Text style={{ fontSize: 20 }}>{"<"}</Text>
                </Pressable>

                {/* 1:1 배경 이미지 */}
                <View style={styles.backgroundImagePlaceholder}>
                    {backgroundImageUrl && (
                        <Image
                            source={{ uri: backgroundImageUrl }}
                            style={styles.backgroundImage}
                        />
                    )}
                </View>

                {/* 프로필 사진 + 닉네임 */}
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

            {/* 게시물 그리드 */}
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

    // ⬇️ 파란 영역(배경) 자체를 정사각형으로
    header: {
        position: "relative",
        width: "100%",
        height: BG_HEIGHT,     // 여기로만 높이 결정
        backgroundColor: "#e8f0ff",
    },

    backButton: {
        position: "absolute",
        top: 50,               // 필요하면 45~60 사이로 조절
        left: 16,
        zIndex: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },

    // ⬇️ 정사각형 전체를 사진으로 채우는 뷰
    backgroundImagePlaceholder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    },
    backgroundImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },

    // ⬇️ 프로필은 정사각형 하단을 살짝 넘어가게
    profileArea: {
        position: "absolute",
        bottom: -50,            // 동그라미 절반 정도 내려오게, 숫자 마음대로 조절 가능
        left: 0,
        right: 0,
        alignItems: "center",
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
        marginTop: 60, // 위에 닉네임이랑 겹쳐져서 추가힘
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
        width: "33.33%", //3개씩 띄울려고
        aspectRatio: 1,
        padding: 4,
    },
    postImage: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: "#eee",
    },
});
