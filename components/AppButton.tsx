import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
    variant?: "primary" | "ghost";
    style?: ViewStyle;
};

export default function AppButton({ title, onPress, disabled, style, variant = "primary" }: Props) {
    const isGhost = variant === "ghost";
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.btn,
                isGhost ? styles.ghost : styles.primary,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text style={[styles.text, isGhost ? styles.ghostText : styles.primaryText]}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    primary: { backgroundColor: "#111" },
    primaryText: { color: "#fff", fontWeight: "700" },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#E5E7EB" },
    ghostText: { color: "#111", fontWeight: "700" },
    disabled: { opacity: 0.4 },
    text: { fontSize: 16 },
});
