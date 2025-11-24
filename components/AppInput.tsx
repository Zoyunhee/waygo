import { forwardRef } from "react";
import { TextInput, View, Text, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps & {
    label?: string;
    errorText?: string;
};

const AppInput = forwardRef<TextInput, Props>(({ label, errorText, style, ...rest }, ref) => {
    return (
        <View style={styles.wrap}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <TextInput
                ref={ref}
                placeholderTextColor="#9AA0A6"
                style={[styles.input, errorText ? styles.inputError : null, style]}
                {...rest}
            />
            {!!errorText && <Text style={styles.error}>{errorText}</Text>}
        </View>
    );
});
AppInput.displayName = "AppInput";

export default AppInput;

const styles = StyleSheet.create({
    wrap: { marginBottom: 12 }, // width: "100%",
    label: { fontSize: 14, color: "#111", marginBottom: 6, fontWeight: "600" },
    input: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 12,
        backgroundColor: "#F9FAFB",
    },
    inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
    error: { color: "#EF4444", marginTop: 6, fontSize: 12 },
});
