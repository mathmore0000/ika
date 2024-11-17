// LanguageModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Ionicons";
import IconAnt from "react-native-vector-icons/AntDesign";

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (language: string) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose, onSelectLanguage }) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const languages = [
    { label: t('languages.portuguese'), value: 'pt', src: require('../../assets/images/brazil.png') },
    { label: t('languages.english'), value: 'en', src: require('../../assets/images/usa.png') },
    { label: t('languages.spanish'), value: 'es', src: require('../../assets/images/spain.png') },
  ];

  const handleSelectLanguage = (language: string) => {
    setSelectedLanguage(language);
    onSelectLanguage(language);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View className='pop-up'>
          <View className="flex w-full flex-row items-center justify-between">
            <Text className="font-bold text-xl">{t('languages.selectLanguage')}</Text>
            <IconAnt name="close" size={20} onPress={onClose} />
          </View>
          <View className="flex w-full flex-col gap-1">
            {languages.map((language) => (
              <TouchableOpacity
                key={language.value}
                className="flex w-full rounded-md flex-row items-center justify-between py-3"
                style={[
                  selectedLanguage === language.value && styles.selectedLanguage,
                ]}
                onPress={() => handleSelectLanguage(language.value)}
              >
                <View className='flex flex-row items-center gap-3'>
                  <Image source={language.src} style={{ width: 35, height: 26 }} />
                  <Text className="">{language.label}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={20}/>
              </TouchableOpacity>
            ))}
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
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    gap: 20
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
    backgroundColor: "#e5e7eb",
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