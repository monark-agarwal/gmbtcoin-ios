import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Nav from './src/navigation';

export default function App(){
  return(
    <NavigationContainer>
      <Nav/>
    </NavigationContainer>
  );
}