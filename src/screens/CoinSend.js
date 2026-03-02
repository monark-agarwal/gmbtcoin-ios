import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getWalletHashes, postTransaction } from "../api/walletApi";
import { NativeModules } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------------------------
     Initialize wallets
  ----------------------------------*/
  useEffect(() => {
    if (route.params?.wallets) {
      setWallets(route.params.wallets);
    }
  }, [route.params?.wallets]);

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

  /* ---------------------------------
     Update selectedWallet on dropdown change
  ----------------------------------*/
  useEffect(() => {
    const wallet = wallets.find((w) => w.id === walletValue);
    if (wallet) setSelectedWallet(wallet);
  }, [walletValue]);

  /* ---------------------------------
     QR Scan Return
  ----------------------------------*/
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

  /* =================================
     TRANSACTION LOGIC
  ==================================*/
  const handleSend = async () => {
    try {
      if (!selectedWallet) {
        Alert.alert("Error", "Please select wallet");
        return;
      }

      setLoading(true);

      const walletAddresses = selectedWallet.addresses
        .map((a) => a.address?.Address)
        .join(",");

      const outputs = await getWalletHashes(walletAddresses);

      if (!outputs?.head_outputs) {
        throw new Error("Invalid UTXO response");
      }

      let remaining = parseFloat(amount);
      let inputs = [];
      let outputsArray = [];

      for (let item of outputs.head_outputs) {
        if (remaining <= 0) break;

        const coins = parseFloat(item.coins);

        const matchingAddress = selectedWallet.addresses.find(
          (a) => a.address?.Address === item.address
        );

        if (!matchingAddress) continue;

        inputs.push({
          Secret: matchingAddress.address.Secret,
          Hash: item.hash,
        });

        if (coins >= remaining) {
          outputsArray.push({
            Address: address,
            Coins: Math.round(remaining * 1000000),
            Hours: 0,
          });

          const change = coins - remaining;

          if (change > 0) {
            outputsArray.push({
              Address: item.address,
              Coins: Math.round(change * 1000000),
              Hours: 0,
            });
          }

          remaining = 0;
        } else {
          outputsArray.push({
            Address: address,
            Coins: Math.round(coins * 1000000),
            Hours: 0,
          });

          remaining -= coins;
        }
      }

      if (remaining > 0) {
        throw new Error("Insufficient balance");
      }

      const rawtx = await GMBTModule.prepareTransaction(
        JSON.stringify(inputs),
        JSON.stringify(outputsArray)
      );

      const txid = await postTransaction(rawtx);

      Alert.alert("Success", `TXID: ${txid}`);
      navigation.goBack();
    } catch (error) {
      console.log("TX ERROR:", error);
      Alert.alert("Transaction Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =================================
     UI
  ==================================*/
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
  containerStyle={{ marginBottom: 15, zIndex: 1000 }}
  style={{
    backgroundColor: "#fff", // box background
    borderWidth: 0,           // remove box border
    elevation: 0,             // remove shadow on Android
  }}
  dropDownContainerStyle={{
    backgroundColor: "#fff", // dropdown list background
    borderWidth: 0,           // remove dropdown border
    elevation: 0,             // remove shadow on Android
  }}
  arrowIconStyle={{
    tintColor: "#6A5AE0",     // light purple arrow
  }}
  tickIconStyle={{
    tintColor: "#6A5AE0",     // checkmark icon color
  }}
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

        <Text style={styles.label}>Note</Text>
        <TextInput
          placeholder="Notes"
          value={note}
          onChangeText={setNote}
          style={styles.inputBox}
        />

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>

          <LinearGradient
            colors={isValid ? ["#6A5AE0", "#4E5BD5"] : ["#ddd", "#ddd"]}
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

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { padding: 20 },
  header: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 20 },
  label: { marginBottom: 6, fontWeight: "500", marginTop: 10 },

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

  addressInput: { flex: 1, fontSize: 15 },

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

  cancelText: { fontWeight: "600" },

  sendBtn: { borderRadius: 30, width: "48%" },

  fullWidth: { padding: 15, alignItems: "center" },

  gradientText: { color: "#fff", fontWeight: "600" },
});