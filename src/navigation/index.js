import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthCheck from '../screens/AuthCheck';
import CreatePin from '../screens/CreatePin';
import ConfirmPin from '../screens/ConfirmPin';
import EnterPin from '../screens/EnterPin';
import CreateWallet from '../screens/CreateWallet';
import MainWallet from '../screens/MainWallet';
import CoinSend from '../screens/CoinSend';
import Setting from '../screens/Setting';
import QRScanner from '../screens/QRScanner';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthCheck" component={AuthCheck} />
      <Stack.Screen name="CreatePin" component={CreatePin} />
      <Stack.Screen name="ConfirmPin" component={ConfirmPin} />
      <Stack.Screen name="EnterPin" component={EnterPin} />
      <Stack.Screen name="CreateWallet" component={CreateWallet} />
      <Stack.Screen name="MainWallet" component={MainWallet} />
      <Stack.Screen name="Setting" component={Setting} />
      <Stack.Screen name="CoinSend" component={CoinSend} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
    </Stack.Navigator>
  );
}