import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalletDetails({ navigation }) {
  const [qrVisible, setQrVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const addresses = [
    { id: "0", address: "gooMr2E5JwXFJgVtY9idxNF6gqQc1bQCy1", hours: 0, glmt: 0.0 },
    { id: "1", address: "2AuqqqwertyFhrhGb", hours: 0, glmt: 0.0 },
  ];

  const openQR = (address) => {
    setSelectedAddress(address);
    setQrVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#6A5AE0", "#4E5BD5"]}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>mai</Text>

          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>0.0</Text>
          <Text style={styles.currency}> GLMT</Text>
        </View>

        <View style={styles.hoursPill}>
          <Text style={styles.hoursText}>0 GLMT Hours</Text>
        </View>
      </LinearGradient>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Id</Text>
        <Text style={styles.headerText}>Address</Text>
        <Text style={styles.headerText}>Hours</Text>
        <Text style={styles.headerText}>GLMT</Text>
      </View>

      {/* ADDRESS LIST */}
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.id}</Text>

            <View style={styles.addressCell}>
              <TouchableOpacity onPress={() => openQR(item.address)}>
                <Ionicons name="qr-code-outline" size={20} color="#333" />
              </TouchableOpacity>

              <Text style={styles.addressText}>
                {item.address.substring(0, 6)}...
                {item.address.slice(-6)}
              </Text>
            </View>

            <Text style={styles.cell}>{item.hours}</Text>
            <Text style={styles.cell}>{item.glmt}</Text>
          </View>
        )}
      />

      {/* QR POPUP MODAL */}
      <Modal visible={qrVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>View QR Code</Text>

            <QRCode value={selectedAddress} size={200} />

            <View style={styles.addressRow}>
              <Text style={styles.fullAddress}>{selectedAddress}</Text>

              <TouchableOpacity
                onPress={() => {
                  navigator.clipboard.writeText(selectedAddress);
                }}
              >
                <Ionicons name="copy-outline" size={22} color="#6A5AE0" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setQrVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    padding: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  balanceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  balance: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "700",
  },

  currency: {
    fontSize: 18,
    color: "#fff",
    marginTop: 15,
  },

  hoursPill: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },

  hoursText: {
    color: "#fff",
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#ECECF3",
  },

  headerText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  cell: {
    flex: 1,
    textAlign: "center",
  },

  addressCell: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  addressText: {
    fontSize: 12,
    color: "#555",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
    width: "100%",
  },

  fullAddress: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },

  closeBtn: {
    marginTop: 20,
    backgroundColor: "#6A5AE0",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
});