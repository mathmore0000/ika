// MedicationSelectionModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Modal, Dimensions } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import NewMedicationModal from "./Medication/NewMedicationModal";
import UserMedicationModal from "./AddUserMedicationModal";
import { medicationType } from "@/constants/interfaces/Entities";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/AntDesign";
import IconEnty from "react-native-vector-icons/Entypo";

const MedicationSelectionModal = ({ closeModal, userMedications, onUserMedicationCreated }) => {
  const { width, height } = Dimensions.get("window"); // Obtém a largura e altura da tela
  const { t } = useTranslation();
  const [medications, setMedications] = useState<medicationType[]>([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState<medicationType>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isNewMedicationModalVisible, setIsNewMedicationModalVisible] = useState(false);
  const [isNewUserMedicationModal, setIsNewUserMedicationModal] = useState(false);

  const openIsNewMedicationModal = () => setIsNewMedicationModalVisible(true);
  const closeIsNewMedicationModal = () => setIsNewMedicationModalVisible(false);

  const openNewUserMedicationModal = () => setIsNewUserMedicationModal(true);
  const closeNewUserMedicationModal = () => setIsNewUserMedicationModal(false);

  useEffect(() => {
    fetchMedications();
  }, [currentPage]);

  const onMedicationCreated = async () => {
    await setMedications([]);
    await setCurrentPage(0);
    await fetchMedications(0);
  };

  const fetchMedications = async (page = currentPage, size = 50) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/medications", { params: { page, size } });
      const newMedications = filterOutUserMedications(response.data.content);
      const updatedMedications: medicationType[] = page === 0 ? newMedications : [...medications, ...newMedications];

      setMedications(updatedMedications);
      setFilteredMedications(filterMedications(updatedMedications, searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showErrorToast(t("medications.errorLoadingMedications"));
    } finally {
      setLoading(false);
    }
  };

  const filterOutUserMedications = (allMedications) => {
    const userMedicationIds = userMedications.map((userMed) => userMed.medication.id);
    return allMedications.filter((med) => !userMedicationIds.includes(med.id));
  };

  const filterMedications = (medications, text) => {
    return medications.filter((med) =>
      med.name.toLowerCase().includes(text.toLowerCase())
    );
  };

  const handleNewUserMedicationModal = async () => {
    if (selectedMedication.id == null) {
      return showErrorToast(t("medications.chooseMedication"));
    }
    openNewUserMedicationModal();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredMedications(filterMedications(medications, text));
  };

  const handleSelect = (medication) => {
    setSelectedMedication(medication);
  };

  const loadMore = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View className="flex-1 px-5 pt-5">
      <View className="flex flex-row items-center justify-between pb-4">
        <Text className="font-bold text-xl">{t("medications.selectMedication")}</Text>
        <TouchableOpacity
          onPress={closeModal}
        >
          <Icon name="close" size={25} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center bg-gray-200 rounded-md px-2 py-1 mb-4">
        <Icon name="search1" size={18} color="#000" />
        <TextInput
          className="flex-1 ml-2 text-base text-black"
          placeholder={t("medications.searchMedication")}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>



      <FlatList
        data={filteredMedications}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>{t("medications.noMedicationsFound")}</Text>}
        renderItem={({ item }) => (
          <View className="flex flex-col px-2">
            <View className="flex flex-row justify-between items-center py-3" >
              <View className="flex flex-col">
                <Text className="font-bold text-lg">
                  {item.name}
                </Text>
                <Text className="">
                  {t("medications.medicationDosage", { dosage: item.dosage })}
                </Text>
              </View>
              <TouchableOpacity
                className={`
                w-7 h-7 border-2 border-gray-300 rounded-md items-center justify-center mr-2
                ${item.id === selectedMedication.id && "bg-primary border-primary"}
              `}
                onPress={() => handleSelect(item)}
              >
                {item.id === selectedMedication.id && (
                  <Icon name="check" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <View className="border-b border-gray-300" />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
      />

      <Modal visible={isNewMedicationModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white rounded-t-lg flex items-center justify-center" style={{
            width: width, // 80% da largura da tela
            height: height * 0.9, // 80% da altura da tela
          }}>
            <NewMedicationModal
              closeModal={closeIsNewMedicationModal}
              onMedicationCreated={onMedicationCreated}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={isNewUserMedicationModal} transparent={true} animationType="fade">
        <UserMedicationModal
          closeModal={closeNewUserMedicationModal}
          closeMedicationSelectionModal={closeModal}
          onUserMedicationCreated={onUserMedicationCreated}
          selectedMedication={selectedMedication}
        />
      </Modal>
      <View className="border-t py-[2vh] border-gray-300 flex-row gap-2 w-full flex items-center" >
        <TouchableOpacity onPress={openIsNewMedicationModal} className="w-1/2 gap-3 p-2 h-10 border border-primary rounded-md flex flex-row justify-center items-center">
          <IconEnty name="add-to-list" size={20} color="#23527c" />
          <Text className="font-bold text-primary">{t("medications.addMedicationButton")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNewUserMedicationModal} className="w-1/2 gap-1 p-2 h-10 bg-primary rounded-md flex flex-row justify-center items-center">
          <Icon name="plus" size={20} color="#fff" />
          <Text className="text-white font-bold">{t("medications.addToInventory")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MedicationSelectionModal;
