import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function QRScanner() {
  const navigation = useNavigation();
  const route = useRoute();
  const onScan = route.params?.onScan;

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  const scanLine = useRef(new Animated.Value(0)).current;

  // Animate scanning line
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, {
          toValue: 220,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLine, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!permission) return <View style={{ flex: 1 }} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#6A5AE0", marginTop: 10 }}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                onScan && onScan(data);
                navigation.goBack();
              }
        }
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />

        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />

          <View style={styles.scanBox}>
            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLine }] },
              ]}
            />
          </View>

          <View style={styles.sideOverlay} />
        </View>

        <View style={styles.bottomOverlay} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        Align QR code within the frame
      </Text>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>

      {/* Flash Toggle */}
      <TouchableOpacity
        style={styles.flashButton}
        onPress={() => setTorch(!torch)}
      >
        <Text style={styles.buttonText}>
          {torch ? "Flash Off" : "Flash On"}
        </Text>
      </TouchableOpacity>

      {/* Scan Again */}
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgain}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  middleRow: {
    flexDirection: "row",
    height: 250,
  },

  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#00FFAA",
    overflow: "hidden",
  },

  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#00FFAA",
  },

  instruction: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    color: "#fff",
    fontSize: 16,
  },

  cancelButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },

  flashButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },

  scanAgain: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#6A5AE0",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
});