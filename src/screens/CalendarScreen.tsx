// CalendarScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import api from "@/server/api";
import AppLayout from "@/components/shared/AppLayout";
import { getDaysArray, today, todayFormatted, getDateAndHour } from "@/utils/date";
import TakeMedicationModal from "./Usage/Creation/TakeMedicationModal"; // Import the modal
import Icon from "react-native-vector-icons/AntDesign";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import ExpandableDatePicker from "@/screens/Calendar/ExpandableDatePicker";

const CalendarScreen = ({ navigation, local = "Calendar" }) => {
  const { t } = useTranslation();
  const weekDays = getDaysArray(today);
  const [selectedDay, setSelectedDay] = useState(today.toISOString().split("T")[0]);
  const [dailyDoses, setDailyDoses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expirationDates, setExpirationDates] = useState([]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDay().finally(() => setRefreshing(false));
  };

  const minutesTimeBetweenRelation = { 0.5: 30, 1: 60 };

  useFocusEffect(
    useCallback(() => {
      loadDay();
    }, [])
  );

  useEffect(() => {
    loadDay();
  }, [selectedDay]);

  const loadDay = async () => {
    await fetchDailyDoses(selectedDay);
  }

  const fetchDailyDoses = async (selectedDay) => {
    const userMedications = await fetchUserMedications();
    const usagesData = await fetchUsages(selectedDay); // Chama o fetchUsages e aguarda os dados
    const dailyDosesArray = userMedications.flatMap((userMedication) => calculateDoseTimes(userMedication));
    const dailyDosesWithExpirationDate = await mountAllCards(dailyDosesArray, usagesData); // Passa o usagesData diretamente
    const dailyDosesOrdered = dailyDosesWithExpirationDate.sort((a, b) => {
      const aTime = a.datetime.getHours() * 60 + a.datetime.getMinutes();
      const bTime = b.datetime.getHours() * 60 + b.datetime.getMinutes();
      return aTime - bTime;
    });

    setDailyDoses(dailyDosesOrdered);

    const dates = dailyDosesOrdered
      .map(dose => dose.nextExpirationDate)
      .filter(date => date) // Remove valores nulos ou indefinidos
      .map(date => new Date(date).toISOString().split("T")[0]); // Formata as datas para strings ISO
    setExpirationDates(dates);
  };

  const fetchUserMedications = async () => {
    try {
      const response = await api.get("/user-medications", { params: { page: 0, size: 50 } });
      return response.data.content;
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
    }
    return [];
  };

  const fetchUsages = async (date) => {
    try {
      const dateObj = new Date(date);
      const toDate = new Date(dateObj);
      toDate.setDate(toDate.getDate() + 1);
      const response = await api.get("/usages/user", {
        params: { fromDate: dateObj.toISOString(), toDate: toDate.toISOString() },
      });
      return response.data.content;
    } catch (error) {
      console.error("Erro ao carregar usos:", error);
      return [];
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

  function findPreviousOrEqualDate(array, targetDate) {
    // Convertemos a data de destino para um objeto Date
    const target = new Date(targetDate);

    let left = 0;
    let right = array.length - 1;
    let result = null;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDate = new Date(array[mid].createdAt);

      if (midDate <= target) {
        result = array[mid];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return result;
  }

  const getFirstDoseTimeToday = (selectedDate: Date, firstDoseTime: Date, interval: number) => {
    const ajustedFirstDoseTime = new Date(firstDoseTime)
    const hoursToBeRemoved = (Math.floor(firstDoseTime.getHours() / interval)) * interval
    ajustedFirstDoseTime.setHours(firstDoseTime.getHours() - hoursToBeRemoved)
    ajustedFirstDoseTime.setMinutes(firstDoseTime.getMinutes())
    ajustedFirstDoseTime.setDate(selectedDate.getDate() + 1)
    ajustedFirstDoseTime.setMonth(selectedDate.getMonth())

    return ajustedFirstDoseTime
  }

  const calculateDoseTimes = (userMedication) => {
    const doseTimes = [];
    const interval = userMedication.timeBetween;
    const selectedDate = new Date(selectedDay);

    // Ordena os status por data de criação para definir períodos de ativação/inativação
    const sortedStatuses = userMedication.userMedicationStatuses
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Loop para calcular os horários das doses do dia
    let doseTime = getFirstDoseTimeToday(selectedDate, new Date(userMedication.firstDosageTime), interval);
    const dateTime = doseTime;
    const initialDoseTimePlus1 = new Date(doseTime);
    initialDoseTimePlus1.setDate(initialDoseTimePlus1.getDate() + 1)

    while (doseTime < initialDoseTimePlus1) {
      if (findPreviousOrEqualDate(sortedStatuses, doseTime)?.active) {
        // Adiciona a dose se estiver dentro de um intervalo ativo
        doseTimes.push({
          medication: userMedication.medication,
          datetime: new Date(doseTime),
          time: formatTime(doseTime),
          isTaken: userMedication.isTaken,
          isExpiringSoon: userMedication.isExpiringSoon,
          maxTakingTime: userMedication.maxTakingTime,
          disabled: userMedication.disabled,
          type: "dose",
        });
      }
      doseTime.setHours(doseTime.getHours() + interval); // Próxima dose com base no intervalo
    }

    return doseTimes;
  };
  const mountAllCards = async (dailyDosesArray, usagesData) => {
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

    for (const usage of usagesData) {
      const medicationId = usage.userMedicationStockResponses[0].medicationResponse.id;
      const doses = dailyDosesArray.filter((dose) => dose?.medication?.id === medicationId);
      const usageTime = new Date(usage.actionTmstamp);
      let foundMatch = false;

      for (const dose of doses) {
        const doseTime = new Date(dose.datetime);
        doseTime.setFullYear(usageTime.getFullYear(), usageTime.getMonth(), usageTime.getDate());
        const timeDiff = Math.abs(usageTime - doseTime) / (1000 * 60);

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

  const handleMedicationTaken = (medicationId, datetime) => {
    setDailyDoses((prevDoses) =>
      prevDoses.map((dose) =>
        dose.medication.id === medicationId && dose.datetime.getTime() === datetime.getTime()
          ? { ...dose, isTaken: true }
          : dose
      )
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit",
      hour12: false, // Formato 24 horas
    });
  };

  const openTakeMedicationModal = (dose) => {
    setSelectedDose(dose);
    setShowModal(true);
  };

  const DoseStatusButton = ({ dose }) => {
    const isWithinTimeRange =
      new Date().getDate() == dose.datetime.getDate() && Math.abs(Date.now() - dose.datetime) / (1000 * 60) <= minutesTimeBetweenRelation[dose.maxTakingTime];
    const isTaken = dose.isTaken;

    const isPastDue = Date.now() > Number(dose.datetime);

    let buttonText, buttonColor, isDisabled;

    if (isTaken) {
      buttonText = "Tomado";
      buttonColor = "#23527c"; // Verde suave
      isDisabled = true;
    } else if (isWithinTimeRange) {
      buttonText = "Tomar";
      buttonColor = "#23527c"; // Azul vibrante
    } else if (isPastDue) {
      buttonText = "Esquecido";
      buttonColor = "#F44336"; // Vermelho vibrante
      isDisabled = true;
    } else {
      buttonText = "A tomar";
      buttonColor = "#FF9800"; // Laranja vibrante
      isDisabled = true;
    }
    const hexToRgb = (hex) => {
      // Remove o "#" se estiver presente
      hex = hex.replace("#", "");
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      return `${r}, ${g}, ${b}`;
    };


    return (
      <TouchableOpacity
        style={{
          marginTop: 16,
          padding: 5,
          backgroundColor: !isTaken ? buttonColor : `rgba(${hexToRgb(buttonColor)}, 0.5)`, // Usando RGBA para opacidade apenas no fundo
          height: 32,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
        }}
        onPress={() => openTakeMedicationModal(dose)}
        disabled={isDisabled}
      >
        <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}>{buttonText}</Text>
      </TouchableOpacity>

    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 20 }}>
      <ExpandableDatePicker
        selectedDate={new Date(selectedDay)}
        onDateSelect={(date) => setSelectedDay(date.toISOString().split("T")[0])}
        expirationDates={expirationDates}
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}>
        {dailyDoses.length > 0 ? (
          dailyDoses.map((dose, index) => (
            <View key={`${dose.medication?.id}-${dose.time}-${index}`}>
              {dose.type === "dose" ? (
                <View
                  className="p-4 my-2 border border-gray-300 rounded-lg bg-white"
                  style={{
                    backgroundColor: dose.isExpiringSoon ? "rgba(255, 100, 100, 0.1)" : "white",
                  }}
                >
                  <View className="flex flex-col justify-between">
                    <View className="flex flex-row justify-between items-center">
                      <Text className="font-bold text-lg">{dose.medication?.name}</Text>
                      <Icon
                        name={dose.isTaken ? "checkcircleo" : !dose.isExpiringSoon ? "clockcircleo" : "warning"}
                        size={20}
                      />
                    </View>
                    <Text className="text-sm">{t('calendar.time')}: {dose.time}</Text>
                    <Text className="">{t('calendar.nextExpiration', { date: dose.nextExpirationDate ? getDateAndHour(new Date(dose.nextExpirationDate)) : "N/A" })}</Text>
                    <DoseStatusButton dose={dose} />
                  </View>
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
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>{dose.medication?.name}</Text>
                  <Text style={{ fontSize: 14 }}>{t('calendar.time')}: {dose.time}</Text>
                  <Text>{dose.type}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>{t('medications.noMedicationForDay')}</Text>
        )}
      </ScrollView>

      <AppLayout navigation={navigation} local={local} />

      {/* Modal para tomar medicamento */}
      <TakeMedicationModal
        isVisible={showModal}
        closeModal={() => setShowModal(false)}
        dose={selectedDose}
        handleMedicationTaken={handleMedicationTaken}
      />
    </View>
  );
};

export default CalendarScreen;
