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

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hoje</Text>
        <Text style={styles.subHeaderText}>
          {todayFormatted}
        </Text>
      </View>

      {/* Cabeçalho com os dias da semana */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}
      >
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDay(day.fullDate)} // Atualiza o dia selecionado ao clicar
            style={[styles.dayContainer, selectedDay === day.fullDate && styles.highlightedDay]}
          >
            <Text style={styles.dayText}>{day.name}</Text>
            <Text style={styles.dayNumber}>{day.number}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exibição dos remédios */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {selectedMedicines.length > 0 ? (
          selectedMedicines.map((medicine, index) => (
            <View key={index} style={styles.medicineCard}>
              <Text style={styles.timeText}>{medicine.time}</Text>
              <Text style={styles.medicineText}>{medicine.name}</Text>
              {medicine.status === "Tomado" ? (
                <Text style={styles.statusText}>{medicine.status}</Text>
              ) : (
                <Text style={styles.actionButton}>{medicine.status}</Text>
              )}
              {medicine.takenTime ? (
                <Text style={styles.takenTime}>{medicine.takenTime}</Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.noMedicinesText}>Nenhum remédio para este dia</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Home;
