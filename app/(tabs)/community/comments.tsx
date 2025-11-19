// app/(tabs)/community/comments.tsx
import React, { useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Comment = {
    id: string;
    postId: string;
    author: string;
    content: string;
    createdAt: string;
    parentId?: string;
};

const dummyComments: Comment[] = [];

export default function CommentsScreen() {
    const { postId } = useLocalSearchParams<{ postId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [text, setText] = useState("");
    const [comments, setComments] = useState<Comment[]>(dummyComments);

    const [replyTo, setReplyTo] = useState<string | null>(null);
    const inputRef = useRef<TextInput | null>(null);

    const list = useMemo(
        () => comments.filter((c) => c.postId === postId),
        [comments, postId]
    );

    const handleSend = () => {
        if (!text.trim()) return;

        const newComment: Comment = {
            id: `c-${Date.now()}`,
            postId: postId!,
            author: "닉네임",
            content: text,
            createdAt: "지금",
            parentId: replyTo || undefined,
        };

        setComments((prev: Comment[]) => [...prev, newComment]);
        setText("");
        setReplyTo(null);
    };

    const handleReplyPress = (commentId: string) => {
        setReplyTo(commentId);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const renderItem = ({ item }: { item: Comment }) => {
        const isReply = !!item.parentId;
        return (
            <View style={[styles.commentRow, isReply && styles.replyRow]}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>닉</Text>
                </View>
                <View style={styles.commentBody}>
                    <Text style={styles.author}>{item.author}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{item.createdAt}</Text>
                        <TouchableOpacity onPress={() => handleReplyPress(item.id)}>
                            <Text style={styles.replyText}>답글 달기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* safe area + 헤더 */}
            <View style={{ height: insets.top }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backIcon}>〈</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>댓글</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 댓글 리스트 */}
            <FlatList
                data={list}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
            />

            {/* 답글 쓰는 중 표시 */}
            {replyTo && (
                <View style={styles.replyInfo}>
                    <Text style={styles.replyInfoText}>답글 쓰는 중…</Text>
                    <TouchableOpacity onPress={() => setReplyTo(null)}>
                        <Text style={styles.replyCancelText}>취소</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ⬇️ 여기만 KeyboardAvoidingView 로 감쌈 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View
                    style={[
                        styles.inputBar,
                        { paddingBottom: Math.max(insets.bottom, 4) } // ⬅ 더 붙음
                    ]}
                >
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder={replyTo ? "답글을 작성해보세요" : "댓글을 작성해보세요"}
                        value={text}
                        onChangeText={setText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendText}>등록</Text>
                    </TouchableOpacity>
                </View>
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
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    commentRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    replyRow: {
        marginLeft: 40,
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    avatarText: { fontSize: 14, fontWeight: "600" },
    commentBody: {
        flex: 1,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
        paddingBottom: 8,
    },
    author: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
    commentText: { fontSize: 14, marginBottom: 4 },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    metaText: { fontSize: 11, color: "#999" },
    replyText: { fontSize: 11, color: "#666" },

    replyInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#eee",
    },
    replyInfoText: {
        fontSize: 12,
        color: "#666",
    },
    replyCancelText: {
        fontSize: 12,
        color: "#999",
    },

    inputBar: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingHorizontal: 12,
        paddingTop: 8,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: "#000",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
    },
    sendText: { color: "#fff", fontWeight: "600" },
});
