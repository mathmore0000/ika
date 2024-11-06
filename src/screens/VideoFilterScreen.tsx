import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import UserVideoList from "./Usage/Labeling/UserVideoList";
import ResponsibleVideoList from "./Usage/Labeling/ResponsibleVideoList";

const VideoFilterScreen = () => {
    const [isSupervisedView, setIsSupervisedView] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Videos</Text>

            {/* Toggle Button */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, !isSupervisedView && styles.activeButton]}
                    onPress={() => setIsSupervisedView(false)}
                >
                    <Text style={[styles.buttonText, !isSupervisedView && styles.activeButtonText]}>My Videos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, isSupervisedView && styles.activeButton]}
                    onPress={() => setIsSupervisedView(true)}
                >
                    <Text style={[styles.buttonText, isSupervisedView && styles.activeButtonText]}>Supervised Videos</Text>
                </TouchableOpacity>
            </View>

            {/* Video List */}
            {isSupervisedView ? <ResponsibleVideoList /> : <UserVideoList />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
        marginHorizontal: 5,
        backgroundColor: "#ddd",
    },
    activeButton: {
        backgroundColor: "#4caf50",
    },
    buttonText: {
        color: "#333",
        fontSize: 16,
    },
    activeButtonText: {
        color: "#fff",
    },
});

export default VideoFilterScreen;
