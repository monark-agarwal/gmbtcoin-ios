import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

export default function WalletDetails({ route, navigation }) {
  const { wallet } = route.params;
  const [selectedAddress, setSelectedAddress] = useState(null);

  const addresses = wallet.addresses || [];

  const totalBalance = 0.0;
  const totalHours = 0;

  const openQR = (address) => setSelectedAddress(address);
  const closeQR = () => setSelectedAddress(null);

  const copyAddress = async (address) => {
    await Clipboard.setStringAsync(address);
  };

  const truncateAddress = (addr, start = 6, end = 6) =>
    addr ? `${addr.slice(0, start)}...${addr.slice(-end)}` : "";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
        colors={["#6A5AE0", "#4E5BD5"]}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{wallet.name}</Text>

          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{totalBalance.toFixed(1)}</Text>
          <Text style={styles.currency}> GLMT</Text>
        </View>

        <View style={styles.hoursPill}>
          <Text style={styles.hoursText}>{totalHours} GLMT Hours</Text>
        </View>
      </LinearGradient>

      {/* TABLE HEADER */}
      <View style={styles.tableHeader}>
        <Text style={{ flex: 3, fontWeight: "600" }}>Address</Text>
        <Text style={{ flex: 1, fontWeight: "600", textAlign: "center" }}>
          Hours
        </Text>
        <Text style={{ flex: 1, fontWeight: "600", textAlign: "center" }}>
          GLMT
        </Text>
        <Text style={{ width: 50, textAlign: "center" }}>Actions</Text>
      </View>

      {/* ADDRESS LIST */}
      <FlatList
        data={addresses}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => {
          const addr = item.address.Address;
          return (
            <View style={styles.addressCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText}>
                  {truncateAddress(addr)}
                </Text>
              </View>

              <View style={styles.middleInfo}>
                <Text>0.0</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => copyAddress(addr)}
                >
                  <Ionicons name="copy-outline" size={20} color="#6A5AE0" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openQR(addr)}
                >
                  <Ionicons name="qr-code-outline" size={22} color="#6A5AE0" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* QR MODAL */}
      <Modal visible={!!selectedAddress} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Wallet QR Code</Text>

            {selectedAddress && (
              <>
                <QRCode value={selectedAddress} size={200} />

                <View style={styles.addressBox}>
                  <Text numberOfLines={1} style={{ flex: 1 }}>
                    {selectedAddress}
                  </Text>

                  <TouchableOpacity onPress={() => copyAddress(selectedAddress)}>
                    <Ionicons name="copy-outline" size={22} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={closeQR}
              style={styles.closeBtn}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F5F9" },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    alignItems: "flex-end",
    marginTop: 20,
  },

  balance: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "700",
  },

  currency: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 6,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#ECECF3",
    alignItems: "center",
  },

  addressCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },

  addressText: {
    fontSize: 14,
    color: "#333",
  },

  middleInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  actions: {
    width: 70,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconBtn: {
    padding: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "600",
  },

  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#F2F2F2",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },

  closeBtn: {
    marginTop: 20,
    backgroundColor: "#6A5AE0",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
});