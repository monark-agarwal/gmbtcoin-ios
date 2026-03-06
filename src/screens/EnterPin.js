import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { savePin, getPin } from "../utils/security";

const PIN_LENGTH = 6;

export default function EnterPin({ navigation, route }) {

  const { mode } = route.params || { mode: "enter" };
  // modes: create | confirm | enter

  const [pin, setPin] = useState("");
  const [tempPin, setTempPin] = useState(route.params?.tempPin || "");

  function handlePress(num) {
    if (pin.length >= PIN_LENGTH) return;

    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      processPin(newPin);
    }
  }

  async function processPin(inputPin) {
    if (mode === "create") {
      navigation.replace("EnterPin", {
        mode: "confirm",
        tempPin: inputPin
      });
      setPin("");
      return;
    }

    if (mode === "confirm") {
      if (inputPin === tempPin) {
        await savePin(inputPin);
        navigation.replace("CreateWallet");
      } else {
        Alert.alert("PIN mismatch", "Please try again");
        setPin("");
      }
      return;
    }

    if (mode === "enter") {
      const storedPin = await getPin();

      if (storedPin === inputPin) {
        navigation.replace("MainWallet");
      } else {
        Alert.alert("Incorrect PIN");
        setPin("");
      }
    }
  }

  function remove() {
    setPin(pin.slice(0, -1));
  }

  const title =
    mode === "create"
      ? "Create PIN"
      : mode === "confirm"
      ? "Confirm PIN"
      : "Enter PIN";

  return (
    <View style={styles.container}>

      <Text style={styles.title}>{title}</Text>

      {/* PIN DOTS */}
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.filled
            ]}
          />
        ))}
      </View>

      {/* KEYPAD */}
      <View style={styles.keypad}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <TouchableOpacity
            key={n}
            style={styles.keyButton}
            onPress={() => handlePress(n.toString())}
          >
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.keyButton} />

        <TouchableOpacity
          style={styles.keyButton}
          onPress={() => handlePress("0")}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keyButton}
          onPress={remove}
        >
          <MaterialIcons name="backspace" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#5E60CE",
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    fontSize: 26,
    color: "#fff",
    marginBottom: 40,
    fontWeight: "600"
  },

  dots: {
    flexDirection: "row",
    marginBottom: 60
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
    marginHorizontal: 10
  },

  filled: {
    backgroundColor: "#fff"
  },

  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  keyButton: {
    width: "30%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },

  keyText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "500"
  }

});