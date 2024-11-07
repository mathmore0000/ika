import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccountProps } from "@/constants/interfaces/props/Account";
import api from '@/server/api';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { getUser, updateUser } from '@/contexts/AuthContext';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ChangePasswordModal from './ChangePasswordModal'; // Importar o modal
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaskedTextInput } from 'react-native-mask-text';

const Account: React.FC<AccountProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const user = getUser();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isEditingName, setIsEditingName] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
    const [isEditingDOB, setIsEditingDOB] = useState(false);

    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getUser();
            if (!currentUser) return

            setDisplayName(currentUser.displayName || '');
            setPhoneNumber(currentUser.phoneNumber || '');
            setProfilePicture(currentUser.profilePicture || '');

            if (!currentUser.dateOfBirth) {
                return setDateOfBirth('');
            }
            if (typeof currentUser.dateOfBirth === 'string') {
                return setDateOfBirth(currentUser.dateOfBirth);
            }
            if (typeof currentUser.dateOfBirth === 'number') {
                const date = new Date(currentUser.dateOfBirth);
                const formattedDate = date.toISOString().split('T')[0];
                return setDateOfBirth(formattedDate);
            }
            setDateOfBirth('');

        };

        fetchUser();
    }, []);

    useEffect(() => {
        console.log("mudança", dateOfBirth)
    }, [dateOfBirth]);


    // Função para salvar o nome atualizado
    const handleSaveName = async () => {
        if (displayName.trim().length < 2 || displayName.trim().length > 50) {
            showErrorToast(t('account.nameUpdateError'));
            return;
        }
        try {
            await api.patch('/user/display-name', { displayName });
            await updateUser({ displayName });
            setIsEditingName(false);
            showSuccessToast(t('account.nameUpdateSuccess'));
        } catch (error) {
            console.error('Error updating name:', error);
            showErrorToast(t('account.nameUpdateError'));
        }
    };

    // Função para salvar o número de telefone atualizado
    const handleSavePhoneNumber = async () => {
        const phoneRegex = /^[0-9]{10,15}$/; // Ajuste conforme necessário
        const numericPhone = phoneNumber.replace(/\D/g, '');
        if (!phoneRegex.test(numericPhone)) {
            showErrorToast(t('account.invalidPhoneNumber'));
            return;
        }

        try {
            await api.patch('/user/phone-number', { phoneNumber: numericPhone });
            await updateUser({ phoneNumber: numericPhone });
            setIsEditingPhone(false);
            showSuccessToast(t('account.phoneNumberUpdateSuccess'));
        } catch (error) {
            console.error('Error updating phone number:', error);
            showErrorToast(t('account.phoneNumberUpdateError'));
        }
    };

    // Função para salvar a data de nascimento atualizada
    const handleSaveDateOfBirth = async (dateOfBirth: string) => {
        if (!isValidDate(dateOfBirth)) {
            showErrorToast(t('account.dateOfBirthUpdateError'));
            return;
        }
        try {
            const birthDate = new Date(dateOfBirth)
            birthDate.setDate(birthDate.getDate() + 1)
            await api.patch('/user/date-of-birth', { dateOfBirth: birthDate.toISOString().split('T')[0] });
            await updateUser({ dateOfBirth });
            showSuccessToast(t('account.dateOfBirthUpdateSuccess'));
        } catch (error) {
            console.error('Error updating date of birth:', error);
            showErrorToast(t('account.dateOfBirthUpdateError'));
        }
    };

    const isValidDate = (dateString: string) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;

        const date = new Date(dateString);
        const timestamp = date.getTime();

        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;

        if (date.toISOString().slice(0, 10) !== dateString) return false;

        const today = new Date();
        if (date > today) return false;

        return true;
    };

    // Função para escolher foto da galeria
    const handleChoosePhoto = () => {
        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.error('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                setProfilePicture(uri);
                await uploadProfilePicture(uri);
            }
        });
    };

    // Função para tirar foto com a câmera
    const handleTakePhoto = () => {
        launchCamera({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorMessage) {
                console.error('Camera Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const uri = response.assets[0].uri;
                setProfilePicture(uri);
                await uploadProfilePicture(uri);
            }
        });
    };

    // Função para fazer upload da foto de perfil
    const uploadProfilePicture = async (uri: string) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', {
                uri,
                name: 'profile.jpg',
                type: 'image/jpeg',
            });
            await api.patch('/v1/user/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUser({ profilePicture: uri });
            showSuccessToast(t('account.photoUpdateSuccess'));
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showErrorToast(t('account.photoUpdateError'));
        }
    };

    // Função para abrir o modal de troca de senha
    const openChangePasswordModal = () => {
        setPasswordModalVisible(true);
    };

    // Função para fechar o modal de troca de senha
    const closeChangePasswordModal = () => {
        setPasswordModalVisible(false);
    };

    // Função para lidar com a mudança da data no Date Picker
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setIsEditingDOB(false)
        if (event.type == "set") {
            const formattedDatePlus1 = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            const formattedDatePlus1Splitted = formattedDatePlus1.split("-")
            const day = (Number(formattedDatePlus1Splitted[2]) - 1) < 10 ? `0${Number(formattedDatePlus1Splitted[2]) - 1}` : Number(formattedDatePlus1Splitted[2]) - 1
            const formattedDate = `${formattedDatePlus1Splitted[0]}-${formattedDatePlus1Splitted[1]}-${day}`
            setDateOfBirth(formattedDate);
            handleSaveDateOfBirth(formattedDate);
        }
    };

    return (
        <View style={styles.container}>
            {/* Foto de Perfil */}
            <TouchableOpacity onPress={handleChoosePhoto}>
                {profilePicture ? (
                    <Image source={{ uri: profilePicture }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>{t('account.addPhoto')}</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleTakePhoto} style={styles.button}>
                    <Text style={styles.buttonText}>{t('account.takePhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChoosePhoto} style={styles.button}>
                    <Text style={styles.buttonText}>{t('account.choosePhoto')}</Text>
                </TouchableOpacity>
            </View>

            {/* Nome de Exibição */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('account.displayName')}:</Text>
                {isEditingName ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder={t('account.displayName')}
                        />
                        <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.value}>{displayName}</Text>
                        <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editButton}>
                            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Número de Telefone */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('account.phoneNumber')}:</Text>
                {isEditingPhone ? (
                    <>
                        <MaskedTextInput
                            mask="(99) 99999-9999"
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={(text, rawText) => setPhoneNumber(rawText)}
                            placeholder={t('account.phoneNumber')}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity onPress={handleSavePhoneNumber} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.value}>{phoneNumber ? `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}` : t('account.notProvided')}</Text>
                        <TouchableOpacity onPress={() => setIsEditingPhone(true)} style={styles.editButton}>
                            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Data de Nascimento */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('account.dateOfBirth')}:</Text>
                {isEditingDOB ? (
                    <>
                        <MaskedTextInput
                            mask="9999-99-99"
                            style={styles.input}
                            value={dateOfBirth}
                            onChangeText={(text) => setDateOfBirth(text)}
                            placeholder="YYYY-MM-DD"
                            keyboardType="numeric"
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.value}>{dateOfBirth || t('account.notProvided')}</Text>
                        <TouchableOpacity onPress={() => setIsEditingDOB(true)} style={styles.editButton}>
                            <Text style={styles.editButtonText}>{t('common.edit')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {isEditingDOB && (
                <DateTimePicker
                    value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()} // A data de nascimento não pode ser no futuro
                />
            )}

            {/* Trocar Senha */}
            <TouchableOpacity onPress={openChangePasswordModal} style={styles.changePasswordButton}>
                <Text style={styles.changePasswordButtonText}>{t('account.changePassword')}</Text>
            </TouchableOpacity>

            {/* Modal para Trocar Senha */}
            <ChangePasswordModal
                visible={isPasswordModalVisible}
                onClose={closeChangePasswordModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilos para o componente
    container: {
        flex: 1,
        backgroundColor: '#F2EDE9',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    placeholderImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#CCC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#FFF',
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    button: {
        backgroundColor: '#483DF7',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
    },
    fieldContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    value: {
        fontSize: 16,
        flex: 2,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        padding: 10,
        width: 200,
        flex: 2,
    },
    editButton: {
        marginLeft: 10,
    },
    editButtonText: {
        color: '#483DF7',
        fontSize: 16,
    },
    saveButton: {
        marginLeft: 10,
    },
    saveButtonText: {
        color: '#483DF7',
        fontSize: 16,
    },
    changePasswordButton: {
        marginTop: 30,
        backgroundColor: '#FFA500',
        padding: 15,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
    },
    changePasswordButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 5,
        padding: 10,
        width: 200,
    },
    dateText: {
        fontSize: 16,
        color: '#000',
    },
});

export default Account;
