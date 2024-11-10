// SelectStockModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import styles from "@/screens/_styles/medications";
import { showErrorToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';
import Toast from "react-native-toast-message";

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
  refreshing, // Recebido
  onRefresh, // Recebido
}) => {
  const { t } = useTranslation();
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedStock || !Number.isInteger(Number(quantity)) || !quantity || quantity <= 0) {
      showErrorToast(t("medications.selectStockAndSetQuantity"));
      return;
    }
    if (quantity > selectedStock.availableQuantity) {
      showErrorToast(t("medications.quantityExceedsStock"));
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
        <Text style={styles.title}>{t("medications.selectStock")}</Text>

        <FlatList
          data={stocks}
          keyExtractor={(item) => item.id}
          onEndReached={loadMoreStocks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator size="small" color="#0000ff" />}
          refreshControl={ // Adicionado
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={item.id === selectedStock?.id ? styles.stockItemSelected : styles.stockItem}
              onPress={() => setSelectedStock(item)}
            >
              <Text>
                {t("medications.expiresOn", { date: item.expirationDate })} | {t("medications.quantity")}: {item.availableQuantity}
              </Text>
            </TouchableOpacity>
          )}
        />


        {selectedStock && (
          <TextInput
            style={styles.input}
            placeholder={`${t("medications.quantity")} (${selectedStock.quantityMl ? t("medications.ml") : t("medications.units")})`}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        )}

        <TouchableOpacity onPress={handleAdd}>
          <Text style={styles.addButtonText}>{t("common.add")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </Modal>
  );
};

export default SelectStockModal;
