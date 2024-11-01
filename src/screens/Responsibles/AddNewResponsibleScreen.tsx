import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import api from "@/server/api";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { validateEmail } from "@/data/validations/auth/auth";

export default function AddNewResponsibleScreen({ BASE_URL, closeModal, fetchResponsibles, fetchSupervisedUsers }) {
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
            showSuccessToast("Usuário convidado.");
            fetchResponsibles();
            fetchSupervisedUsers();
            closeModal(); // Close the modal after successful invite
        } catch (error) {
            console.log(error.response?.data || error.message);
            if (error.response.data == "User not found") {
                return showErrorToast("Usuário não encontrado")
            }
            console.log()
            if (error.response.status == 409) {
                return showErrorToast("Convite já existe")
            }
            console.log(error.response.data)
            showErrorToast("Erro ao convidar o usuário.");
        }
    };

    return (
        <View style={styles.modalContainer}>
            <Text style={styles.title}>Invite Responsible</Text>

            <TextInput
                style={[
                    styles.input,
                    errors.email && styles.inputError,
                ]}
                placeholder="Enter email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TouchableOpacity style={styles.sendButton} onPress={handleInvite}>
                <Text style={styles.sendButtonText}>Send Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Cancel</Text>
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
