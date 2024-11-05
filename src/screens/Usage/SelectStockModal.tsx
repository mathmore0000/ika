import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator } from "react-native";
import styles from "@/screens/_styles/medications";
import { showErrorToast } from "@/utils/toast";

const SelectStockModal = ({
  isVisible,
  closeModal,
  stocks,
  onAddStock,
  fetchStocks,
  currentPage,
  setCurrentPage,
  totalPages,
  loading,
}) => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedStock || !Number.isInteger(Number(quantity)) || !quantity || quantity <= 0) {
      showErrorToast("Selecione um estoque e defina a quantidade.");
      return;
    }
    if (quantity > selectedStock.availableQuantity){
      showErrorToast("Quantidade maior do que disponível no estoque.");
      return;
    }
    onAddStock(selectedStock, quantity);
    setSelectedStock(null);
    setQuantity(0);
    closeModal();
  };

  const loadMoreStocks = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((prev) => prev + 1);
      fetchStocks(currentPage + 1);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Selecionar Estoque</Text>

        <FlatList
          data={stocks}
          keyExtractor={(item) => item.id}
          onEndReached={loadMoreStocks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator size="small" color="#0000ff" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={item.id === selectedStock?.id ? styles.stockItemSelected : styles.stockItem}
              onPress={() => setSelectedStock(item)}
            >
              <Text>
                Expira em: {item.expirationDate} | Quantidade: {item.availableQuantity}
              </Text>
            </TouchableOpacity>
          )}
        />

        {selectedStock && (
          <TextInput
            style={styles.input}
            placeholder={`Quantidade (${selectedStock.quantityMl ? "ml" : "unidades"})`}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        )}

        <TouchableOpacity onPress={handleAdd}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SelectStockModal;
