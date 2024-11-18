// ChangePasswordModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '@/server/api';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  validatePassword,
} from "@/data/validations/auth/auth";
import Toast from "react-native-toast-message";
import TextInputComponent from '@/components/forms/TextInput';
import Icon from 'react-native-vector-icons/AntDesign';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotEqualError, setPasswordNotEqualError] = useState(false)
  const [passwordEmptyError, setPasswordEmptyError] = useState(false);
  const [passwordError, setPasswordError] = useState(false)

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordEmptyError(true)
      showErrorToast(t('account.enterAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotEqualError(true)
      showErrorToast(t('account.passwordsDoNotMatch'));
      return;
    }
    setPasswordError(validatePassword(newPassword) ? false : true);
    if (passwordError) return showErrorToast(t('account.passwordsNotStrongEnough'));

    try {
      await api.patch('/user/change-password', {
        oldPassword: currentPassword,
        newPassword
      });
      showSuccessToast(t('account.passwordUpdateSuccess'));
      // Limpar os campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordEmptyError(false)
      setPasswordError(false)
      setPasswordNotEqualError(false)
      onClose();
    } catch (error) {
      if (error.response.status == 401) {
        return showErrorToast(t('account.passwordUpdateWrongPasswordError'));
      }
      console.error('Error changing password:', error);
      showErrorToast(t('account.passwordUpdateError'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.modalBackground}>
          <View className="pop-up">
            <View className="flex w-full flex-row items-center justify-between">
              <Text className="font-bold text-xl">{t('account.changePassword')}</Text>
              <Icon name="close" size={20} onPress={onClose} />
            </View>
            <View className="flex flex-col gap-3 mt-4">
              <TextInputComponent
                secureTextEntry={true}
                label={t('account.currentPassword')}
                value={currentPassword}
                isInvalid={passwordEmptyError && !currentPassword}
                navigation={null}
                setValue={setCurrentPassword}
              />
              <TextInputComponent
                label={t('account.newPassword')}
                navigation={null}
                secureTextEntry
                isInvalid={!!passwordNotEqualError || (passwordEmptyError && !newPassword)}
                value={newPassword}
                setValue={setNewPassword}
              />
              <TextInputComponent
                label={t('account.confirmPassword')}
                secureTextEntry
                navigation={null}
                isInvalid={!!passwordError || (passwordEmptyError && !confirmPassword)}
                value={confirmPassword}
                setValue={setConfirmPassword}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={handleChangePassword} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    borderColor: "#23527c",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#23527c",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#23527c",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default ChangePasswordModal;
