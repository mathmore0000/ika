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
import * as ImagePicker from 'expo-image-picker';
import { getUser, updateUser } from '@/contexts/AuthContext';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ChangePasswordModal from './ChangePasswordModal'; // Importar o modal
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaskedTextInput } from 'react-native-mask-text';
import RemoteImage from "@/components/shared/RemoteImage";

const Account: React.FC<AccountProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const user = getUser();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isEditingName, setIsEditingName] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
    const [dateOfBirthFormatted, setDateOfBirthFormatted] = useState('')
    const [isEditingDOB, setIsEditingDOB] = useState(false);

    const [profilePicture, setProfilePicture] = useState(user?.avatarUrl || '');

    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

    useEffect(() => {
        setDateOfBirthFormatted(formatDate(dateOfBirth))
    }, [dateOfBirth]);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getUser();
            if (!currentUser) return
            setDisplayName(currentUser.displayName || '');
            setPhoneNumber(currentUser.phoneNumber || '');
            setProfilePicture(currentUser.avatarUrl || '');

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
        (async () => {
            // Solicitar permissões de câmera
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== 'granted') {
                showErrorToast('Permissão para acessar a câmera é necessária.');
            }

            // Solicitar permissões de biblioteca de mídia
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                showErrorToast('Permissão para acessar a biblioteca de fotos é necessária.');
            }
        })();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return dateString
        try {
            const dateStringSplit = dateString.split("-");
            if (dateStringSplit.length != 3) { return dateString }
            return `${dateStringSplit[2]}/${dateStringSplit[1]}/${dateStringSplit[0]}`
        } catch (error) { }
        return dateString
    }

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
    const handleChoosePhoto = async () => {
        console.log("handleChoosePhoto");
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const uri = asset.uri;
                setProfilePicture(uri);
                await uploadProfilePicture(uri);
            } else {
                console.log('Usuário cancelou a seleção da imagem');
            }
        } catch (error) {
            console.log("Erro ao escolher foto: ", error);
        }
    };

    // Função para tirar foto com a câmera
    const handleTakePhoto = async () => {
        console.log("handleTakePhoto");
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const uri = asset.uri;
                setProfilePicture(uri);
                await uploadProfilePicture(asset.uri);
                console.log("handleTakePhoto 6");
            } else {
                console.log('Usuário cancelou a captura da foto');
            }
        } catch (error) {
            console.log(error)
            console.log(error == "Error: Missing camera or camera roll permission")
            if (error == "Error: Missing camera or camera roll permission"){
                return showErrorToast("Erro")
            }
            console.log("Erro ao tirar foto:"+ error);
        }
    };

    // Função para fazer upload da foto de perfil
    const uploadProfilePicture = async (uri: string) => {
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri,
                name: filename || 'profile.jpg',
                type,
            });

            const response = await api.patch('/user/change-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('response', response)

            const newUrl = response.data; // Certifique-se de que o backend retorna a URL correta
            await updateUser({ avatarUrl: newUrl });
            showSuccessToast(t('account.photoUpdateSuccess'));
        } catch (error) {
            console.error('Erro ao enviar foto de perfil:', error.response.data);
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
                <RemoteImage
                    uri={profilePicture}
                    style={styles.profileImage}
                />
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
                            style={styles.input}
                            value={dateOfBirth}
                            onChangeText={(text) => setDateOfBirth(text)}
                            placeholder="YYYY-MM-DD"
                            keyboardType="numeric"
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.value}>{dateOfBirthFormatted || t('account.notProvided')}</Text>
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
