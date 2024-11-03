// CategorySelectionModal.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal } from "react-native";
import api from "@/server/api";
import { showErrorToast } from "@/utils/toast";
import styles from "@/screens/_styles/medications";

const CategorySelectionModal = ({ closeModal, onCategorySelected }) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories(currentPage, 50);
  }, [currentPage]);

  const fetchCategories = async (page, size) => {
    if (loading || page >= totalPages) return;

    setLoading(true);
    try {
      const response = await api.get("/categories", { params: { page, size } });
      setCategories(prev => [...prev, ...response.data.content]);
      setFilteredCategories(filterCategories([...categories, ...response.data.content], searchText));
      setTotalPages(response.data.totalPages);
    } catch (error) {
      showErrorToast("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Selecione uma Categoria</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar categoria..."
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
      />

      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CategorySelectionModal;
