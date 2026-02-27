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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function CoinSend() {
  const navigation = useNavigation();
  const route = useRoute();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const isValid = address.trim() !== "" && amount.trim() !== "";

  // ? Receive scanned QR value
  useEffect(() => {
    if (route.params?.scannedAddress) {
      setAddress(route.params.scannedAddress);
    }
  }, [route.params?.scannedAddress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Send GLMT</Text>

        {/* Send From */}
        <Text style={styles.label}>Send from</Text>
        <View style={styles.inputBox}>
          <Text>
            mai - <Text style={{ color: "#6A5AE0" }}>0.0</Text>
          </Text>
        </View>

        {/* Send To */}
        <Text style={styles.label}>Send to</Text>
        <View style={styles.addressWrapper}>
          <TextInput
            placeholder="GLMT Address"
            value={address}
            onChangeText={setAddress}
            style={styles.addressInput}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate("QRScanner")}
          >
            <Ionicons
              name="qr-code-outline"
              size={22}
              color="#6A5AE0"
            />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          style={styles.inputBox}
          keyboardType="numeric"
        />

        {/* Note */}
        <Text style={styles.label}>Note</Text>
        <TextInput
          placeholder="Notes"
          value={note}
          onChangeText={setNote}
          style={styles.inputBox}
        />

        {/* Buttons */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.navigate("MainWallet")}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>

          {isValid ? (
            <LinearGradient
              colors={["#6A5AE0", "#4E5BD5"]}
              style={styles.sendBtn}
            >
              <TouchableOpacity style={styles.fullWidth}>
                <Text style={styles.gradientText}>SEND</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View style={[styles.sendBtn, { backgroundColor: "#ddd" }]}>
              <View style={styles.fullWidth}>
                <Text style={{ color: "#aaa" }}>SEND</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  container: {
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    marginBottom: 6,
    fontWeight: "500",
  },

  inputBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  addressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 12,
    marginBottom: 15,
  },

  addressInput: {
    flex: 1,
    fontSize: 15,
  },

  qrButton: {
    height: 38,
    width: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F0FF",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  cancelBtn: {
    backgroundColor: "#e0e0e0",
    padding: 15,
    borderRadius: 30,
    width: "48%",
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "600",
  },

  sendBtn: {
    borderRadius: 30,
    width: "48%",
  },

  fullWidth: {
    padding: 15,
    alignItems: "center",
  },

  gradientText: {
    color: "#fff",
    fontWeight: "600",
  },
});