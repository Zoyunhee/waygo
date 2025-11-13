import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    size?: number;     // 지름
    iconSize?: number;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
};

export default function RoundIconButton({
                                            icon,
                                            size = 72,
                                            iconSize = 32,
                                            onPress,
                                            disabled,
                                            loading,
                                        }: Props) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: '#000',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Ionicons name={icon} size={iconSize} color="#fff" />
            )}
        </TouchableOpacity>
    );
}
