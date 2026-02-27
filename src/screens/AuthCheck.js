import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getPin } from '../utils/security';

export default function AuthCheck({ navigation }) {
  useEffect(() => {
    async function checkUser() {
      const storedPin = await getPin();

      if (storedPin) {
        navigation.replace('CreatePin');
      } else {
        navigation.replace('CreatePin');
      }
    }

    checkUser();
  }, []);

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size="large" />
    </View>
  );
}