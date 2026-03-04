import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  ToastAndroid,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { getTransactionHistory } from "../api/walletApi";

const { height } = Dimensions.get("window");

export default function TransactionHistory({ route, navigation }) {
  const { addresses } = route.params;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    loadTransactions();
  }, []);

  const showToast = (msg) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("Success", msg);
    }
  };

  const formatAddress = (addr) =>
    `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  const isMyAddress = (addr) => addresses.includes(addr);

  const loadTransactions = async () => {
    try {
      setLoading(true);

      const validAddresses = addresses.filter(
        (addr) => addr && !addr.startsWith("=")
      );

      const response = await getTransactionHistory(validAddresses);
      const txs = response || [];

      const mapped = txs
        .map((rawTx, index) => {
          const tx = rawTx.txn;
          if (!tx) return null;

          const inputs = tx.inputs || [];
          const outputs = tx.outputs || [];

          const myInputs = inputs.filter((i) =>
            validAddresses.includes(i.owner)
          );

          const myOutputs = outputs.filter((o) =>
            validAddresses.includes(o.dst)
          );

          const totalOutput = outputs.reduce(
            (s, o) => s + Number(o.coins || 0),
            0
          );
		  
		  const totalInput = inputs.reduce(
            (s, o) => s + Number(o.coins || 0),
            0
          );

          const myOutputTotal = myOutputs.reduce(
            (s, o) => s + Number(o.coins || 0),
            0
          );

          let type = "received";
          let amount = 0;

          if (myInputs.length > 0 && myOutputs.length === 0) {
            type = "sent";
            amount = totalOutput - myOutputTotal;
          } else if (myInputs.length === 0 && myOutputs.length > 0) {
            type = "received";
            amount = myOutputTotal;
          } else if (myInputs.length > 0 && myOutputs.length > 0) {
            type = "internal";
			const firstOwner = myInputs[0]?.owner;

const matchedOutputs = myOutputs.filter(
  (o) => o.dst === firstOwner
);

const total = matchedOutputs.reduce(
  (sum, o) => sum + Number(o.coins || 0),
  0
);
            amount =totalInput- total; // FIXED
          }

          return {
            id: `${tx.txid}-${index}`, // unique key FIX
            txid: tx.txid,
            type,
            amount,
            fee: Number(tx.fee) || 0,
            blockHeight: rawTx.status?.block_seq || "-",
            time: rawTx.time,
            formattedTime: new Date(
              rawTx.time * 1000
            ).toLocaleString(),
            inputs,
            outputs,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.time - a.time);

      setTransactions(mapped);
    } catch (error) {
      console.log("Transaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openSheet = (tx) => {
    setSelectedTx(tx);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setSelectedTx(null));
  };

  const renderAddressRow = (addr, index) => (
    <View style={styles.addressRow} key={`${addr}-${index}`}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.addressText,
            isMyAddress(addr) && styles.myAddress,
          ]}
        >
          {formatAddress(addr)}
          {isMyAddress(addr) && " (Your Address)"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={async () => {
          await Clipboard.setStringAsync(addr);
          showToast("Address copied");
        }}
      >
        <Ionicons
          name="copy-outline"
          size={18}
          color="#4f46e5"
        />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => {
    let icon = "arrow-down-outline";
    let color = "#16a34a";
    let prefix = "+";

    if (item.type === "sent") {
      icon = "arrow-up-outline";
      color = "#ef4444";
      prefix = "-";
    }

    if (item.type === "internal") {
      icon = "swap-horizontal-outline";
      color = "#6366f1";
      prefix = "";
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openSheet(item)}
      >
        <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.date}>{item.formattedTime}</Text>
        </View>

        <Text style={[styles.amount, { color }]}>
          {prefix}
          {item.amount.toFixed(6)} GLMT
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity onPress={loadTransactions}>
          <Ionicons name="refresh-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Bottom Sheet */}
      <Modal visible={!!selectedTx} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeSheet} />

          <Animated.View
            style={[styles.sheet, { transform: [{ translateY }] }]}
          >
            <View style={styles.dragIndicator} />

            {selectedTx && (
              <ScrollView>
                <Text style={styles.sheetTitle}>
                  Transaction Details
                </Text>

                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>
                  {selectedTx.amount.toFixed(6)} GLMT
                </Text>

                <Text style={styles.label}>From</Text>
                {selectedTx.inputs.map((i, index) =>
                  renderAddressRow(i.owner, index)
                )}

                <Text style={styles.label}>To</Text>
                {selectedTx.outputs.map((o, index) =>
                  renderAddressRow(o.dst, index)
                )}

                <Text style={styles.label}>Fee</Text>
                <Text style={styles.valueSmall}>
                  {selectedTx.fee} Hours
                </Text>

                <Text style={styles.label}>Block Height</Text>
                <Text style={styles.valueSmall}>
                  {selectedTx.blockHeight}
                </Text>

                <Text style={styles.label}>Transaction ID</Text>
                <Text style={styles.txid}>
                  {selectedTx.txid}
                </Text>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: "#4f46e5",
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 10
        : 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    elevation: 1,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  date: { fontSize: 13, color: "#374151" },
  amount: { fontSize: 14, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    height: height * 0.8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },

  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  label: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 12,
  },

  value: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
  },

  valueSmall: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  txid: {
    fontSize: 11,
    color: "#4f46e5",
    marginTop: 6,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  addressText: {
    fontSize: 12,
    color: "#374151",
  },

  myAddress: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});