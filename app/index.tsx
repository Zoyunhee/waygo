// 나중에 수정해야함
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚀 개발 메뉴</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/login')}
            >
                <Text style={styles.buttonText}>🔹 로그인 화면</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/join')}
            >
                <Text style={styles.buttonText}>🔹 회원가입 화면</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/home')}
            >
                <Text style={styles.buttonText}>🔹 홈 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/translate')}
            >
                <Text style={styles.buttonText}>🔹 번역기 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/mypage')}
            >
                <Text style={styles.buttonText}>🔹 마이페이지 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/community')}
            >
                <Text style={styles.buttonText}>🔹 커뮤니티 탭</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/go')}
            >
                <Text style={styles.buttonText}>🔹 GO 탭</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 24,
    },
    button: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "600",
    },
});