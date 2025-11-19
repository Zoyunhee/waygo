// app/(tabs)/community/post.tsx
import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Post = {
    id: string;
    author: string;
    title: string;
    content: string;
    images: string[];
    createdAt: string;
    likeCount: number;
    liked: boolean;
    commentCount: number;
};

// TODO: 나중에 여기 대신 백엔드 API로 데이터 가져오면 됨
const dummyPosts: Post[] = [
    {
        id: "1",
        author: "닉네임",
        title: "글 제목 한 줄 (사진 규격까지만)",
        content:
            "내가 작성해 본 글입니다.\n\n이 텍스트는 커뮤니티 상세 화면 예시용으로 넣은 내용입니다. 줄글이 꽉 차 보이도록 여러 줄을 넣어두면 디자인 확인이 편합니다.",
        images: [
            // 나중에 백엔드에서 URL 배열 받아서 이 자리에 넣어주면 됨
            // "https://via.placeholder.com/200",
            // "https://via.placeholder.com/200",
        ],
        createdAt: "2025.10.23",
        likeCount: 0,
        liked: false,
        commentCount: 0,
    },
    {
        id: "2",
        author: "닉네임",
        title: "부산 여행 기록",
        content:
            "부산으로 여행을 떠나서 남긴 기록입니다. 해운대, 광안리, 자갈치 시장 등등...",
        images: [],
        createdAt: "2025.10.24",
        likeCount: 0,
        liked: false,
        commentCount: 0,
    },
];

export default function PostScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const post = useMemo(
        () => dummyPosts.find((p) => p.id === id),
        [id]
    );

    const [liked, setLiked] = useState(post?.liked ?? false);
    const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);

    if (!post) {
        return (
            <View style={styles.center}>
                <Text>게시글을 찾을 수 없습니다.</Text>
            </View>
        );
    }

    const toggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    };

    return (
        <View style={styles.container}>
            {/* ✅ 상단 safe area */}
            <View style={{ height: insets.top }} />

            {/* ✅ 2번 캡처 느낌의 헤더: 뒤로가기 + 닉네임 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backArea} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>〈</Text>
                </TouchableOpacity>
                <Text style={styles.headerAuthor}>{post.author}</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.date}>{post.createdAt}</Text>

                <Text style={styles.body}>{post.content}</Text>

                {/* 이미지들 (최대 5장) */}
                <View style={styles.imagesContainer}>
                    {post.images.map((uri) => (
                        <Image key={uri} source={{ uri }} style={styles.image} />
                    ))}
                </View>

                {/* 하트 / 댓글 */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconRow} onPress={toggleLike}>
                        <Text style={styles.likeIcon}>{liked ? "♥" : "♡"}</Text>
                        <Text>{likeCount}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconRow}
                        onPress={() =>
                            router.push({
                                pathname: "/(tabs)/community/comments",
                                params: { postId: post.id },
                            })
                        }
                    >
                        <Text>💬</Text>
                        <Text>{post.commentCount}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // 헤더
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
    },
    backArea: {
        paddingRight: 8,
        paddingVertical: 4,
        paddingLeft: 0,
    },
    backIcon: {
        fontSize: 20,
    },
    headerAuthor: {
        fontSize: 14,
        marginLeft: 8,
    },

    // 내용
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
    },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 4, textAlign: "center" },
    date: {
        fontSize: 12,
        color: "#999",
        marginBottom: 16,
        textAlign: "center",
    },
    body: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    imagesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    image: {
        width: "48%",
        aspectRatio: 1,
        borderRadius: 6,
        backgroundColor: "#f4f4f4",
    },
    actionRow: {
        flexDirection: "row",
        gap: 16,
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    likeIcon: { fontSize: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
