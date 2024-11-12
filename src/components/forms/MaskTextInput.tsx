import React, { useState } from 'react';
import { StyleSheet, Text, View} from 'react-native';
import { MaskedTextInput } from 'react-native-mask-text';
import { MaskInputNodeProps } from "@/constants/interfaces/props/MaskInput";

const MaskInputComponent: React.FC<MaskInputNodeProps> = ({ navigation, local, keyboardType, mask, editable, placeholder, label, setValue, value, isInvalid = false }) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
            return (
                <Text style={[styles.label, isFocus && { color: '#0047ab' }]}>
                    {label}
                </Text>
            );
    };

    return (
        <View style={styles.container}>
            {renderLabel()}
            <MaskedTextInput                        
                style={[styles.input, isInvalid && styles.inputError, isFocus && { borderColor: '#0047ab' }]}
                placeholder={!isFocus ? (placeholder) : '...'} //traduzir
                placeholderTextColor={'#c7c7c7'}
                mask={mask}                
                value={value}
                onChangeText={(text, rawText) => {
                        setValue(text, rawText);
                        setIsFocus(false);
                    }
                }
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                editable={editable}
                keyboardType={keyboardType}
            />
        </View>
    );
};

export default MaskInputComponent;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',
        paddingTop: 10
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
});