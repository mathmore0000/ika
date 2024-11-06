import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AppLayout from '@/components/shared/AppLayout';
import LanguageModal from './Settings/LanguageModal';
import { SettingsProps } from '@/constants/interfaces/props/Settings';
import i18n from '@/i18n';
import api from "@/server/api";
import { useTranslation } from 'react-i18next';
import { showSuccessToast } from "@/utils/toast";

const Settings: React.FC<SettingsProps> = ({ navigation, local = 'Settings' }) => {
  const { t } = useTranslation();
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const settingsOptions = [
    { title: t('settings.reports'), destination: 'Reports' },
    { title: t('settings.account'), destination: 'Account' },
    { title: t('settings.language'), destination: 'Language' },
  ];

  const handleNavigation = (destination: string) => {
    if (destination === 'Language') {
      setLanguageModalVisible(true);
    } else {
      navigation.navigate(destination);
    }
  };

  const handleSelectLanguage = async (language: string) => {

    try {
      await api.patch('/user/locale', { locale: language });
      setSelectedLanguage(language);
      i18n.changeLanguage(language);
      showSuccessToast(t('user.localeAlterSuccess'))
      showScu
    } catch (error) {
      // Aqui você pode lidar com o erro, por exemplo, mostrando uma mensagem ao usuário
      console.error('Error updating locale:', error);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.settingsList}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={() => handleNavigation(option.destination)}
          >
            <Text style={styles.settingText}>{option.title}</Text>
            {option.destination === 'Language' && (
              <Text style={styles.languageText}>{selectedLanguage}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <AppLayout navigation={navigation} local={local} />

      {/* Language Modal */}
      <LanguageModal
        visible={isLanguageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onSelectLanguage={handleSelectLanguage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE9",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  settingsList: {
    width: "100%",
    alignItems: "center",
  },
  settingItem: {
    backgroundColor: "#483DF7",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  languageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.8,
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default Settings;
