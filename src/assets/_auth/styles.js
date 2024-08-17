import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a24",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 50,
  },
  input: {
    width: "80%",
    height: 50,
    backgroundColor: "#222240",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    color: "#FFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  button: {
    width: "45%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#0a0a24",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
