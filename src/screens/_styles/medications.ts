// medications.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  medicationItemSelected: {
    backgroundColor: "red"
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  addButton: {
    alignSelf: "flex-end",
    borderColor: "#23527c",
    borderWidth: 1,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#23527c",
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  stockButton: {
    marginTop: 10,
    flex: 1,
    padding: 10,
    backgroundColor: "#23527c",
    borderRadius: 5,
    alignItems: "center",
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#23527c",
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
  },
  stockButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  editButtonText: {
    color: "#23527c",
    fontSize: 14,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: '#000',
},
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2596be",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  dropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,   
    minHeight: 40,
  },
  dropdownContainer: {
    borderColor: "#ccc",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input_search: {
    height: 30,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  input_select: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
  },
  datePickerText: {
    fontSize: 16,
    color: "#007AFF",
    marginVertical: 10,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
});

export default styles;
