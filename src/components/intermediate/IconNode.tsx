import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { IconNodeProps } from "@/constants/interfaces/props/IconNode";
import Icon from "react-native-vector-icons/MaterialIcons";

const IconNode: React.FC<IconNodeProps> = ({
  destination,
  icon,
  navigation, //: { navigate }, // destructure the navigate method from the navigation prop
}) => {
  return (
    <TouchableOpacity
      style={styles.link}
      onPress={() => navigation.navigate(destination)}
    >
      <Icon name={icon} size={30} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderWidth: 1,
  },
  linkText: {
    fontSize: 16,
    color: "#007BFF",
  },
});

export default IconNode;
