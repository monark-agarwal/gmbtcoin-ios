import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getPin } from '../utils/security';
import {getWallets} from '../storage/walletStorage'

export default function AuthCheck({ navigation }) {
  useEffect(() => {
    async function checkUser() {
      const storedPin = await getPin();
      const storedWallet = await getWallets()
      if (storedPin && storedWallet && storedWallet.length > 0){
        navigation.replace("EnterPin", {
        mode: "enter"
      });
      } else {
        navigation.replace("EnterPin", {
        mode: "create"
      });
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