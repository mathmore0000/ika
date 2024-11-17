import React, { useState } from 'react';
import { StyleSheet, Text, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { MaskInputNodeProps } from "@/constants/interfaces/props/MaskInput";

const MaskInputComponent: React.FC<MaskInputNodeProps> = ({ navigation, local, keyboardType, mask, editable = true, placeholder, label, setValue, value, isInvalid = false }) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        return (
            <Text style={[styles.label, isFocus && editable && { color: '#0047ab' }]}>
                {label}
            </Text>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {renderLabel()}
                <MaskedTextInput
                    style={[
                        styles.input,
                        isInvalid && styles.inputError,
                        isFocus && editable && { borderColor: '#0047ab' },
                        !editable && styles.inputDisabled, // Aplica estilo desabilitado
                    ]}
                    placeholder={!isFocus ? placeholder : '...'} // traduzir
                    placeholderTextColor={'#c7c7c7'}
                    mask={mask}
                    value={value}
                    onChangeText={(text, rawText) => {
                        if (editable) {
                            setValue(text, rawText);
                            setIsFocus(false);
                        }
                    }}
                    onFocus={() => editable && setIsFocus(true)}
                    onBlur={() => editable && setIsFocus(false)}
                    editable={editable}
                    keyboardType={keyboardType}
                />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default MaskInputComponent;

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
        color: 'black', // Cor padrão
    },
    input: {
        width: "100%",
        height: 50,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 16,
        backgroundColor: 'white', // Cor padrão
    },
    inputError: {
        borderColor: "red",
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0', // Fundo desabilitado
        borderColor: '#d3d3d3',    // Borda desabilitada
        color: '#a0a0a0',          // Texto desabilitado
    },
});
