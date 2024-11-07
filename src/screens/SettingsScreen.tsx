import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppLayout from "@/components/shared/AppLayout"; // Footer ou layout do app
import { SettingsProps } from "@/constants/interfaces/props/Settings";
import Icon from "react-native-vector-icons/MaterialIcons";

const settingsOptions = [
  { title: "Cor Do Aplicativo", subtitle: "Personalize a aparência", destination: "AppColor", icon: "palette" },
  { title: "Permissões", subtitle: "Gerencie permissões de acesso", destination: "Permissions", icon: "lock" },
  { title: "Relatórios", subtitle: "Visualize e exporte relatórios", destination: "Reports", icon: "insert-drive-file" },
  { title: "Idioma", subtitle: "Selecione o idioma preferido", destination: "Language", icon: "language" },
  { title: "Contas", subtitle: "Gerencie suas contas e usuários", destination: "Accounts", icon: "supervisor-account" },
];


const Settings: React.FC<SettingsProps> = ({ navigation, local = "Settings" }) => {

  const handleNavigation = (destination: string) => {
    navigation.navigate(destination); // Navega para a tela correspondente
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
                  <Text className="text-black font-bold">{option.title}</Text>
                  <Text className="text-black text-sm">{option.subtitle}</Text>
                </View>
              </View>
              <Icon name="keyboard-arrow-right" style={styles.icon} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <AppLayout navigation={navigation} local={local} />
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
    width: '100%', // Ocupa a largura total
    alignItems: "center", // Alinha o conteúdo no centro horizontalmente
  },
  settingItem: {
    width: "100%",
    height: 50,
    borderColor: "#000",
  },
  settingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    color: "#000",
    fontSize: 18,
    marginRight: 10,
  },
});

export default Settings;
