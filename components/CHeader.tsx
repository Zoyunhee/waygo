import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommunityHeader({
                                            title,
                                            showBack = true,
                                        }: {
    title: string;
    showBack?: boolean;
}) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            {showBack ? (
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>〈</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.backPlaceholder} />
            )}

            <Text style={styles.title}>{title}</Text>

            {/* 오른쪽 공간 맞추기용 */}
            <View style={styles.backPlaceholder} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 12,
    },
    backButton: {
        paddingRight: 10,
        paddingVertical: 4,
    },
    backIcon: {
        fontSize: 22,
    },
    backPlaceholder: {
        width: 22,
    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
});
