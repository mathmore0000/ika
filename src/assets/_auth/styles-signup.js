// styles.js
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
    borderWidth: 1,
    borderColor: "#FFF", // Borda padrão
  },
  inputError: {
    borderColor: "red", // Borda vermelha quando há erro
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 20,
  },
  button: {
    width: "80%", // Ajustei para ocupar 80% da largura
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20, // Adicionado para dar espaço acima do botão
  },
  buttonText: {
    color: "#0a0a24",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
