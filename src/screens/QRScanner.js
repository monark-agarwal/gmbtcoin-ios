import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";

export default function QRScanner() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={{ flex: 1 }} />;
  }

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
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);

                navigation.navigate({
                  name: "CoinSend",
                  params: { scannedAddress: data },
                  merge: true, // ? THIS FIXES YOUR PROBLEM
                });
navigation.goBack();
              }
        }
      />

      {scanned && (
        <TouchableOpacity
          style={styles.scanAgain}
          onPress={() => setScanned(false)}
        >
          <Text style={{ color: "#fff" }}>Scan Again</Text>
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
  scanAgain: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#6A5AE0",
    padding: 15,
    borderRadius: 10,
  },
});