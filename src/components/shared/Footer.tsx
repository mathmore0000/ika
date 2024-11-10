import React from "react";
import { View, StyleSheet, Text } from "react-native";
import IconFooterNode from "@/components/intermediate/IconFooterNode";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";
import buttonsArr from "@/assets/mock/IconFooterMock.json";
import { useTranslation } from 'react-i18next';

const Icons = (navigation: any, local: string) => {
  const { t } = useTranslation(); 

  return buttonsArr.map((button: IconNodeProps, index: number) => {
    const isActiveIcon = button.destination === local; // Verifica se é o ícone central

    return (
      <View
        key={index}
        style={styles.iconContainer}
      >
        <IconFooterNode
          destination={button.destination}
          icon={button.icon}
          navigation={navigation}
          central={isActiveIcon} // Passa se é o ícone central ou não
        />
        <Text className="text-xs" style={isActiveIcon && {color: "#23527c"}}>{t(`settings.${button.text}`)}</Text>
      </View>
    );
  });
};

const Footer: React.FC<{ navigation: any, local: string }> = ({ navigation, local }) => {
  return <View style={styles.container}>{Icons(navigation, local)}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: "#d3d3d3",
    flexDirection: "row",
    backgroundColor: "#fff", // Azul escuro para o fundo
    padding: 10,
    gap: 2,
    alignItems: "center",
    justifyContent: "space-around", // Ícones distribuídos
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // Altura do footer
  },
  iconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7
  },
  centralIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30, // Eleva o ícone central
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#23527c", // Cor mais escura para o ícone central
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default Footer;
