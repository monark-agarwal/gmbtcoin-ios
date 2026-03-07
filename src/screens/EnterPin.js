import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { savePin, getPin } from "../utils/security";

const PIN_LENGTH = 6;

export default function EnterPin({ navigation, route }) {

  const { mode } = route.params || { mode: "enter" };

  const [pin, setPin] = useState("");
  const [tempPin] = useState(route.params?.tempPin || "");

  const [showDisclaimer, setShowDisclaimer] = useState(mode === "create");
  const [accepted, setAccepted] = useState(false);

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
      setPin("");

      navigation.replace("EnterPin", {
        mode: "confirm",
        tempPin: inputPin,
        from: route.params?.from
      });

      return;
    }

    if (mode === "confirm") {

      if (inputPin === tempPin) {

        await savePin(inputPin);

        if (route.params?.from === "pinchange") {
          Alert.alert(
            "Success",
            "PIN changed successfully",
            [
              {
                text: "OK",
                onPress: () => navigation.replace("MainWallet")
              }
            ]
          );
        } else {
          navigation.replace("CreateWallet");
        }

      } else {
        Alert.alert("PIN mismatch", "Please try again");
        setPin("");
      }

      return;
    }

    const storedPin = await getPin();

    if (storedPin !== inputPin) {
      Alert.alert("Incorrect PIN");
      setPin("");
      return;
    }

    if (mode === "enter") {
      navigation.replace("MainWallet");
      return;
    }

    if (mode === "pinchange") {

      setPin("");

      navigation.replace("EnterPin", {
        mode: "create",
        from: "pinchange"
      });

      return;
    }
  }

  function remove() {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }

  const title =
    mode === "create"
      ? "Create PIN"
      : mode === "confirm"
      ? "Confirm PIN"
      : mode === "pinchange"
      ? "Enter Current PIN"
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
          <MaterialIcons name="backspace" size={30} color="#fff" />
        </TouchableOpacity>

      </View>

      {/* DISCLAIMER MODAL */}
      <Modal
        visible={showDisclaimer}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Disclaimer</Text>

            <Text style={styles.modalText}>
              By continuing, you understand the risks related to the use of
              cryptographic tokens, blockchain-based software, the GLMT Coin
              mobile wallet, and the GLMT cryptocurrency. You understand that
              this product is provided as-is and agree to the Terms and
              Conditions governing its usage.
            </Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAccepted(!accepted)}
            >
              <MaterialIcons
                name={accepted ? "check-box" : "check-box-outline-blank"}
                size={24}
                color="#FF4D8D"
              />

              <Text style={styles.checkboxText}>
                Yeah, I understand
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!accepted}
              style={[
                styles.continueBtn,
                { opacity: accepted ? 1 : 0.5 }
              ]}
              onPress={() => setShowDisclaimer(false)}
            >
              <Text style={styles.continueText}>CONTINUE</Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#5E60CE",
    justifyContent:"center",
    alignItems:"center"
  },

  title:{
    fontSize:26,
    color:"#fff",
    marginBottom:40,
    fontWeight:"600"
  },

  dots:{
    flexDirection:"row",
    marginBottom:60
  },

  dot:{
    width:16,
    height:16,
    borderRadius:8,
    borderWidth:2,
    borderColor:"#fff",
    marginHorizontal:10
  },

  filled:{
    backgroundColor:"#fff"
  },

  keypad:{
    width:"80%",
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between"
  },

  keyButton:{
    width:"30%",
    height:80,
    justifyContent:"center",
    alignItems:"center",
    marginBottom:20
  },

  keyText:{
    color:"#fff",
    fontSize:30,
    fontWeight:"500"
  },

  modalContainer:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.5)",
    justifyContent:"center",
    alignItems:"center",
    padding:20
  },

  modalBox:{
    backgroundColor:"#fff",
    borderRadius:12,
    padding:25,
    width:"100%"
  },

  modalTitle:{
    fontSize:20,
    fontWeight:"700",
    marginBottom:10,
    textAlign:"center"
  },

  modalText:{
    fontSize:14,
    color:"#444",
    lineHeight:22
  },

  checkboxRow:{
    flexDirection:"row",
    alignItems:"center",
    marginTop:20
  },

  checkboxText:{
    marginLeft:10,
    fontSize:16
  },

  continueBtn:{
    marginTop:25,
    backgroundColor:"#6A5AE0",
    padding:14,
    borderRadius:30,
    alignItems:"center"
  },

  continueText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  }

});