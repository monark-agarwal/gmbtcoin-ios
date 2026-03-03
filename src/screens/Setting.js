import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { saveNodeUrl, getNodeUrl } from "../utils/security";

import {
  APP_VERSION,
  BACKEND_MIN_VERSION,
  DB_VERSION,
  DEFAULT_NODE_URL,
} from "../utils/GlobalConstants";

export default function Setting() {
  const navigation = useNavigation();
  const [nodeUrl, setNodeUrl] = useState("");

  useEffect(() => {
    loadNodeUrl();
  }, []);

  const loadNodeUrl = async () => {
    try {
      const savedUrl = await getNodeUrl();
      if (savedUrl) {
        setNodeUrl(savedUrl); // ? Correct
      } else {
        setNodeUrl(DEFAULT_NODE_URL);
      }
    } catch (error) {
      console.log("Error loading node URL:", error);
      setNodeUrl(DEFAULT_NODE_URL);
    }
  };

  const handleSave = async () => {
    try {
      const trimmedUrl = nodeUrl.trim();
      if (trimmedUrl.length > 0) {
        await saveNodeUrl(trimmedUrl);
      }
      navigation.replace("MainWallet");
    } catch (error) {
      console.log("Error saving node URL:", error);
    }
  };

  const handleRestore = () => {
    setNodeUrl(DEFAULT_NODE_URL);
  };

  const handleCancel = () => {
    navigation.replace("MainWallet");
  };

  const handleChangePin = () => {
    navigation.navigate("SetPin", { isChangePin: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.info}>Version: {APP_VERSION}</Text>
          <Text style={styles.info}>
            Backend node min version: {BACKEND_MIN_VERSION}
          </Text>
          <Text style={styles.info}>DB version: {DB_VERSION}</Text>
        </View>

        <Text style={styles.label}>Node URL</Text>
        <TextInput
          value={nodeUrl}
          onChangeText={setNodeUrl}
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.grayButton}
          onPress={handleRestore}
        >
          <Text style={styles.grayButtonText}>
            RESTORE TO DEFAULT
          </Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#6A5AE0", "#4E5BD5"]}
          style={styles.gradientButton}
        >
          <TouchableOpacity
            style={styles.fullWidth}
            onPress={handleChangePin}
          >
            <Text style={styles.gradientText}>
              CHANGE PIN
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={["#6A5AE0", "#4E5BD5"]}
            style={styles.saveBtn}
          >
            <TouchableOpacity
              style={styles.fullWidth}
              onPress={handleSave}
            >
              <Text style={styles.gradientText}>SAVE</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { padding: 20 }, header: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 20 }, card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }, info: { marginBottom: 5 }, label: { marginBottom: 8, fontWeight: "500" }, input: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 15 }, grayButton: { backgroundColor: "#e0e0e0", padding: 14, borderRadius: 30, alignItems: "center", marginBottom: 20 }, grayButtonText: { fontWeight: "600" }, gradientButton: { borderRadius: 30, marginBottom: 30 }, fullWidth: { padding: 16, alignItems: "center" }, gradientText: { color: "#fff", fontWeight: "600" }, bottomRow: { flexDirection: "row", justifyContent: "space-between" }, cancelBtn: { backgroundColor: "#e0e0e0", padding: 15, borderRadius: 30, width: "48%", alignItems: "center" }, cancelText: { fontWeight: "600" }, saveBtn: { borderRadius: 30, width: "48%" } });