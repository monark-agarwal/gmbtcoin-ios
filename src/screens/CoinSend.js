import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";
import { getWalletHashes, postTransaction } from "../api/walletApi";
import { NativeModules } from "react-native";

const { GMBTModule } = NativeModules;

export default function CoinSend() {
  const navigation = useNavigation();
  const route = useRoute();

  const [wallets, setWallets] = useState(route.params?.wallets ?? []);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletValue, setWalletValue] = useState(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [txId, setTxId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pendingTxData, setPendingTxData] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  /* ================= Animation ================= */

  useEffect(() => {
    if (confirmVisible || successVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [confirmVisible, successVisible]);

  /* ================= Wallet Init ================= */

  useEffect(() => {
    if (wallets.length > 0) {
      const initial = wallets[0];
      setSelectedWallet(initial);
      setWalletValue(initial.id);
      setItems(
        wallets.map((w) => ({
          label: `${w.name} (${w.glmt?.toFixed(6)} GLMT)`,
          value: w.id,
        }))
      );
    }
  }, [wallets]);

  useEffect(() => {
    const wallet = wallets.find((w) => w.id === walletValue);
    if (wallet) setSelectedWallet(wallet);
  }, [walletValue]);

  useEffect(() => {
    if (route.params?.scannedAddress) {
      setAddress(route.params.scannedAddress);
    }
  }, [route.params?.scannedAddress]);

  const isValid =
    selectedWallet &&
    address.trim() !== "" &&
    amount.trim() !== "" &&
    parseFloat(amount) > 0;

  /* ================= TRANSACTION ================= */

  const handleSend = async () => {
    try {
      const numericAmount = parseFloat(amount);
      setLoading(true);

      const walletAddresses = selectedWallet.addresses
        .map((a) => a.address?.Address)
        .join(",");

      const outputs = await getWalletHashes(walletAddresses);

      let remaining = numericAmount;
      let inputs = [];
      let totalInputHours = 0;
      let totalInputCoins = 0;

      for (let item of outputs.head_outputs) {
        if (remaining <= 0) break;

        const coins = parseFloat(item.coins);
        const hours = parseInt(item.calculated_hours || item.hours || 0);

        const matchingAddress = selectedWallet.addresses.find(
          (a) => a.address?.Address === item.address
        );
        if (!matchingAddress) continue;

        inputs.push({
          Secret: matchingAddress.address.Secret,
          Hash: item.hash,
        });

        totalInputCoins += coins;
        totalInputHours += hours;

        remaining -= coins;
      }

      if (remaining > 0) throw new Error("Insufficient balance");

      const burnHours = Math.floor(totalInputHours / 2);
      const remainingHours = totalInputHours - burnHours;

      const changeCoins = totalInputCoins - numericAmount;
      const receiverHours = Math.floor(remainingHours / 2);
      const senderHours = remainingHours - receiverHours;

      const outputsArray = [
        {
          Address: address,
          Coins: Math.round(numericAmount * 1000000),
          Hours: receiverHours,
        },
      ];

      if (changeCoins > 0) {
        outputsArray.push({
          Address: selectedWallet.addresses[0].address.Address,
          Coins: Math.round(changeCoins * 1000000),
          Hours: senderHours,
        });
      }

      setSummary({
        amount: numericAmount,
        burnHours,
        receiverHours,
        senderHours,
        changeCoins,
      });

      setPendingTxData({ inputs, outputsArray });
      setLoading(false);
      setConfirmVisible(true);
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  const confirmTransaction = async () => {
    setConfirmVisible(false);
    setLoading(true);

    try {
      const rawtx = await GMBTModule.prepareTransaction(
        JSON.stringify(pendingTxData.inputs),
        JSON.stringify(pendingTxData.outputsArray)
      );

      const txid = await postTransaction(rawtx);

      setTxId(txid);
      setSuccessVisible(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccess = () => {
    setSuccessVisible(false);
    navigation.navigate("MainWallet", { refresh: true });
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Send GLMT</Text>

        <Text style={styles.label}>Select Wallet</Text>

        <DropDownPicker
          open={open}
          value={walletValue}
          items={items}
          setOpen={setOpen}
          setValue={setWalletValue}
          setItems={setItems}
          placeholder="Select Wallet"
          listMode="SCROLLVIEW"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        <Text style={styles.label}>Send To</Text>

        <View style={styles.addressWrapper}>
          <TextInput
            placeholder="GLMT Address"
            value={address}
            onChangeText={setAddress}
            style={styles.addressInput}
          />
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate("QRScanner")}
          >
            <Ionicons name="qr-code-outline" size={22} color="#6A5AE0" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount</Text>
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          style={styles.inputBox}
          keyboardType="numeric"
        />

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={isValid ? ["#6A5AE0", "#4E5BD5"] : ["#ccc", "#ccc"]}
            style={styles.sendBtn}
          >
            <TouchableOpacity
              style={styles.fullWidth}
              disabled={!isValid || loading}
              onPress={handleSend}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.gradientText}>SEND</Text>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      {confirmVisible && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCard,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons name="send" size={40} color="#6A5AE0" />
            <Text style={styles.modalTitle}>Confirm Transaction</Text>

            <View style={styles.summaryRow}>
              <Text>Amount</Text>
              <Text>{summary.amount} GLMT</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text>Network Fee</Text>
              <Text>{summary.burnHours} Hours</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text>Change</Text>
              <Text>{summary.changeCoins.toFixed(6)} GLMT</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={{ fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={["#6A5AE0", "#4E5BD5"]}
                style={styles.modalConfirm}
              >
                <TouchableOpacity
                  style={{ padding: 12 }}
                  onPress={confirmTransaction}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Success Modal */}
      {successVisible && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCard,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={60}
              color="#4CAF50"
            />
            <Text style={styles.modalTitle}>Transaction Sent</Text>
            <Text style={styles.txidText}>{txId}</Text>

            <LinearGradient
              colors={["#6A5AE0", "#4E5BD5"]}
              style={[styles.modalConfirm, { marginTop: 20 }]}
            >
              <TouchableOpacity
                style={{ padding: 14 }}
                onPress={closeSuccess}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Back to Wallet
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  dropdownContainer: {
    borderWidth: 0,
    borderRadius: 12,
  },
  addressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  addressInput: {
    flex: 1,
    paddingVertical: 14,
  },
  qrButton: {
    padding: 8,
  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 30,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    width: "45%",
    backgroundColor: "#E0E0E0",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    paddingVertical: 14,
    fontWeight: "600",
  },
  sendBtn: {
    width: "45%",
    borderRadius: 30,
  },
  fullWidth: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  gradientText: {
    color: "#fff",
    fontWeight: "700",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 6,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "space-between",
  },
  modalCancel: {
    backgroundColor: "#eee",
    borderRadius: 30,
    width: "48%",
    alignItems: "center",
    padding: 12,
  },
  modalConfirm: {
    borderRadius: 30,
    width: "48%",
    alignItems: "center",
  },
  txidText: {
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
});