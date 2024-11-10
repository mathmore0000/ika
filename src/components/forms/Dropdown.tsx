import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
// import AntDesign from '@expo/vector-icons/AntDesign';
import { DropdownNodeProps } from "@/constants/interfaces/props/Dropdown";

const DropdownComponent: React.FC<DropdownNodeProps> = ({navigation, local, data, placeholder, label, setValue, value, search = false, isInvalid = true}) => {
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
        if (value || isFocus) {
            return (
                <Text style={[styles.label, isFocus && { color: '#0047ab' }]}>
                    {label}
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {renderLabel()}
            <Dropdown
                style={[styles.dropdown, isInvalid && { borderColor: 'red' }, isFocus && { borderColor: '#0047ab' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search={search}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? (placeholder || 'Selecione') : '...'}//traduzir
                searchPlaceholder="Search..."//traduzir
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
                // renderLeftIcon={() => (
                //     <AntDesign
                //         style={styles.icon}
                //         color={isFocus ? 'blue' : 'black'}
                //         name="Safety"
                //         size={20}
                //     />
                // )}
            />
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',        
        width: '100%',
        paddingTop: 10
    },
    dropdown: {
        height: 50,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
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
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});