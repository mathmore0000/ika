import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppLayout from "@/components/shared/AppLayout"; // Footer ou layout do app
import { SettingsProps } from "@/constants/interfaces/props/Settings";
import Icon from "react-native-vector-icons/Ionicons";
import LanguageModal from './Settings/LanguageModal';
import i18n from '@/i18n';
import api from "@/server/api";
import { useTranslation } from 'react-i18next';
import { showSuccessToast } from "@/utils/toast";
import { logout } from '@/contexts/AuthContext';
import ReportsModal from "@/screens/Settings/ReportsModal"; // Importe o ReportsModal

const Settings: React.FC<SettingsProps> = ({ navigation, local = 'Settings' }) => {
  const { t } = useTranslation();
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isReportsModalVisible, setReportsModalVisible] = useState(false);
  const settingsOptions = [
    { title: t('settings.medications'), subtitle: t('settings.medicationsDescription'), destination: "Medications", icon: "medkit-outline" },
    { title: t('settings.calendar'), subtitle: t('settings.calendarDescription'), destination: "Calendar", icon: "calendar-outline" },
    { title: t('settings.responsibles'), subtitle: t('settings.responsiblesDescription'), destination: "Responsibles", icon: "person-outline" },
    { title: t('settings.notifications'), subtitle: t('settings.notificationsDescription'), destination: "Notifications", icon: "notifications-outline" },
    { title: t('settings.videos'), subtitle: t('settings.videosDescription'), destination: "Videos", icon: "videocam-outline" },
    { title: t('settings.reports'), subtitle: t('settings.reportsDescription'), destination: "Reports", icon: "reader-outline" },
    { title: t('settings.language'), subtitle: t('settings.languageDescription'), destination: "Language", icon: "language-outline" },
    { title: t('settings.account'), subtitle: t('settings.accountDescription'), destination: "Account", icon: "people-circle-outline" },
  ];

  const handleNavigation = (destination: string) => {
    if (destination === 'Language') {
      return setLanguageModalVisible(true);
    }
    if (destination == 'Reports') {
      return setReportsModalVisible(true)
    }
    navigation.navigate(destination);

  };

  // Função para logout
  const handleLogout = async () => {
    await logout();
  };

  const handleSelectLanguage = async (language: string) => {

    try {
      await api.patch('/user/locale', { locale: language });
      setSelectedLanguage(language);
      i18n.changeLanguage(language);
      showSuccessToast(t('user.localeAlterSuccess'))
    } catch (error) {
      // Aqui você pode lidar com o erro, por exemplo, mostrando uma mensagem ao usuário
      console.error('Error updating locale:', error);
    }
  };


  return (
    <View className="flex-1 p-4">
      <View className="w-full flex flex-col gap-2">
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{ ...styles.settingItem }}
            onPress={() => handleNavigation(option.destination)}
          >
            <View className="flex flex-row items-center justify-between p-2 rounded-lg">
              <View className="flex flex-row items-center">
                <Icon name={option.icon} style={styles.icon} />
                <View className="flex flex-col">
                  <Text className="text-black font-bold">{option.title}{option.destination === 'Language' && " - " + selectedLanguage.toLocaleUpperCase()}</Text>
                  <Text className="text-black text-sm">{option.subtitle}</Text>
                </View>
              </View>
              <Icon name="chevron-forward-outline" style={styles.icon} />
            </View>
          </TouchableOpacity>
        ))}
        {/* Botão de Logout */}
        <View className="border-b border-gray-300" />
        <TouchableOpacity onPress={handleLogout} style={styles.settingItem}>
          <View className="flex flex-row items-center p-2 rounded-lg">
            <Icon name="exit-outline" style={styles.icon} />
            <Text className="text-black font-bold">{t('account.logout')}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <AppLayout navigation={navigation} local={local} />




      {/* Language Modal */}
      <LanguageModal
        visible={isLanguageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Reports Modal */}
      <ReportsModal
        visible={isReportsModalVisible}
        onClose={() => setReportsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    width: '100%',
    alignItems: 'center',
    gap: 5,
    flexDirection: 'row',
  },
  logoutButtonText: {
    color: '#FF6347',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: "center", // Centraliza os elementos verticalmente
    alignItems: "center", // Centraliza os elementos horizontalmente
    paddingHorizontal: 20,
  },
  settingsList: {
    width: "100%",
    alignItems: "center",
  },
  settingItem: {
    width: "100%",
    height: 50,
    borderColor: "#000",
  },
  settingText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  languageText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    opacity: 0.8,
  },
  icon: {
    color: "#000",
    fontSize: 18,
    marginRight: 10,
  },
});

export default Settings;
