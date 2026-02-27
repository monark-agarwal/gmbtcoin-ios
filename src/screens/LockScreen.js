import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LockScreen({ navigation }) {
  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert("No biometric hardware found");
        // Optionally navigate to Home or fallback screen
        navigation.replace('Home');
        return;
      }
      
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert("No biometrics enrolled");
        navigation.replace('Home');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        navigation.replace('Home');  // Move forward on success
      } else {
        Alert.alert("Authentication failed, try again.");
        // Optionally you can navigate back or retry
      }
    })();
  }, []);

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Authenticating...</Text>
    </View>
  );
}
