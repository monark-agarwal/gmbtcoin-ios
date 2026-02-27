import React,{useEffect,useState} from 'react';
import {View,Text,Button} from 'react-native';
import {getBalance} from '../api/skycoin';

export default function Wallet({route}){

  const {wallet}=route.params;
  const [balance,setBalance]=useState(null);

  useEffect(()=>{
    load();
  },[]);

  async function load(){
    const b = await getBalance(wallet.publicKey);
    setBalance(b);
  }

  return(
    <View style={{flex:1,padding:20}}>
      <Text>Address:</Text>
      <Text>{wallet.publicKey}</Text>

      <Text>Balance:</Text>
      <Text>{JSON.stringify(balance)}</Text>

      <Button title="Refresh" onPress={load}/>
    </View>
  );
}
