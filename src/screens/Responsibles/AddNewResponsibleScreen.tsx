// AddNewResponsibleScreen.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { validateEmail } from "@/data/validations/auth/auth";
import { useTranslation } from 'react-i18next';
import TextInputComponent from '@/components/forms/TextInput';
import Icon from 'react-native-vector-icons/AntDesign';

export default function AddNewResponsibleScreen({ BASE_URL, closeModal, fetchResponsibles, fetchSupervisedUsers }) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const handleInvite = async () => {
        const newErrors: { [key: string]: string } = {};
        const emailError = validateEmail(email);
        if (emailError) {
            newErrors.email = emailError;
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            await api.post(BASE_URL, null, {
                params: { emailResponsible: email },
            });
            showSuccessToast(t("responsibles.userInvited"));
            fetchResponsibles();
            fetchSupervisedUsers();
            closeModal();
        } catch (error) {
            console.log(error.response?.data || error.message);
            if (error.response.data == "User not found") {
                return showErrorToast(t("responsibles.userNotFound"));
            }
            if (error.response.data == "Responsible not found") {
                return showErrorToast(t("responsibles.responsibleNotFound"));
            }
            if (error.response.status == 409) {
                return showErrorToast(t("responsibles.inviteAlreadyExists"));
            }
            console.log(error.response.data);
            showErrorToast(t("responsibles.errorInvitingUser"));
        }
    };

    return (
        <View style={styles.modalContainer}>
            <View className="flex flex-row w-full items-center justify-between pb-3">
                <Text className="font-bold text-xl">{t("responsibles.inviteResponsible")}</Text>
                <TouchableOpacity
                    onPress={closeModal}
                >
                    <Icon name="close" size={25} color="#000" />
                </TouchableOpacity>
            </View>
            <View className="container-input w-full">
                <TextInputComponent
                    isInvalid={!!errors.email}
                    label={t("auth.login.email")}
                    placeholder={t("responsibles.enterEmail")}
                    value={email}
                    setValue={setEmail}
                    navigation={null}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <TouchableOpacity className="bg-primary w-full button-icon" onPress={handleInvite}>
                <Icon name="mail" size={20} color="#fff" />
                <Text className="text-white font-semibold">{t("responsibles.sendInvite")}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    inputError: {
        borderColor: "red",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 10,
    },
    modalContainer: {
        alignItems: 'center',
        gap: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 5,
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
});
