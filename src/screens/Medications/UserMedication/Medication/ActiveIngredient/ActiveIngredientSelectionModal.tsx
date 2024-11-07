// ActiveIngredientSelectionModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';

const ActiveIngredientSelectionModal = ({ closeModal, onActiveIngredientSelected }) => {
  const { t } = useTranslation();
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [filteredActiveIngredients, setFilteredActiveIngredients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedActiveIngredient, setSelectedActiveIngredient] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveIngredients(currentPage, 30);
  }, [currentPage]);

  const fetchActiveIngredients = async (page, size) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/active-ingredients", { params: { page, size } });
      setActiveIngredients(prev => [...prev, ...response.data.content]);
      setFilteredActiveIngredients(filterActiveIngredients([...activeIngredients, ...response.data.content], searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error)
      showErrorToast(t("medications.errorLoadingIngredients"));
    } finally {
      setLoading(false);
    }
  };

  const filterActiveIngredients = (activeIngredients, text) => {
    return activeIngredients.filter((ing) => ing.description.toLowerCase().includes(text.toLowerCase()));
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredActiveIngredients(filterActiveIngredients(activeIngredients, text));
  };

  const handleSelect = (activeIngredient) => {
    setSelectedActiveIngredient(activeIngredient);
    onActiveIngredientSelected(activeIngredient);
    closeModal();
  };

  const loadMore = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.selectActiveIngredient")}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder={t("medications.searchIngredient")}
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredActiveIngredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={item.id === selectedActiveIngredient?.id ? styles.itemSelected : styles.item}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
      />

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActiveIngredientSelectionModal;
