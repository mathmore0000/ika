import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import AppLayout from "@/components/shared/AppLayout"; // Footer ou layout do app
import { SettingsProps } from "@/constants/interfaces/props/Settings";

const settingsOptions = [
  { title: "Cor Do Aplicativo", destination: "AppColor" },
  { title: "Permissões", destination: "Permissions" },
  { title: "Relatórios", destination: "Reports" },
  { title: "Contas", destination: "Accounts" },
  { title: "Idioma", destination: "Language" },
];

const Settings: React.FC<SettingsProps> = ({ navigation, local = "Settings" }) => {

  const handleNavigation = (destination: string) => {
    navigation.navigate(destination); // Navega para a tela correspondente
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
    backgroundColor: "#F2EDE9",
    justifyContent: "center", // Centraliza os elementos verticalmente
    alignItems: "center", // Centraliza os elementos horizontalmente
    paddingHorizontal: 20,
  },
  settingsList: {
    width: '100%', // Ocupa a largura total
    alignItems: "center", // Alinha o conteúdo no centro horizontalmente
  },
  settingItem: {
    backgroundColor: "#483DF7", // Azul claro
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: "90%", // Ocupa 90% da largura da tela
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default Settings;
