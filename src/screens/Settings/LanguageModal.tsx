// LanguageModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";

interface LanguageModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectLanguage: (language: string) => void;
  }
  
const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose, onSelectLanguage }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages = [
    { label: t('languages.portuguese'), value: 'pt' },
    { label: t('languages.english'), value: 'en' },
    { label: t('languages.spanish'), value: 'es' },
  ];

  const handleSelectLanguage = (language: string) => {
    setSelectedLanguage(language);
    onSelectLanguage(language);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.value}
              style={[
                styles.languageOption,
                selectedLanguage === language.value && styles.selectedLanguage,
              ]}
              onPress={() => handleSelectLanguage(language.value)}
            >
              <Text style={styles.languageText}>{language.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
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
      width: "80%",
      backgroundColor: "#FFF",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
    },
    languageOption: {
      padding: 15,
      width: "100%",
      alignItems: "center",
      backgroundColor: "#EAEAEA",
      borderRadius: 5,
      marginBottom: 10,
    },
    selectedLanguage: {
      backgroundColor: "#483DF7",
    },
    languageText: {
      color: "#333",
      fontSize: 16,
    },
    closeButton: {
      marginTop: 15,
      backgroundColor: "#FF6347",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
    },
    closeButtonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
  });

export default LanguageModal;