// SelectStockModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import styles from "@/screens/_styles/medications";
import { showErrorToast } from "@/utils/toast";
import { useTranslation } from 'react-i18next';
import IconI from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDateAndHour } from "@/utils/date";
import TextInputComponent from "@/components/forms/TextInput";

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
  const { width, height } = Dimensions.get("window");
  const insets = useSafeAreaInsets(); // Obter as margens seguras do dispositivo

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
      <View className="flex-1 flex justify-end items-center bg-[rgba(0,0,0,0.5)]">
        <View className="bg-white rounded-t-lg flex items-center justify-center" style={{
          width: width, // 80% da largura da tela
          height: height * 0.9, // 80% da altura da tela
          paddingBottom: insets.bottom + (height * 0.02), // Adicionado
        }}><View className="flex-1 px-5 pt-5 w-full">
            <View className="flex flex-row items-center justify-between pb-4">
              <Text className="font-bold text-xl">{t("medications.selectStock")}</Text>
              <TouchableOpacity
                onPress={closeModal}
              >
                <IconI name="return-up-back-outline" size={25} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[{ id: 0, expirationDate: t("medications.all"), availableQuantity: 0 }].concat(stocks)}
              keyExtractor={(item) => item.id}
              onEndReached={loadMoreStocks}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loading && <ActivityIndicator size="small" color="#0000ff" />}
              refreshControl={ // Adicionado
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <View className="flex flex-col px-2">
                  <View className="flex flex-row justify-between items-center py-3" >
                    <View className="flex flex-col">
                      <Text className="font-bold text-lg">
                        {t("medications.expiresOn", { date: getDateAndHour(new Date(item.expirationDate)) })}
                      </Text>
                      <Text className="">
                        {t("medications.quantity")}: {item.availableQuantity}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className={`
                w-7 h-7 border-2 border-gray-300 rounded-md items-center justify-center mr-2
                ${item.id === selectedStock?.id && "bg-primary border-primary"}
              `}
                      onPress={() => setSelectedStock(item)}
                    >
                      {item.id === selectedStock?.id && (
                        <Icon name="check" size={16} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View className="border-b border-gray-300" />
                </View>
              )}
            />
            <View className="flex flex-col w-full gap-6 items-center justify-between py-2">

              {selectedStock && (
                <TextInputComponent
                  label={t("medications.quantity")}
                  navigation={null}
                  placeholder={`${t("medications.quantity")} (${selectedStock.quantityMl ? t("medications.ml") : t("medications.units")})`}
                  keyboardType="numeric"
                  value={quantity}
                  setValue={setQuantity}
                />
              )}

              <TouchableOpacity className="bg-primary button-icon p-3 w-full" onPress={handleAdd}>
                <IconI name="add" size={25} color="#fff" />
                <Text className="text-white text-xl font-semibold">{t("common.add")}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Toast />
        </View>
      </View>
    </Modal>
  );
};

export default SelectStockModal;
