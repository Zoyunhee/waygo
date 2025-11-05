import { Modal, View, Text, StyleSheet } from "react-native";
import AppButton from "./AppButton";

type Props = {
    visible: boolean;
    onClose: () => void;
    message?: string;
};

export default function ErrorDialog({ visible, onClose, message = "인증코드가 틀렸습니다. 다시 입력하십시오" }: Props) {
    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Error !</Text>
                    <Text style={styles.msg}>{message}</Text>
                    <AppButton title="확인" onPress={onClose} style={{ marginTop: 16 }} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        borderRadius: 16,
        backgroundColor: "#fff",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    title: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
    msg: { fontSize: 14, color: "#444" },
});
