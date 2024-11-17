import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
// import AntDesign from '@expo/vector-icons/AntDesign';
import { TextInputNodeProps } from "@/constants/interfaces/props/TextInput";

const TextInputComponent: React.FC<TextInputNodeProps> = ({ navigation, local, keyboardType, secureTextEntry, editable = true, placeholder, label, setValue, value, isInvalid = false }) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        return (
            <Text style={[styles.label, isFocus && { color: '#0047ab' }]}>
                {label}
            </Text>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {renderLabel()}
                <TextInput
                    style={[
                        styles.input,
                        isInvalid && styles.inputError,
                        isFocus && { borderColor: '#0047ab' },
                        !editable && styles.inputDisabled, // Adiciona o estilo desabilitado
                    ]}
                    placeholder={!isFocus ? placeholder : '...'}
                    placeholderTextColor={'#c7c7c7'}
                    keyboardType={keyboardType || "default"}
                    value={value}
                    onChangeText={(value) => {
                        setValue(value);
                        setIsFocus(false);
                    }}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    editable={editable}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default TextInputComponent;

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
    },
    input: {
        width: "100%",
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16,
    },
    inputError: {
        borderColor: "red",
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0', // Cor de fundo quando desabilitado
        borderColor: '#d3d3d3',    // Cor da borda quando desabilitado
        color: '#a9a9a9',          // Cor do texto quando desabilitado
    },
});
