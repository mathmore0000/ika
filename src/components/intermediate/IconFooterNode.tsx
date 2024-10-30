import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";

const IconNode: React.FC<IconNodeProps> = ({ navigation, destination, icon, central }) => {
  return (
    <TouchableOpacity
      style={styles.link}
      onPress={() => navigation.navigate(destination)}
    >
      <Icon
        name={icon}
        size={central ? 40 : 30} // Ícone central maior
        color="#FFFFFF" // Ícones brancos
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    padding: 10,
  },
});

export default IconNode;
