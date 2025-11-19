// app/(tabs)/community/index.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppInput from "@/components/AppInput";
import RoundIconButton from "../../../components/RoundIconButton";

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

const dummyPosts: Post[] = [
    {
        id: "1",
        author: "닉네임",
        title: "글 제목 한 줄 (사진 규격까지만)",
        content:
            "내가 작성해 본 글입니다. 이 텍스트는 그냥 예시로 넣은 내용입니다.",
        images: [],
        createdAt: "2025.10.23",
        likeCount: 0,
        liked: false,
        commentCount: 0,
    },
    {
        id: "2",
        author: "닉네임",
        title: "부산 여행 기록",
        content: "부산에서 찍은 사진과 기록을 남겨봅니다.",
        images: [],
        createdAt: "2025.10.24",
        likeCount: 0,
        liked: false,
        commentCount: 0,
    },
];

export default function CommunityMainScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // ✅ setPosts 포함
    const [posts, setPosts] = useState<Post[]>(dummyPosts);

    // ✅ prev, p 에 타입 지정
    const handleToggleLike = (postId: string) => {
        setPosts((prev: Post[]) =>
            prev.map((p: Post) =>
                p.id === postId
                    ? {
                        ...p,
                        liked: !p.liked,
                        likeCount: p.likeCount + (p.liked ? -1 : 1),
                    }
                    : p
            )
        );
    };

    const renderPostItem = ({ item }: { item: Post }) => {
        const thumbnail = item.images[0];

        return (
            <TouchableOpacity
                style={styles.postCard}
                onPress={() =>
                    router.push({
                        pathname: "/(tabs)/community/post",
                        params: { id: item.id },
                    })
                }
            >
                <View style={styles.postHeader}>
                    <Text style={styles.author}>{item.author}</Text>
                </View>

                <View style={styles.thumbnailBox}>
                    {thumbnail ? (
                        <Image source={{ uri: thumbnail }} style={styles.thumbnailImage} />
                    ) : (
                        <View style={styles.thumbnailPlaceholder}>
                            <Text style={styles.thumbnailIcon}>🖼</Text>
                        </View>
                    )}
                </View>

                <View style={styles.postBody}>
                    <Text style={styles.postTitle} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.postDate}>{item.createdAt}</Text>

                    <View style={styles.postFooter}>
                        <TouchableOpacity
                            style={styles.iconRow}
                            onPress={() => handleToggleLike(item.id)}
                        >
                            <Text style={styles.likeIcon}>{item.liked ? "♥" : "♡"}</Text>
                            <Text style={styles.iconLabel}>{item.likeCount}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconRow}
                            onPress={() =>
                                router.push({
                                    pathname: "/(tabs)/community/comments",
                                    params: { postId: item.id },
                                })
                            }
                        >
                            <Text>💬</Text>
                            <Text style={styles.iconLabel}>{item.commentCount}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단 safe area 만큼 띄우기 */}
            <View style={{ height: insets.top }} />

            {/* WayGo 로고 */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => router.push("/(tabs)/home")}
            >
                <Text style={styles.logo}>WayGo</Text>
            </TouchableOpacity>

            {/* 검색바 */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/(tabs)/community/search")}
                style={styles.searchWrapper}
            >
                <AppInput editable={false} placeholder="검색" pointerEvents="none" />
            </TouchableOpacity>

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={renderPostItem}
                contentContainerStyle={styles.listContent}
            />

            {/* 글쓰기 플로팅 버튼 */}
            <View style={styles.fabWrapper}>
                <RoundIconButton
                    icon={"add" as any}
                    onPress={() => router.push("/(tabs)/community/write")}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 8,
    },
    logo: { fontSize: 24, fontWeight: "700" },
    searchWrapper: {
        paddingHorizontal: 20,
        marginBottom: 8,
        marginTop: 8, // 검색바 좀만 내리게
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    postCard: {
        marginTop: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
        paddingBottom: 16,
    },
    postHeader: {
        marginBottom: 8,
    },
    author: { fontSize: 14, fontWeight: "500" },
    thumbnailBox: {
        width: "100%",
        aspectRatio: 1,
        backgroundColor: "#f4f4f4",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 12,
    },
    thumbnailPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    thumbnailIcon: { fontSize: 32, opacity: 0.2 },
    thumbnailImage: { width: "100%", height: "100%" },
    postBody: {},
    postTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
    postDate: { fontSize: 12, color: "#999", marginBottom: 8 },
    postFooter: {
        flexDirection: "row",
        gap: 16,
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    likeIcon: { fontSize: 16 },
    iconLabel: { fontSize: 12 },
    fabWrapper: {
        position: "absolute",
        right: 20,
        bottom: 40,
    },
});
