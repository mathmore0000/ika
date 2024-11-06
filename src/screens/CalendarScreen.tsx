// CalendarScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import api from "@/server/api";
import AppLayout from "@/components/shared/AppLayout";
import { getDaysArray, today, todayFormatted } from "@/utils/date";
import TakeMedicationModal from "./Usage/Creation/TakeMedicationModal"; // Import the modal
import { useTranslation } from "react-i18next";

const CalendarScreen = ({ navigation, local = "Calendar" }) => {
  const { t } = useTranslation();
  const weekDays = getDaysArray(today);
  const [selectedDay, setSelectedDay] = useState(today.toISOString().split("T")[0]);
  const [userMedications, setUserMedications] = useState([]);
  const [usages, setUsages] = useState([]);
  const [dailyDoses, setDailyDoses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState(null);

  const minutesTimeBetweenRelation = { 0.5: 30, 1: 60 };

  useEffect(() => {
    loadDay();
  }, [selectedDay]);

  useEffect(() => {
    if (userMedications.length > 0) {
      fetchDailyDoses();
    }
  }, [userMedications, usages]);

  const loadDay = async () => {
    fetchUserMedications();
    fetchUsages(selectedDay);
  }

  const fetchDailyDoses = async () => {
    const dailyDosesArray = userMedications.flatMap((userMedication) => calculateDoseTimes(userMedication));
    const dailyDosesWithExpirationDate = await mountAllCards(dailyDosesArray);

    const dailyDosesOrdered = dailyDosesWithExpirationDate.sort((a, b) => {
      const aTime = a.datetime.getHours() * 60 + a.datetime.getMinutes();
      const bTime = b.datetime.getHours() * 60 + b.datetime.getMinutes();
      return aTime - bTime;
    });

    setDailyDoses(dailyDosesOrdered);
  };

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
      const dateObj = new Date(date);
      const toDate = new Date(dateObj);
      toDate.setDate(toDate.getDate() + 1);
      const response = await api.get("/usages/user", {
        params: { fromDate: dateObj.toISOString(), toDate: toDate.toISOString() },
      });
      setUsages(response.data.content);
    } catch (error) {
      console.log(error.response?.data);
      console.error("Erro ao carregar usos:", error);
    }
  };

  const fetchNextExpirationStock = async (medicationId) => {
    try {
      const response = await api.get(`/user-medication-stocks/next-expiration/${medicationId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter data de expiração:", error);
    }
  };

  const calculateDoseTimes = (userMedication) => {
    const doseTimes = [];
    const firstDoseTime = new Date(userMedication.firstDosageTime);
    const interval = userMedication.timeBetween;
    const initialDoseTimePlus1 = new Date(firstDoseTime);
    initialDoseTimePlus1.setDate(initialDoseTimePlus1.getDate() + 1);

    let doseTime = new Date(firstDoseTime);

    do {
      const datetimeForDose = new Date(new Date(selectedDay).setHours(new Date(doseTime).getHours()))
      datetimeForDose.setDate(datetimeForDose.getDate() + 1)
      doseTimes.push({
        medication: userMedication.medication,
        datetime: new Date(doseTime),
        trueDateTime: datetimeForDose,
        time: formatTime(doseTime),
        isTaken: userMedication.isTaken,
        isExpiringSoon: userMedication.isExpiringSoon,
        maxTakingTime: userMedication.maxTakingTime,
        disabled: userMedication.disabled,
        type: "dose",
      });
      doseTime.setHours(doseTime.getHours() + interval);
    } while (doseTime < initialDoseTimePlus1);

    return doseTimes;
  };

  const mountAllCards = async (dailyDosesArray) => {
    const allMedicationIds = new Set(dailyDosesArray.map((dose) => dose.medication.id));
    const medicationIdNextExpirationRelation = new Map();

    for (const id of allMedicationIds) {
      const expirationDate = await fetchNextExpirationStock(id);
      medicationIdNextExpirationRelation.set(id, expirationDate);
    }

    dailyDosesArray.forEach((dose) => {
      dose.nextExpirationDate = medicationIdNextExpirationRelation.get(dose.medication.id);
      dose.isTaken = false;
    });

    for (const usage of usages) {
      const medicationId = usage.userMedicationStockResponses[0].medicationResponse.id;
      const doses = dailyDosesArray.filter((dose) => dose.medication.id === medicationId);
      const usageTime = new Date(usage.actionTmstamp);
      let foundMatch = false;

      for (const dose of doses) {
        const doseTime = new Date(dose.datetime);
        doseTime.setFullYear(usageTime.getFullYear(), usageTime.getMonth(), usageTime.getDate());
        const timeDiff = Math.abs(usageTime - doseTime) / (1000 * 60); // Diferença em minutos

        if (timeDiff <= minutesTimeBetweenRelation[dose.maxTakingTime]) {
          dose.isTaken = true;
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) {
        const newCard = { ...doses[0] };
        const actionTmstampDate = new Date(usage.actionTmstamp);
        newCard.time = formatTime(actionTmstampDate);
        newCard.datetime = actionTmstampDate;
        newCard.type = "tomação";
        dailyDosesArray.push(newCard);
      }
    }

    return dailyDosesArray;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const openTakeMedicationModal = (medicationId) => {
    setSelectedMedicationId(medicationId);
    setShowModal(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>{t("calendar.today")}</Text>
        <Text>{todayFormatted}</Text>
      </View>

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

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}>
        {dailyDoses.length > 0 ? (
          dailyDoses.map((dose, index) => (
            <View key={`${dose.medication.id}-${dose.time}-${index}`}>
              {dose.type === "dose" ? (
                <View
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
                  <Text>Próxima expiração: {dose.nextExpirationDate}</Text>
                  {dose.isTaken ? (
                    <Text style={{ fontSize: 14, color: "green" }}>
                      Tomado
                    </Text>
                  ) : Math.abs(Date.now() - dose.datetime) / (1000 * 60) <= minutesTimeBetweenRelation[dose.maxTakingTime] ? (
                    <TouchableOpacity onPress={() => openTakeMedicationModal(dose.medication.id)}>
                      <Text style={{ color: "blue" }}>Tomar</Text>
                    </TouchableOpacity>
                  ) : Date.now() > Number(dose.trueDateTime) ? (
                    <Text style={{ fontSize: 14, color: "red" }}>
                      Esquecido
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 14, color: "orange" }}>
                      A tomar
                    </Text>
                  )}
                </View>
              ) : (
                <View
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
                  <Text>{dose.type}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>Nenhum medicamento para este dia</Text>
        )}
      </ScrollView>

      <AppLayout navigation={navigation} local={local} />

      {/* Modal para tomar medicamento */}
      <TakeMedicationModal
        isVisible={showModal}
        closeModal={() => setShowModal(false)}
        medicationId={selectedMedicationId}
        fetchUserMedications={loadDay}
      />
    </View>
  );
};

export default CalendarScreen;
