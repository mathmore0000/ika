import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";
import { useTranslation } from 'react-i18next';

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
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{t("medications.selectCategory")}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder={t("medications.searchCategory")}
        value={searchText}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={item.id === selectedCategory?.id ? styles.itemSelected : styles.item}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0000ff" /> : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CategorySelectionModal;
