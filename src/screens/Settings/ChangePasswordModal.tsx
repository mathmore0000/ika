// ChangePasswordModal.tsx
import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from '@/server/api';
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  validatePassword,
} from "@/data/validations/auth/auth";
import Toast from "react-native-toast-message";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast(t('account.enterAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast(t('account.passwordsDoNotMatch'));
      return;
    }
    const passwordError = validatePassword(newPassword);
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
      onClose();
    } catch (error) {
      if (error.response.status == 401){
        return showErrorToast(t('account.passwordUpdateWrongPasswordError'));
      }
      console.error('Error changing password:', error);
      showErrorToast(t('account.passwordUpdateError'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('account.changePassword')}</Text>
          
          <TextInput
            style={styles.input}
            placeholder={t('account.currentPassword')}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            style={styles.input}
            placeholder={t('account.newPassword')}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder={t('account.confirmPassword')}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

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
    backgroundColor: "#483DF7",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF6347",
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
