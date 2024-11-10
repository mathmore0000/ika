import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";

const IconNode: React.FC<IconNodeProps> = ({ navigation, destination, icon, central }) => {
  return (
    <TouchableOpacity
      style={styles.link}
      onPress={() => navigation.navigate(destination)}
    >
      <Icon
        name={icon}
        size={23}
        color={central ? "#23527c" : "#393939"}    
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
