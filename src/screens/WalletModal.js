import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as bip39 from "bip39";
import * as Clipboard from "expo-clipboard";
import { createWallet } from "../storage/walletStorage";
import { NativeModules } from "react-native";

const { GMBTModule } = NativeModules;

export default function WalletModal({
  visible,
  onClose,
  mode,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [seed, setSeed] = useState("");
  const [confirmSeed, setConfirmSeed] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      resetFields();
      if (mode === "new") generateSeed();
    }
  }, [visible, mode]);

  const resetFields = () => {
    setName("");
    setSeed("");
    setConfirmSeed("");
    setShowSeed(false);
    setError("");
  };

  const generateSeed = async () => {
    try {
      const mnemonic = await GMBTModule.newWordSeed();
      setSeed(mnemonic);
      setConfirmSeed(""); // must manually confirm
    } catch {
      Alert.alert("Error", "Failed to generate seed");
    }
  };

  const validate = () => {
    if (!name.trim()) {
      setError("Wallet name required");
      return false;
    }

    if (!bip39.validateMnemonic(seed.trim())) {
      setError("Invalid seed phrase");
      return false;
    }

    if (seed.trim() !== confirmSeed.trim()) {
      setError("Seed mismatch");
      return false;
    }

    setError("");
    return true;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    const walletId = Date.now().toString();
    const addressList = await GMBTModule.getAddresses(seed, 5);

    const parsed = JSON.parse(addressList).map((addr, index) => ({
      index,
      address: addr,
    }));

    await createWallet({
      walletId,
      walletName: name,
      seedValue: seed,
      addresses: parsed,
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {mode === "new" ? "New Wallet" : "Load Wallet"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Wallet Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter wallet name"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Seed Phrase</Text>

            {mode === "new" ? (
              <>
                <View style={styles.seedBox}>
                  <Text selectable>
                    {showSeed ? seed : "Tap reveal to show seed"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity onPress={() => setShowSeed(!showSeed)}>
                    <Text style={styles.link}>
                      {showSeed ? "Hide" : "Reveal"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => Clipboard.setStringAsync(seed)}
                  >
                    <Text style={styles.link}>Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={generateSeed}>
                    <Text style={styles.link}>Refresh</Text>
                  </TouchableOpacity>
                </View>

                {/* Confirm Seed REQUIRED */}
                <Text style={styles.label}>Confirm Seed</Text>
                <TextInput
                  multiline
                  style={styles.input}
                  placeholder="Re-enter seed phrase"
                  value={confirmSeed}
                  onChangeText={setConfirmSeed}
                />
              </>
            ) : (
              <>
                {/* Load mode - blank seed */}
                <TextInput
                  multiline
                  style={styles.input}
                  placeholder="Enter seed phrase"
                  value={seed}
                  onChangeText={setSeed}
                />

                <Text style={styles.label}>Confirm Seed</Text>
                <TextInput
                  multiline
                  style={styles.input}
                  placeholder="Confirm seed phrase"
                  value={confirmSeed}
                  onChangeText={setConfirmSeed}
                />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancel} onPress={onClose}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.create} onPress={handleCreate}>
                <Text style={{ color: "#fff" }}>
                  {mode === "new" ? "Create" : "Load"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  label: { marginTop: 10 },
  input: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  seedBox: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  link: { color: "#6A5AE0", fontWeight: "bold" },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancel: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  create: {
    padding: 12,
    backgroundColor: "#6A5AE0",
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  error: { color: "red", marginTop: 8 },
});