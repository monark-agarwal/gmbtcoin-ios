import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function MainWallet() {
  const navigation = useNavigation();

  const wallets = [
    { id: "1", name: "monark", hours: 0, glmt: 0.0 },
    { id: "2", name: "skycoin", hours: 2, glmt: 10.5 },
    { id: "3", name: "backup", hours: 1, glmt: 5.2 },
  ];

  const totalBalance = wallets.reduce((sum, w) => sum + w.glmt, 0);
  const totalHours = wallets.reduce((sum, w) => sum + w.hours, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER GRADIENT (Matched to Screenshot Purple) */}
      <LinearGradient
        colors={["#6A5AE0", "#5B4BDB", "#4E5BD5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Wallets</Text>

          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balance}>{totalBalance}</Text>
          <Text style={styles.currency}> GLMT</Text>
        </View>

        {/* Hours Pill */}
        <View style={styles.hoursPill}>
          <Text style={styles.hoursText}>
            {totalHours} GLMT Hours
          </Text>
        </View>
      </LinearGradient>

      {/* Wallet Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Wallet</Text>
        <Text style={styles.tableHeaderText}>Hours</Text>
        <Text style={styles.tableHeaderText}>GLMT</Text>
      </View>

      {/* Wallet List (Clickable Rows) */}
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.walletRow}
            onPress={() =>
              navigation.navigate("WalletDetails", { wallet: item })
            }
          >
            <Text style={styles.walletName}>{item.name}</Text>
            <Text style={styles.walletValue}>{item.hours}</Text>
            <View style={styles.walletRight}>
              <Text style={styles.walletValue}>{item.glmt}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#999"
                style={{ marginLeft: 5 }}
              />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={() => navigation.navigate("Receive")}>
          <Ionicons name="wallet-outline" size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => navigation.navigate("CoinSend")}
        >
          <LinearGradient
            colors={["#6A5AE0", "#4E5BD5"]}
            style={styles.sendGradient}
          >
            <Feather name="send" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Swap")}>
          <Ionicons name="swap-horizontal-outline" size={30} color="#ccc" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    marginTop: 30,
  },

  balance: {
    fontSize: 38,
    color: "#fff",
    fontWeight: "700",
  },

  currency: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 5,
    fontWeight: "500",
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
    fontWeight: "500",
  },

  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ECECF3",
    marginTop: 10,
  },

  tableHeaderText: {
    fontWeight: "600",
    color: "#555",
    flex: 1,
    textAlign: "center",
  },

  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
  },

  walletName: {
    flex: 1,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },

  walletValue: {
    flex: 1,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },

  walletRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },

  bottomActions: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  sendButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    elevation: 5,
  },

  sendGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});