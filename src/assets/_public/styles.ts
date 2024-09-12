import { StyleSheet } from "react-native";

export default StyleSheet.create({
    header: {
        padding: 20, // Espaçamento maior
        backgroundColor: "#001F3F",
        alignItems: "left",
    },
    headerText: {
        color: "#FFFFFF",
        fontSize: 28, // Aumenta o tamanho da fonte
        fontWeight: "bold", // Negrito
    },
    subHeaderText: {
        color: "#FFFFFF",
        fontSize: 18, // Aumenta o tamanho da data
        marginTop: 10, // Adiciona mais espaçamento entre o título e a data
    },
    calendarContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // Melhor espaçamento entre os dias
        paddingHorizontal: 15,
        paddingVertical: 20, // Aumentei o padding vertical para mais espaçamento
    },
    highlightedDay: {
        backgroundColor: "#4F628E",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
    },
    dayContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: "#192A56",
    },
    medicineCard: {
        backgroundColor: "#192A56",
        borderRadius: 10,
        padding: 15,
        marginVertical: 15, // Aumentei a margem vertical para separar mais os cartões
        marginHorizontal: 20,
        flex: 1,
    },
    timeText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    medicineText: {
        color: "#FFFFFF",
        fontSize: 16,
        marginTop: 10,
    },
    statusText: {
        color: "#B0C4DE",
        fontSize: 14,
        marginTop: 10,
    },
    takenTime: {
        color: "#B0C4DE",
        fontSize: 14,
        marginTop: 5,
    },
    actionButton: {
        color: "#FFFFFF",
        backgroundColor: "#4F628E",
        textAlign: "center",
        borderRadius: 5,
        paddingVertical: 5,
        marginTop: 10,
        fontSize: 16,
    },
    noMedicinesText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 16,
        marginTop: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#001F3F", // Fundo azul escuro
    },
});
