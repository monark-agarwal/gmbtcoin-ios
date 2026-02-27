import React,{useEffect,useState} from 'react';
import {View,Text,Button,FlatList} from 'react-native';
import {getWallets,createWallet,deleteWallet} from '../wallet/walletManager';

export default function Home({navigation}){

  const [wallets,setWallets]=useState([]);

  async function load(){
    setWallets(await getWallets());
  }

  useEffect(()=>{load()},[]);

  return(
    <View style={{flex:1,padding:20}}>
      <Text style={{fontSize:24}}>Skycoin Wallet</Text>

      <Button title="Create Wallet" onPress={() => navigation.navigate('SafeguardSeed')} />


      <FlatList
        data={wallets}
        keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <View style={{margin:10}}>
            <Text>{item.publicKey}</Text>

            <Button title="Open" onPress={()=>{
              navigation.navigate('Wallet',{wallet:item})
            }}/>

            <Button title="Delete" color="red" onPress={async()=>{
              await deleteWallet(item.id);
              load();
            }}/>
          </View>
        )}
      />
    </View>
  );
}
