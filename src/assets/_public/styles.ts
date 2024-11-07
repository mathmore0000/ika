import { Dimensions, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// Obter a largura da tela
const { width, height } = Dimensions.get('window');
// Definir tamanhos proporcionais com base na largura da tela
const buttonWidth = width * 0.12; // 12% da largura da tela para o botão
const buttonHeight = buttonWidth; // Botão circular, altura = largura
const borderRadius = buttonWidth / 2; // Raio circular baseado no tamanho do botão

export default StyleSheet.create({
    medicineCardTaken: {
        backgroundColor: "#fff", // Azul claro para os cartões
        width: "100%", // Faz o cartão ocupar a largura disponível
        height: 130, // Altura fixa para os cartões
        padding: 20, // Espaçamento interno
        justifyContent: "flex-start", // Iniciar o conteúdo do topo
        alignItems: "stretch", // Estica o conteúdo horizontalmente
    },
    medicineCard: {
        backgroundColor: "#010B40", // Azul claro para os cartões
        borderRadius: 15, // Bordas arredondadas
        padding: 20, // Espaçamento interno
        marginVertical: 15, // Espaçamento entre os cartões
        width: "100%", // Faz o cartão ocupar a largura disponível
        height: 150, // Altura fixa para os cartões
        justifyContent: "space-between", // Iniciar o conteúdo do topo
        alignItems: "stretch", // Estica o conteúdo horizontalmente
    },
    timeText: {
        color: "#000",
        fontSize: 18,
        fontWeight: "bold",
    },
    medicineText: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 18,
        marginTop: 10,
    },
    statusText: {
        color: "#A0B0E0", // Cor clara para o status "Tomado"
        fontSize: 14,
        marginTop: 10,
    },
    takenTime: {
        backgroundColor: "#A0B0E0", // Cor de fundo mais clara para indicar que está "Tomado"
        textAlign: "center",
        paddingVertical: 10,
        fontSize: 16,
        width: "100%", // O botão ocupa toda a largura do cartão
        alignSelf: "center", // Centralizar o botão
        borderBottomLeftRadius: 10, // Arredondar apenas as partes inferiores
        borderBottomRightRadius: 10, // Arredondar apenas as partes inferiores
        borderTopLeftRadius: 0, // Deixar as partes de cima retas
        borderTopRightRadius: 0, // Deixar as partes de cima retas
        color: "#FFFFFF", // Texto branco para o botão
        fontWeight: "bold",
    },
    takenButton: {
        color: "#FFFFFF",
        backgroundColor: "#010B40", // Cor mais clara para o botão "Tomar"
        textAlign: "center",
        borderBottomLeftRadius: 10, // Arredondar apenas as partes inferiores
        borderBottomRightRadius: 10, // Arredondar apenas as partes inferiores
        borderTopLeftRadius: 0, // Deixar as partes de cima retas
        borderTopRightRadius: 0, // Deixar as partes de cima retas
        paddingVertical: 10,
        fontSize: 16,
        width: "100%", // O botão ocupa toda a largura do cartão
        alignSelf: "stretch", // Garantir que o botão ocupe toda a largura
        position: "absolute", // Posiciona o botão
        bottom: 0, // Encosta o botão no final do cartão
        left: 0,
        right: 0,
    },
    actionButton: {
        color: "#FFFFFF",
        backgroundColor: "#483DF7", // Cor mais clara para o botão "Tomar"
        textAlign: "center",
        borderBottomLeftRadius: 10, // Arredondar apenas as partes inferiores
        borderBottomRightRadius: 10, // Arredondar apenas as partes inferiores
        borderTopLeftRadius: 0, // Deixar as partes de cima retas
        borderTopRightRadius: 0, // Deixar as partes de cima retas
        paddingVertical: 10,
        fontSize: 16,
        width: "110%", // O botão ocupa toda a largura do cartão
        alignSelf: "stretch", // Garantir que o botão ocupe toda a largura
        position: "absolute", // Posiciona o botão
        bottom: 0, // Encosta o botão no final do cartão
        left: 0,
        right: 0,
    },
    calendarContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
    cardsContainer: {
        marginTop: -5,
        marginBottom: 320
    },
    dayWrapper: {
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        borderRadius: 15,
        marginHorizontal: 5,
    },
    highlightedDay: {
        backgroundColor: "#192A56", // Cor de fundo do dia selecionado, abrangendo o nome e o número
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15, // Raio para o highlight pegar o nome e o número
    },
    dayText: {
        color: "#FFFFFF", // Cor padrão para o nome do dia
        fontSize: 18,
        marginBottom: 5,
        textTransform: "capitalize", // Faz a primeira letra ser maiúscula
        textAlign: "center", // Centraliza o texto horizontalmente
        fontWeight: "bold",
    },
    highlightedText: {
        color: "#FFFFFF", // Cor do texto para o nome do dia selecionado
        fontWeight: "bold",
    },
    dayContainer: {
        backgroundColor: "#FFFFFF", // Fundo branco para o número do dia
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#192A56",
    },
    dayNumber: {
        color: "#192A56", // Cor para o número do dia
        fontSize: 20,
        fontWeight: "bold",
    },
    header: {
        padding: 20, // Espaçamento maior
        backgroundColor: "#001F3F"
    },
    headerText: {
        color: "#FFFFFF",
        fontSize: 32, // Aumenta o tamanho da fonte
    },
    subHeaderText: {
        color: "#FFFFFF",
        fontSize: 22, // Aumenta o tamanho da data
        marginTop: 5, // Adiciona mais espaçamento entre o título e a data
    },
    noMedicinesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: height / 2
    },
    noMedicinesText: {
        color: "#000000",
        fontSize: 18, // Aumenta o tamanho da fonte
        fontWeight: "bold", // Deixa o texto em negrito
    },
    blueCirclecontainer: {
        backgroundColor: "#001F3F", // Fundo azul escuro
        width: 450,
        height: 300,
        position: "absolute",
        alignSelf: "center",
        borderRadius: borderRadius * 2
    },
    container: {
        flex: 1,
        backgroundColor: "#F2EDE9", // Fundo azul escuro
    },
});
