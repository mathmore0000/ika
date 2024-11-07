import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppLayout from "@/components/shared/AppLayout"; // Footer ou layout do app
import { SettingsProps } from "@/constants/interfaces/props/Settings";
import Icon from "react-native-vector-icons/MaterialIcons";
import LanguageModal from './Settings/LanguageModal';
import i18n from '@/i18n';
import api from "@/server/api";
import { useTranslation } from 'react-i18next';
import { showSuccessToast } from "@/utils/toast";

const Settings: React.FC<SettingsProps> = ({ navigation, local = 'Settings' }) => {
  const { t } = useTranslation();
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const settingsOptions = [
  { title: "Cor Do Aplicativo", subtitle: "Personalize a aparência", destination: "AppColor", icon: "palette" },
  { title: "Permissões", subtitle: "Gerencie permissões de acesso", destination: "Permissions", icon: "lock" },
  { title: "Relatórios", subtitle: "Visualize e exporte relatórios", destination: "Reports", icon: "insert-drive-file" },
  { title: "Idioma", subtitle: "Selecione o idioma preferido", destination: "Language", icon: "language" },
  { title: "Contas", subtitle: "Gerencie suas contas e usuários", destination: "Accounts", icon: "supervisor-account" },
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
    <View className="flex-1 p-4">
      <View className="w-full flex flex-col gap-2">
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{...styles.settingItem}}
            onPress={() => handleNavigation(option.destination)}
          >
            <View className="flex flex-row items-center justify-between p-2 rounded-lg">
              <View className="flex flex-row items-center">
                <Icon name={option.icon} style={styles.icon} />
                <View className="flex flex-col">
                  <Text className="text-black font-bold">{option.title}{option.destination === 'Language' && " - "+selectedLanguage.toLocaleUpperCase()}</Text>                 
                  <Text className="text-black text-sm">{option.subtitle}</Text>
                </View>
              </View>
              <Icon name="keyboard-arrow-right" style={styles.icon} />
            </View>            
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
