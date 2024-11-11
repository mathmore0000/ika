import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/AntDesign";
import IconIon from "react-native-vector-icons/Ionicons";

const ActiveIngredientSelectionModal = ({ closeModal, onActiveIngredientSelected }) => {
  const { t } = useTranslation();
  const [activeIngredients, setActiveIngredients] = useState([]);
  const [filteredActiveIngredients, setFilteredActiveIngredients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedActiveIngredient, setSelectedActiveIngredient] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActiveIngredients(currentPage, 30);
  }, [currentPage]);

  const fetchActiveIngredients = async (page = 0, size = 30, isRefreshing = false) => {
    if (loading || page >= totalPages) return;

    isRefreshing ? setRefreshing(true) : setLoading(true);

    try {
      const response = await api.get("/active-ingredients", { params: { page, size } });
      const newIngredients = response.data.content;

      setActiveIngredients(prev => (page === 0 ? newIngredients : [...prev, ...newIngredients]));
      setFilteredActiveIngredients(filterActiveIngredients(page === 0 ? newIngredients : [...activeIngredients, ...newIngredients], searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.log(error);
      showErrorToast(t("medications.errorLoadingIngredients"));
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const onRefresh = () => {
    setCurrentPage(0);
    fetchActiveIngredients(0, 30, true); // Recarrega a lista desde o início
  };

  return (
    <View className="flex-1 px-5 pt-5 w-full">
      <View className="flex flex-row items-center justify-between pb-4">
        <Text style={styles.title}>{t("medications.selectActiveIngredient")}</Text>
        <TouchableOpacity className="-mt-3" onPress={closeModal}>
          <Icon name="close" size={25} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center bg-gray-200 rounded-md px-2 py-1 mb-4">
        <Icon name="search1" size={18} color="#000" />
        <TextInput
          className="flex-1 ml-2 text-base text-black"
          placeholder={t("medications.searchIngredient")}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredActiveIngredients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="py-2">            
            <TouchableOpacity
              className="flex flex-row items-center justify-between rounded-sm p-2 bg-gray-100"
              style={item.id === selectedActiveIngredient?.id ? styles.itemSelected : styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemText}>{item.description}</Text>
              <IconIon name="chevron-forward-outline" style={styles.icon} />
            </TouchableOpacity>
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default ActiveIngredientSelectionModal;
