import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import UserVideoList from "./Usage/Labeling/UserVideoList";
import ResponsibleVideoList from "./Usage/Labeling/ResponsibleVideoList";
import { useTranslation } from 'react-i18next';
import AppLayout from "@/components/shared/AppLayout";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const VideoFilterScreen = ({ navigation, local = 'Videos' }) => {
  const { t } = useTranslation();
  const [isSupervisedView, setIsSupervisedView] = useState(false);
  const { height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + (height * 0.03) }]}>

      {/* Toggle Button */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !isSupervisedView && styles.activeButton]}
          onPress={() => setIsSupervisedView(false)}
        >
          <Text style={[styles.buttonText, !isSupervisedView && styles.activeButtonText]}>
            {t("videos.myVideos")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, isSupervisedView && styles.activeButton]}
          onPress={() => setIsSupervisedView(true)}
        >
          <Text style={[styles.buttonText2, isSupervisedView && styles.activeButtonText]}>
            {t("videos.supervisedVideos")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video List */}
      <View style={[styles.listContainer, { marginBottom: insets.bottom + (height * 0.09) }]} className="flex-1">
        {isSupervisedView ? <ResponsibleVideoList /> : <UserVideoList />}
      </View>
      <AppLayout navigation={navigation} local={local} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopEndRadius: 6,
    borderTopStartRadius: 6,
    width: "100%",
    backgroundColor: "#d1d5db",
    padding: 5,
  },
  toggleButton: {
    flex: 1,
    height: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#333",
    fontSize: 13,
  },
  buttonText2: {
    color: "#333",
    fontSize: 12,
  },
  activeButtonText: {
    color: "#000",
  },
  listContainer: {    
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#D1D5DB',
    width: '100%',
    paddingVertical: 20,
    borderBottomStartRadius: 6, 
    borderBottomEndRadius: 6
  },
});

export default VideoFilterScreen;
