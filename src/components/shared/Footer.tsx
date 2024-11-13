import React from "react";
import { View, StyleSheet, Text } from "react-native";
import IconFooterNode from "@/components/intermediate/IconFooterNode";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";
import buttonsArr from "@/assets/mock/IconFooterMock.json";
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Icons = (navigation: any, local: string) => {
  const { t } = useTranslation();

  return buttonsArr.map((button: IconNodeProps, index: number) => {
    const isActiveIcon = button.destination === local; // Verifica se é o ícone central
    const insets = useSafeAreaInsets(); // Obter as margens seguras do dispositivo

    return (
      <View
        key={index}
        style={[styles.iconContainer,{ paddingBottom: insets.bottom}]}
      >
        <IconFooterNode
          destination={button.destination}
          icon={button.icon}
          navigation={navigation}
          central={isActiveIcon} // Passa se é o ícone central ou não
        />
        <Text className="text-xs" style={isActiveIcon && { color: "#23527c" }}>{t(`settings.${button.text}`)}</Text>
      </View>
    );
  });
};

const Footer: React.FC<{ navigation: any, local: string }> = ({ navigation, local }) => {
  return (
    <View style={styles.container}>
      {Icons(navigation, local)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderColor: "#d3d3d3",
    flexDirection: "row",
    backgroundColor: "#fff",
    gap: 2,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom:5
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Footer;
