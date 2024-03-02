import React from "react";
import { View, Text, StyleSheet } from "react-native";
import IconNode from "@/components/intermediate/IconNode";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";
import { FooterProps } from "@/constants/interfaces/props/Footer";
import buttonsArr from "@/assets/mock/IconFooterMock.json";

const Icons = (navigation: any) => {
  return buttonsArr.map((button: IconNodeProps, index: number) => {
    return (
      <IconNode
        key={index}
        destination={button.destination}
        icon={button.icon}
        navigation={navigation}
      />
    );
  });
};

const Footer: React.FC<FooterProps> = ({ navigation }) => {
  return <View style={styles.container}>{Icons(navigation)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Arrange children horizontally
    backgroundColor: "#eee",
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between", // Distribute space between children
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
});

export default Footer;
