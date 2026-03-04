import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import Svg, { Path } from "react-native-svg";
import { getWalletBalance } from "../api/walletApi";
import { getSeed } from "../storage/walletStorage";

const { width } = Dimensions.get("window");

export default function WalletDetails({ route, navigation }) {
  const { wallet } = route.params;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [seedModalVisible, setSeedModalVisible] = useState(false);
  const [seed, setSeed] = useState(null);
  const [seedLoading, setSeedLoading] = useState(false);

  const animatedTotal = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const [totalBalance, setTotalBalance] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    loadBalances();
  }, []);

  /* Wave Animation */
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const loadBalances = async () => {
    try {
      setLoading(true);

      const updatedAddresses = await Promise.all(
        wallet.addresses.map(async (item) => {
          const addr = item.address.Address;
          const balance = await getWalletBalance([addr]);

          return {
            ...item,
            coins: balance?.coins || 0,
            hours: balance?.hours || 0,
          };
        })
      );

      const totalCoins = updatedAddresses.reduce(
        (sum, a) => sum + a.coins,
        0
      );

      const totalHrs = updatedAddresses.reduce(
        (sum, a) => sum + a.hours,
        0
      );

      setAddresses(updatedAddresses);
      setTotalBalance(totalCoins);
      setTotalHours(totalHrs);

      Animated.timing(animatedTotal, {
        toValue: totalCoins,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      animatedTotal.addListener((v) => {
        setAnimatedBalance(v.value);
      });
    } catch (error) {
      console.log("Detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const truncate = (addr) =>
    `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  const copyAddress = async (address) => {
    await Clipboard.setStringAsync(address);
  };

  const handleShowSeed = async () => {
    try {
      setSeedLoading(true);
      const storedSeed = await getSeed(wallet.id);
      setSeed(storedSeed);
      setSeedModalVisible(true);
    } catch (error) {
      console.log("Seed load error:", error);
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
        colors={["#6A5AE0", "#5B4BDB", "#4E5BD5"]}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.waveContainer,
            { transform: [{ translateX: waveTranslate }] },
          ]}
        >
          <Svg height="140" width={width + 60}>
            <Path
              d={`M0 80 Q ${width / 2} 140 ${width} 80 T ${
                width + 60
              } 80 L ${width + 60} 140 L 0 140 Z`}
              fill="rgba(255,255,255,0.08)"
            />
          </Svg>
        </Animated.View>

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>{wallet.name}</Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleShowSeed}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="eye-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={loadBalances}>
              <Ionicons name="refresh-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* BALANCE */}
        <View style={styles.balanceContainer}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.balance}>
                {animatedBalance.toFixed(6)}
              </Text>
              <Text style={styles.currency}>GLMT</Text>
            </>
          )}
        </View>

        <View style={styles.hoursPill}>
          <Text style={styles.hoursText}>
            {totalHours} GLMT Hours
          </Text>
        </View>
      </LinearGradient>

      {/* ADDRESS LIST */}
      <FlatList
        data={addresses}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadBalances}
          />
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.left}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="key-outline"
                  size={18}
                  color="#5B4BDB"
                />
              </View>

              <View>
                <Text style={styles.addressText}>
                  {truncate(item.address.Address)}
                </Text>
                <Text style={styles.subText}>
                  {item.hours} Hours
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.coinText}>
                {item.coins.toFixed(6)}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    copyAddress(item.address.Address)
                  }
                >
                  <Ionicons
                    name="copy-outline"
                    size={20}
                    color="#5B4BDB"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setSelectedAddress(item.address.Address)
                  }
                  style={{ marginLeft: 12 }}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={22}
                    color="#5B4BDB"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* QR POPUP */}
      <Modal visible={!!selectedAddress} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Receive GLMT</Text>

            {selectedAddress && (
              <>
                <QRCode value={selectedAddress} size={200} />

                <View style={styles.addressBox}>
                  <Text numberOfLines={1} style={{ flex: 1 }}>
                    {selectedAddress}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      copyAddress(selectedAddress)
                    }
                  >
                    <Ionicons name="copy-outline" size={22} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setSelectedAddress(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SEED POPUP */}
      <Modal visible={seedModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Wallet Recovery Seed
            </Text>

            {seedLoading ? (
              <ActivityIndicator size="large" color="#6A5AE0" />
            ) : (
              <>
                <View style={styles.seedBox}>
                  <Text style={styles.seedText}>
                    {seed || "Seed not available"}
                  </Text>
                </View>

                
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                setSeedModalVisible(false);
                setSeed(null);
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight + 20
        : 20,
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
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  balanceContainer: { alignItems: "center", marginTop: 35 },
  balance: { fontSize: 36, color: "#fff", fontWeight: "700" },
  currency: { fontSize: 16, color: "#fff", marginTop: 5 },
  hoursPill: {
    alignSelf: "center",
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hoursText: { color: "#fff" },
  addressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F3F7",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4E6EF",
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E9E8FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1E2D",
  },
  subText: { fontSize: 12, color: "#8F90A6", marginTop: 4 },
  right: { alignItems: "flex-end" },
  coinText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C2C3A",
  },
  actions: { flexDirection: "row", marginTop: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#F2F3F7",
    padding: 10,
    borderRadius: 10,
    width: "100%",
  },
  seedBox: {
    backgroundColor: "#F2F3F7",
    padding: 15,
    borderRadius: 12,
    width: "100%",
  },
  seedText: {
    fontSize: 14,
    textAlign: "center",
    color: "#1E1E2D",
  },
  closeBtn: {
    marginTop: 25,
    backgroundColor: "#6A5AE0",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  closeText: { color: "#fff", fontWeight: "600" },
});