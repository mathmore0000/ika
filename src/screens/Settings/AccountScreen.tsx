import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    Platform,
    Modal
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
import Toast from "react-native-toast-message";
import IconM from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/AntDesign';
import TextInputComponent from '@/components/forms/TextInput';
import MaskInputComponent from '@/components/forms/MaskTextInput';

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

    const [isEditPhotoModalVisible, setIsEditPhotoModalVisible] = useState(false);
    const imageRef = useRef(null); // Cria a referência

    useEffect(() => {
        if (!dateOfBirth) return;
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
                showErrorToast(t('permissions.cameraIsNeeded'));
            }

            // Solicitar permissões de biblioteca de mídia
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                showErrorToast(t('permissions.galleryIsNeeded'));
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
        try {
            imageRef.current?.setLoading(true)
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
                setIsEditPhotoModalVisible(false);
            } else {
                console.log('Usuário cancelou a seleção da imagem');
            }
        } catch (error) {
            console.log("Erro ao escolher foto: ", error);
            showErrorToast(t("user.choosePhotoError"));
        }
        finally{
            imageRef.current?.setLoading(false)
        }
    };

    // Função para tirar foto com a câmera
    const handleTakePhoto = async () => {
        try {
            imageRef.current?.setLoading(true)
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
                setIsEditPhotoModalVisible(false);
            } else {
                console.log('Usuário cancelou a captura da foto');
            }
        } catch (error) {
            console.log(error)
            console.log(error == "Error: Missing camera or camera roll permission")
            if (error == "Error: Missing camera or camera roll permission") {
                return showErrorToast(t('pemissions.missingCameraOrGallery'))
            }
            showErrorToast(t("user.takePhotoError"));
            console.log("Erro ao tirar foto:" + error);
        }
        finally{
            imageRef.current?.setLoading(false)
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
            <View className="flex flex-col items-center">
                <TouchableOpacity onPress={handleChoosePhoto}>
                    <RemoteImage
                        ref={imageRef}                    
                        uri={profilePicture}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
                <TouchableOpacity className="bg-primary p-3 rounded-full border-2 border-white" style={{ marginTop: -20 }} onPress={() => setIsEditPhotoModalVisible(true)}>
                    <IconM name="circle-edit-outline" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Nome de Exibição */}
            <View style={styles.fieldContainer}>
                <View className="flex-1">
                    <TextInputComponent
                        label={t('account.displayName')}
                        value={displayName}
                        setValue={setDisplayName}
                        navigation={null}
                        editable={isEditingName}
                        placeholder={t('account.enterFullName')}
                    />
                </View>
                {!isEditingName ? (
                    <TouchableOpacity className="border border-gray-500 rounded-md p-2 mt-2" onPress={() => setIsEditingName(true)}>
                        <IconM name="pencil-outline" size={22} color="#6b7280" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity className="bg-gray-500 rounded-md p-2 mt-2" onPress={handleSaveName} >
                        <IconM name="content-save-edit-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                )
                }
            </View>


            {/* Número de Telefone */}
            <View style={styles.fieldContainer}>
                <View className="flex-1">
                    <MaskInputComponent
                        label={t('account.phoneNumber')}
                        navigation={null}
                        mask="(99) 99999-9999"
                        value={phoneNumber}
                        editable={isEditingPhone}
                        setValue={(text, rawText) => setPhoneNumber(rawText)}
                        placeholder={t('account.phoneNumber')}
                        keyboardType="phone-pad"
                    />
                </View>
                {!isEditingPhone ? (
                    <TouchableOpacity className="border border-gray-500 rounded-md p-2 mt-2" onPress={() => setIsEditingPhone(true)}>
                        <IconM name="pencil-outline" size={22} color="#6b7280" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity className="bg-gray-500 rounded-md p-2 mt-2" onPress={handleSavePhoneNumber} >
                        <IconM name="content-save-edit-outline" size={22} color="#FFF" />
                    </TouchableOpacity>
                )
                }
            </View>

            {/* Data de Nascimento */}
            <View style={styles.fieldContainer}>
                <View className="flex-1">
                    <TextInputComponent
                        label={t('account.dateOfBirth')}
                        navigation={null}
                        value={dateOfBirthFormatted || t('account.notProvided')}
                        editable={false}
                        setValue={(text) => setDateOfBirth(text)}
                    />
                </View>
                {!isEditingPhone && (
                    <TouchableOpacity className="border border-gray-500 rounded-md p-2 mt-2" onPress={() => setIsEditingDOB(true)}>
                        <IconM name="pencil-outline" size={22} color="#6b7280" />
                    </TouchableOpacity>
                )
                }
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
                <IconM name="form-textbox-password" size={22} color="#FFF" />
                <Text style={styles.changePasswordButtonText}>{t('account.changePassword')}</Text>
            </TouchableOpacity>

            {/* Modal para Trocar Senha */}
            <ChangePasswordModal
                visible={isPasswordModalVisible}
                onClose={closeChangePasswordModal}
            />

            <Modal visible={isEditPhotoModalVisible} transparent={true} animationType="fade">
                <View className="flex-1 bg-[rgba(0,0,0,0.5)] flex justify-center items-center">
                    <View className="pop-up gap-3">
                        <View className="flex w-full flex-row items-center justify-between">
                            <Text className="font-bold text-xl">{t('account.changeProfilePhoto')}</Text>
                            <Icon name="close" size={20} onPress={() => setIsEditPhotoModalVisible(false)} />
                        </View>
                        <View className="flex flex-col gap-2 mt-4">
                            <TouchableOpacity onPress={handleTakePhoto} className="button-icon bg-primary">
                                <IconM name="camera-outline" color="#FFF" size={20} />
                                <Text className="text-white font-semibold">{t('account.takePhoto')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleChoosePhoto} className="button-icon border border-primary">
                                <IconM name="camera-burst" color="#23527c" size={20} />
                                <Text className='text-primary font-semibold'>{t('account.choosePhoto')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Toast />
            </Modal>
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilos para o componente
    container: {
        flex: 1,
        backgroundColor: '#FFF',
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
        gap: 10
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
        backgroundColor: '#23527c',
        padding: 15,
        borderRadius: 5,
        gap: 15,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
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
