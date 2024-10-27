import React from "react";
import { View, Text } from "react-native";
import { MedicationsProps } from "@/constants/interfaces/props/Medications";

const MedicationsScreen: React.FC<MedicationsProps> = ({ navigation }) => {
  return (
    <View>
        <Text>Medicamentos</Text>
    </View>
  );
};

export default MedicationsScreen;
