import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addButton: {
        position: 'absolute',
        top: 16, // Adjust this to fit your design
        right: 16, // Adjust this to fit your design
        backgroundColor: '#007AFF', // Button color (adjust as needed)
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    profileImage: {
        width: 25,
        height: 25,
        borderRadius: 75,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#e9ecef",
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    nameText: {
        fontSize: 18,
        color: "#333",
    },
    acceptButton: {
        backgroundColor: "#28a745",
        padding: 10,
        borderRadius: 5,
    },
    removeButton: {
        backgroundColor: "#dc3545",
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});