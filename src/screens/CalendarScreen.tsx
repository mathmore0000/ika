import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import styles from "../assets/_public/styles";
import api from "@/server/api";
import AppLayout from "@/components/shared/AppLayout";
import { getDaysArray, today, todayFormatted } from "@/utils/date";
import dayjs from "dayjs";

const CalendarScreen = ({ navigation, local = "Calendar" }) => {
  const weekDays = getDaysArray(today);
  const [selectedDay, setSelectedDay] = useState(today.toISOString().split("T")[0]);
  const [userMedications, setUserMedications] = useState([]);
  const [usages, setUsages] = useState([]);
  const [dailyDoses, setDailyDoses] = useState([])

  useEffect(() => {
    fetchUserMedications();
    fetchUsages(dayjs(selectedDay).format("YYYY-MM-DDTHH:mm:ss"));
    fetchDailyDoses();
  }, [selectedDay]);

  const fetchDailyDoses = async () => {
    // Combina e ordena todos os horários de dose
    const dailyDoses = userMedications
      .flatMap((userMedication) => calculateDoseTimes(userMedication))
      .sort((a, b) => (a.time > b.time ? 1 : -1))

    const dailyDosesWithExpirationDate = await mountAllCards(dailyDoses)

    setDailyDoses(dailyDosesWithExpirationDate);
  }
  const fetchUserMedications = async () => {
    try {
      const response = await api.get("/user-medications", { params: { page: 0, size: 50 } });
      setUserMedications(response.data.content);
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
    }
  };

  const fetchUsages = async (date) => {
    try {
      const response = await api.get("/usages/user", { params: { fromDate: date, toDate: date } });
      setUsages(response.data.content);
    } catch (error) {
      console.error("Erro ao carregar usos:", error);
    }
  };

  const fetchNextExpirationStock = async (medicationId) => {
    try {
      const response = await api.get(`/user-medication-stocks/next-expiration/${medicationId}`)
      return response.data
    } catch (error) {
    }
  }

  const calculateDoseTimes = (userMedication) => {
    const doseTimes = [];
    let doseTime = dayjs(userMedication.firstDosageTime);
    const interval = userMedication.timeBetween;
    const initialDoseTimePlus1 = doseTime.add(1, "day");

    do {
      doseTimes.push({
        medication: userMedication.medication,
        time: doseTime.format("HH:mm"),
        isTaken: userMedication.isTaken,
        isExpiringSoon: userMedication.isExpiringSoon,
        type: "dose"
      });
      doseTime = doseTime.add(interval, "hour");
    } while (!doseTime.isSame(initialDoseTimePlus1, "minute"));

    return doseTimes;
  };

  const mountAllCards = async (dailyDoses) => {
    const allMedicationIds = new Set(dailyDoses.map((dose) => dose.medication.id));
    const medicationIdNextExpirationRelation = new Map();

    for (const id of allMedicationIds) {
      const expirationDate = await fetchNextExpirationStock(id);
      medicationIdNextExpirationRelation.set(id, expirationDate);
    }
    let i = 0
    while (i < dailyDoses.length) {
      dailyDoses[i].nextExpirationDate = medicationIdNextExpirationRelation.get(dailyDoses[i].medication.id);
      i++;
    }
    return dailyDoses;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Seção de cabeçalho */}
      <View style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Hoje</Text>
        <Text>{todayFormatted}</Text>
      </View>

      {/* Cabeçalho dos dias da semana */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingHorizontal: 16 }}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDay(day.fullDate)}
            style={{
              padding: 8,
              borderBottomWidth: selectedDay === day.fullDate ? 2 : 0,
              borderBottomColor: selectedDay === day.fullDate ? "blue" : "transparent",
            }}
          >
            <Text>{day.name.split(".")[0]}</Text>
            <Text>{day.number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo de rolagem para os cartões de medicamentos */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}>
        {dailyDoses.length > 0 ? (
          dailyDoses.map((dose, index) => (
            <View
              key={`${dose.medication.id}-${dose.time}-${index}`}
              style={{
                padding: 12,
                marginVertical: 8,
                borderWidth: 1,
                borderColor: "grey",
                borderRadius: 8,
                backgroundColor: dose.isExpiringSoon ? "rgba(255, 100, 100, 0.1)" : "white",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{dose.medication.name}</Text>
              <Text style={{ fontSize: 14 }}>Hora: {dose.time}</Text>
              <Text>Próxima expiração -> {dose.nextExpirationDate}</Text>
              <Text style={{ fontSize: 14, color: dose.isTaken ? "green" : "orange" }}>
                {dose.isTaken ? "Tomado" : "A tomar"}
              </Text>
              <Text>
                {dose.type}
              </Text>
              <TouchableOpacity onPress={() => console.log("tomando...")}>
                <Text style={{ color: "blue" }}>{dose.isTaken ? "Tomado" : "Tomar"}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>Nenhum medicamento para este dia</Text>
        )}
      </ScrollView>

      {/* Layout do rodapé fixo */}
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};

export default CalendarScreen;
