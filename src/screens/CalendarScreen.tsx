import { StyleSheet, Text, View } from "react-native";
import AppLayout from "@/components/shared/AppLayout";
import { CalendarProps } from "@/constants/interfaces/props/Calendar";

const Chat: React.FC<CalendarProps> = ({ navigation, local="Calendar" }) => {
  return (
    <View style={styles.container}>
      <Text>Calendar</Text>
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Chat;
