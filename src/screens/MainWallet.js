import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

import WalletModal from "./WalletModal";
import { getWallets } from "../storage/walletStorage";
import { getWalletBalance } from "../api/walletApi";

const { width } = Dimensions.get("window");

export default function MainWallet() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [walletMode, setWalletMode] = useState("new");

  const animatedValue = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const loadWallets = async () => {
    try {
      setLoading(true);
      const storedWallets = await getWallets();

      if (!storedWallets || storedWallets.length === 0) {
        setWallets([]);
        return;
      }

      const updatedWallets = await Promise.all(
        storedWallets.map(async (wallet) => {
          const addressList =
            wallet.addresses?.map((a) => a.address.Address) || [];

          const balance = await getWalletBalance(addressList);

          return {
            id: wallet.walletId,
            name: wallet.walletName,
            hours: balance?.hours || 0,
            glmt: balance?.coins || 0,
            addresses: wallet.addresses || [],
          };
        })
      );

      setWallets(updatedWallets);
    } catch (error) {
      console.log("Wallet load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.glmt, 0);
  const totalHours = wallets.reduce((sum, w) => sum + w.hours, 0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: totalBalance,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener((v) => {
      setAnimatedBalance(v.value);
    });

    return () => animatedValue.removeListener(listener);
  }, [totalBalance]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <LinearGradient
        colors={["#6A5AE0", "#5B4BDB", "#4E5BD5"]}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Animated.View
          style={[
            styles.waveContainer,
            { transform: [{ translateX: waveTranslate }] },
          ]}
        >
          <Svg height="120" width={width + 50}>
            <Path
              d={`M0 70 Q ${width / 2} 120 ${width} 70 T ${
                width + 50
              } 70 L ${width + 50} 120 L 0 120 Z`}
              fill="rgba(255,255,255,0.08)"
            />
          </Svg>
        </Animated.View>

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>My Wallets</Text>

          <TouchableOpacity onPress={loadWallets}>
            <Ionicons name="refresh-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* BALANCE */}
        <View style={styles.balanceContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.balance}>
                  {showBalance ? animatedBalance.toFixed(6) : "******"}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowBalance(!showBalance)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name={showBalance ? "eye-off" : "eye"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.currency}>GLMT</Text>
            </>
          )}
        </View>

        <View style={styles.hoursPill}>
          <Text style={styles.hoursText}>{totalHours} GLMT Hours</Text>
        </View>
      </LinearGradient>

      {/* ACTION BUTTONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setWalletMode("new");
            setWalletModalVisible(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#6A5AE0" />
          <Text style={styles.actionText}>Add Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setWalletMode("load");
            setWalletModalVisible(true);
          }}
        >
          <Ionicons name="cloud-download-outline" size={18} color="#6A5AE0" />
          <Text style={styles.actionText}>Load Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* WALLET LIST */}
      <FlatList
        data={wallets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 160 }}
        refreshing={loading}
        onRefresh={loadWallets}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.walletCard}
            onPress={() =>
              navigation.navigate("WalletDetail", { wallet: item })
            }
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="wallet-outline" size={18} color="#6A5AE0" />
              </View>

              <View>
                <Text style={styles.walletName}>{item.name}</Text>
                <Text style={styles.walletHoursSmall}>
                  {item.hours} Hours
                </Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text style={styles.walletBalanceSmall}>
                {item.glmt.toFixed(6)}
              </Text>
              <Text style={styles.walletCurrencySmall}>GLMT</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FLOATING ACTIONS */}
      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={() => navigation.navigate("MainWallet")}>
          <Ionicons name="wallet-outline" size={26} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() =>
            navigation.navigate("CoinSend", { wallets: wallets })
          }
        >
          <LinearGradient
            colors={["#6A5AE0", "#4E5BD5"]}
            style={styles.sendGradient}
          >
            <Feather name="send" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

       <TouchableOpacity
  onPress={() =>
    navigation.navigate("TransactionHistory", {
      addresses: wallets.flatMap((w) =>
        w.addresses.map((a) => a.address.Address)
      ),
    })
  }
>
  <Ionicons
    name="swap-horizontal-outline"
    size={26}
    color="#333"
  />
</TouchableOpacity>  
 </View>

      <WalletModal
        visible={walletModalVisible}
        mode={walletMode}
        onClose={() => setWalletModalVisible(false)}
        onSuccess={loadWallets}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    paddingBottom: 60,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  waveContainer: { position: "absolute", bottom: -20 },

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

  balanceContainer: { alignItems: "center", marginTop: 35 },

  balance: { fontSize: 36, color: "#fff", fontWeight: "700" },

  currency: { fontSize: 16, color: "#fff", marginTop: 4 },

  hoursPill: {
    alignSelf: "center",
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },

  hoursText: { color: "#fff"},

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 2,
  },

  actionText: {
    marginLeft: 6,
    color: "#6A5AE0",
    fontWeight: "600",
  },

  walletCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
  },

  cardLeft: { flexDirection: "row", alignItems: "center" },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(106,90,224,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  walletName: { fontWeight: "600", color: "#333" },

  walletHoursSmall: { fontSize: 12, color: "#888", marginTop: 2 },

  cardRight: { alignItems: "flex-end" },

  walletBalanceSmall: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
  },

  walletCurrencySmall: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  bottomActions: {
    position: "absolute",
    bottom: 45,
    left: 25,
    right: 25,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 40,
    elevation: 10,
  },

  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },

  sendGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});