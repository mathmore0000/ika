import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from "react-native-vector-icons/Ionicons";
import { InputButtonNodeProps } from "@/constants/interfaces/props/InputButton";

const InputButtonComponent: React.FC<InputButtonNodeProps> = ({ navigation, local, onPress, placeholder, label, value, isInvalid = false, disabled = false }) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        return (
            <Text style={[styles.label, isFocus && !disabled && { color: '#0047ab' }]}>
                {label}
            </Text>
        );
    };

    return (
        <View style={styles.container}>
            {renderLabel()}
            <TouchableOpacity
                onFocus={() => !disabled && setIsFocus(true)}
                onBlur={() => !disabled && setIsFocus(false)}
                onPress={!disabled ? onPress : undefined}
                style={[
                    styles.input_select,
                    isInvalid && styles.inputError,
                    isFocus && !disabled && { borderColor: '#0047ab' },
                    disabled && styles.inputDisabled, // Aplica estilo desabilitado
                ]}
                disabled={disabled}
            >
                <Text
                    style={[styles.text, !value && { color: "#a0a0a0" }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {value || (placeholder || "Selecione")}
                </Text>

                <Icon
                    name="chevron-forward-outline"
                    style={[
                        styles.icon,
                        disabled && { color: "#a0a0a0" }, // Ícone desabilitado
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

export default InputButtonComponent;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',
        paddingTop: 10,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 18,
        top: 0,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
        color: 'black', // Cor padrão da label
    },
    text: {
        fontSize: 16,
    },
    input_select: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: 'white', // Cor padrão
    },
    icon: {
        fontSize: 16,
        position: 'absolute',
        right: 3,
        color: 'black', // Cor padrão do ícone
    },
    inputError: {
        borderColor: "red",
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0', // Fundo desabilitado
        borderColor: '#d3d3d3',    // Borda desabilitada
    },
});
