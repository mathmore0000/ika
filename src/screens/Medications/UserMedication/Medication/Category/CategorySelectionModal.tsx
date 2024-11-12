import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';
import Icon from "react-native-vector-icons/AntDesign";
import IconIon from "react-native-vector-icons/Ionicons";

const CategorySelectionModal = ({ closeModal, onCategorySelected }) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories(currentPage, 50);
  }, [currentPage]);

  const fetchCategories = async (page = 0, size = 50, isRefreshing = false) => {
    if (loading || page >= totalPages) return;

    isRefreshing ? setRefreshing(true) : setLoading(true);

    try {
      const response = await api.get("/categories", { params: { page, size } });
      const newCategories = response.data.content;

      setCategories(prev => (page === 0 ? newCategories : [...prev, ...newCategories]));
      setFilteredCategories(filterCategories(page === 0 ? newCategories : [...categories, ...newCategories], searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showErrorToast(t("medications.errorLoadingCategories"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCategories = (categories, text) => {
    return categories.filter((cat) => cat.description.toLowerCase().includes(text.toLowerCase()));
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredCategories(filterCategories(categories, text));
  };

  const handleSelect = (category) => {
    setSelectedCategory(category);
    onCategorySelected(category);
    closeModal();
  };

  const loadMore = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const onRefresh = () => {
    setCurrentPage(0);
    fetchCategories(0, 50, true); // Recarrega a lista desde o início
  };

  return (
    <View className="flex-1 px-5 pt-5 w-full">
      <View className="flex flex-row items-center justify-between pb-4">
        <Text style={styles.title}>{t("medications.selectCategory")}</Text>
        <TouchableOpacity className="-mt-3" onPress={closeModal}>
          <Icon name="close" size={25} color="#000" />
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center bg-gray-200 rounded-md px-2 py-1 mb-4">
        <Icon name="search1" size={18} color="#000" />
        <TextInput
          className="flex-1 ml-2 text-base text-black"
          placeholder={t("medications.searchCategory")}
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="py-2">
            <TouchableOpacity
              className="flex flex-row items-center justify-between rounded-sm p-2 bg-gray-100"
              style={item.id === selectedCategory?.id ? styles.itemSelected : styles.item}
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

export default CategorySelectionModal;
