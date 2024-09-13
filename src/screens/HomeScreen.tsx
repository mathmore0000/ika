import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { HomeProps } from "@/constants/interfaces/props/Home";
import medicinesData from "@/assets/mock/MedicineMock.json";
import styles from "../assets/_public/styles"; // Estilos
import { getDaysArray, getDay, today, todayFormatted } from "@/utils/date"; // Função para obter os dias da semana

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const weekDays = getDaysArray(today); // Pega os dias da semana
  const [selectedDay, setSelectedDay] = useState(today.toISOString().split("T")[0]); // Estado do dia selecionado (começa com o dia atual)

  // Filtrar remédios para o dia selecionado
  const selectedMedicines = medicinesData.find(
    (data) => data.date === selectedDay
  )?.medicines || [];

  return (
    <View style={styles.container}>
      <View style={styles.blueCirclecontainer} />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hoje</Text>
        <Text style={styles.subHeaderText}>
          {todayFormatted}
        </Text>
      </View>

      {/* Cabeçalho com os dias da semana */}
      <View style={styles.calendarContainer}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDay(day.fullDate)}
            style={[
              styles.dayWrapper,
              selectedDay === day.fullDate && styles.highlightedDay,
            ]}
          >
            <Text style={[styles.dayText, selectedDay === day.fullDate && styles.highlightedText]}>
              {day.name.split(".")[0]}
            </Text>
            <View style={styles.dayContainer}>
              <Text style={styles.dayNumber}>{day.number}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>


      <View style={styles.cardsContainer}>
        {/* Exibição dos remédios */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          {selectedMedicines.length > 0 ? (
            selectedMedicines.map((medicine, index) => (
              <View key={index} style={medicine.status === "Tomado" ? styles.medicineCardTaken : styles.medicineCard}>
                <View>
                  <Text style={styles.timeText}>   {medicine.time}</Text>
                  <Text style={styles.medicineText}>{medicine.name}</Text>

                  {medicine.status === "Tomado" ? <Text style={{
                    color: "#000000",
                    fontSize: 18,
                  }}>Tomado</Text> : null}
                </View>
                {medicine.status === "Tomado" ? (
                  <Text style={styles.takenButton}>Tomado {medicine.takenTime}</Text> // O botão agora estará no rodapé
                ) : (
                  <Text style={styles.actionButton}>Tomar</Text> // O botão agora estará no rodapé
                )}
              </View>
            ))
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={styles.noMedicinesText}>Nenhum remédio para este dia</Text>
            </View>
          )}
        </ScrollView>
      </View>

    </View>
  );
};

export default Home;
