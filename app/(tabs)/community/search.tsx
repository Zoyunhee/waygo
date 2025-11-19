// app/(tabs)/community/search.tsx
import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppInput from "@/components/AppInput";

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
        content: "내가 작성해 본 글입니다. 예시 텍스트...",
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
        content: "부산 해운대, 광안리, 자갈치 시장을 다녀왔습니다.",
        images: [],
        createdAt: "2025.10.24",
        likeCount: 0,
        liked: false,
        commentCount: 0,
    },
];

export default function CommunitySearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return dummyPosts;
        return dummyPosts.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q)
        );
    }, [query]);

    const renderItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() =>
                router.push({
                    pathname: "/(tabs)/community/post",
                    params: { id: item.id },
                })
            }
        >
            <Text style={styles.title} numberOfLines={1}>
                {item.title}
            </Text>
            <Text style={styles.snippet} numberOfLines={1}>
                {item.content}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* safe area + 헤더 */}
            <View style={{ height: insets.top }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>〈</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>검색</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchBar}>
                <AppInput
                    placeholder="검색"
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
    searchBar: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
    item: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
    },
    title: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
    snippet: { fontSize: 13, color: "#666" },
});
