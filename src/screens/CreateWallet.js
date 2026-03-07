import React, { useState, useEffect } from 'react';
import { createWallet } from '../storage/walletStorage';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as bip39 from "bip39";
import { NativeModules } from 'react-native';

const { GMBTModule } = NativeModules;

export default function CreateWallet({ navigation }) {

  const [mode, setMode] = useState('new');
  const [name, setName] = useState('');
  const [seed, setSeed] = useState('');
  const [confirmSeed, setConfirmSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [error, setError] = useState('');

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);

  useEffect(() => {
    generateSeed();
  }, []);

  const generateSeed = async () => {
    try {
      const mnemonic = await GMBTModule.newWordSeed();
	  console.log(mnemonic);
      setSeed(mnemonic);
      setConfirmSeed('');
    } catch (e) {
      Alert.alert('Error', 'Failed to generate seed');
    }
  };

  const switchMode = (selectedMode) => {

    setMode(selectedMode);
    setError('');

    if (selectedMode === 'new') {
      generateSeed();
    } else {
      setSeed('');
      setConfirmSeed('');
    }
  };

  const validate = () => {

    if (!name.trim()) {
      setError('Wallet name is required');
      return false;
    }
    if (!bip39.validateMnemonic(seed)) {
      setError('Invalid seed phrase');
      return false;
    }

    if (seed !== confirmSeed) {
      setError('Seed phrase does not match');
      return false;
    }

    setError('');
    return true;
  };

  const handleCreate = async () => {

    if (!validate()) return;

    if (mode === "new" && !seedConfirmed) {
      setShowDisclaimer(true);
      return;
    }

    try {

      const walletId = Date.now().toString();

      const addressList = await GMBTModule.getAddresses(seed, 5);

      const parsedAddresses = JSON.parse(addressList).map((addr, index) => ({
        index,
        address: addr
      }));

      await createWallet({
        walletId,
        walletName: name,
        seedValue: seed,
        addresses: parsedAddresses
      });

      navigation.replace('MainWallet');

    } catch (err) {
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const seedWords = seed.split(' ');

  return (
    <LinearGradient colors={['#6A5AE0', '#4E5BD5']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >

            <Text style={styles.title}>Create a Wallet</Text>

            {/* Toggle */}
            <View style={styles.toggle}>

              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'new' && styles.activeBtn]}
                onPress={() => switchMode('new')}
              >
                <Text style={styles.toggleText}>New</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'load' && styles.activeBtn]}
                onPress={() => switchMode('load')}
              >
                <Text style={styles.toggleText}>Load</Text>
              </TouchableOpacity>

            </View>

            {/* Wallet Name */}
            <Text style={styles.label}>Wallet Name</Text>

            <TextInput
              placeholder="Enter wallet name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            {/* Seed */}
            <Text style={styles.label}>Seed Phrase</Text>

            {mode === 'new' ? (

              <>
                <Text style={styles.warning}>
                  ⚠️ Write down your recovery phrase. Anyone with this phrase can access your wallet.
                </Text>

                <View style={styles.seedBox}>

                  {showSeed ? (

                    <View style={styles.wordGrid}>

                      {seedWords.map((word, index) => (

                        <View key={index} style={styles.wordItem}>
                          <Text style={styles.wordIndex}>{index + 1}.</Text>
                          <Text style={styles.wordText}>{word}</Text>
                        </View>

                      ))}

                    </View>

                  ) : (

                    <Text style={{ textAlign: 'center', color: '#888' }}>
                      Tap reveal to show seed phrase
                    </Text>

                  )}

                </View>

                <View style={styles.seedActions}>

                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => setShowSeed(!showSeed)}
                  >
                    <Ionicons
                      name={showSeed ? 'eye-off' : 'eye'}
                      size={20}
                      color="#fff"
                    />

                    <Text style={styles.link}>
                      {showSeed ? 'Hide' : 'Reveal'}
                    </Text>

                  </TouchableOpacity>

                </View>

                <Text style={styles.label}>Confirm Seed Phrase</Text>

                <TextInput
                  multiline
                  placeholder="Type the seed phrase to confirm"
                  style={styles.input}
                  value={confirmSeed}
                  onChangeText={setConfirmSeed}
                />

              </>

            ) : (

              <>
                <TextInput
                  multiline
                  placeholder="Enter your existing seed"
                  style={styles.input}
                  value={seed}
                  onChangeText={setSeed}
                />

                <Text style={styles.label}>Confirm Seed</Text>

                <TextInput
                  multiline
                  placeholder="Confirm wallet seed"
                  style={styles.input}
                  value={confirmSeed}
                  onChangeText={setConfirmSeed}
                />

              </>

            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleCreate}
            >
              <Text style={styles.createText}>
                {mode === 'new' ? 'CREATE WALLET' : 'LOAD WALLET'}
              </Text>
            </TouchableOpacity>

          </ScrollView>

        </KeyboardAvoidingView>

        {/* Disclaimer Modal */}

        <Modal visible={showDisclaimer} transparent animationType="fade">

          <View style={styles.modalOverlay}>

            <View style={styles.modalBox}>

              <Text style={styles.modalTitle}>
                Safeguard your seed!
              </Text>

              <Text style={styles.modalText}>
                Make sure you wrote down your seed phrase and stored it safely.
                If you lose this seed, you will NOT be able to recover your wallet.
              </Text>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSeedConfirmed(!seedConfirmed)}
              >

                <View style={[
                  styles.checkbox,
                  seedConfirmed && styles.checkboxActive
                ]}>

                  {seedConfirmed && (
                    <Ionicons name="checkmark" size={16} color="#fff"/>
                  )}

                </View>

                <Text style={styles.checkboxText}>
                  I saved my recovery phrase safely
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                disabled={!seedConfirmed}
                style={[
                  styles.continueBtn,
                  { opacity: seedConfirmed ? 1 : 0.5 }
                ]}
                onPress={() => {
                  setShowDisclaimer(false);
                  handleCreate();
                }}
              >

                <Text style={styles.continueText}>
                  CONTINUE
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowDisclaimer(false);
                  setSeedConfirmed(false);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

            </View>

          </View>

        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({

scrollContainer:{
flexGrow:1,
justifyContent:'center',
padding:24
},

title:{
fontSize:26,
fontWeight:'bold',
color:'#fff',
textAlign:'center',
marginBottom:20
},

toggle:{
flexDirection:'row',
backgroundColor:'#ffffff33',
borderRadius:30,
marginBottom:20
},

toggleBtn:{
flex:1,
padding:10,
alignItems:'center'
},

activeBtn:{
backgroundColor:'#00000088',
borderRadius:30
},

toggleText:{
color:'#fff',
fontWeight:'bold'
},

label:{
color:'#fff',
marginBottom:5,
marginTop:10
},

input:{
backgroundColor:'#fff',
borderRadius:10,
padding:12,
marginBottom:10
},

seedBox:{
backgroundColor:'#fff',
borderRadius:12,
padding:15,
marginBottom:10
},

wordGrid:{
flexDirection:'row',
flexWrap:'wrap'
},

wordItem:{
width:'50%',
flexDirection:'row',
marginBottom:6
},

wordIndex:{
fontWeight:'bold',
marginRight:5
},

wordText:{
color:'#333'
},

seedActions:{
flexDirection:'row',
justifyContent:'space-between',
marginBottom:10
},

iconBtn:{
flexDirection:'row',
alignItems:'center'
},

link:{
color:'#fff',
fontWeight:'bold',
marginLeft:6
},

createBtn:{
marginTop:20,
backgroundColor:'#000000aa',
padding:16,
borderRadius:30,
alignItems:'center'
},

createText:{
color:'#fff',
fontWeight:'bold'
},

error:{
color:'#ffdddd',
marginTop:5
},

warning:{
color:'#fff',
marginBottom:10,
fontSize:13,
textAlign:'center'
},

modalOverlay:{
flex:1,
backgroundColor:'rgba(0,0,0,0.5)',
justifyContent:'center',
alignItems:'center',
padding:25
},

modalBox:{
width:'100%',
backgroundColor:'#fff',
borderRadius:18,
padding:25
},

modalTitle:{
fontSize:20,
fontWeight:'700',
color:'#E53935',
textAlign:'center',
marginBottom:10
},

modalText:{
fontSize:15,
color:'#555',
textAlign:'center',
lineHeight:22,
marginBottom:20
},

checkboxRow:{
flexDirection:'row',
alignItems:'center',
justifyContent:'center',
marginBottom:20
},

checkbox:{
width:22,
height:22,
borderWidth:2,
borderColor:'#6A5AE0',
borderRadius:5,
marginRight:10,
alignItems:'center',
justifyContent:'center'
},

checkboxActive:{
backgroundColor:'#6A5AE0'
},

checkboxText:{
fontSize:14,
color:'#333'
},

continueBtn:{
backgroundColor:'#6A5AE0',
padding:14,
borderRadius:30,
alignItems:'center'
},

continueText:{
color:'#fff',
fontWeight:'700'
},

cancelText:{
marginTop:12,
textAlign:'center',
color:'#888'
}

});