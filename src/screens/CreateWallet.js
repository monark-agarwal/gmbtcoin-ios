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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as bip39 from 'bip39';
import { NativeModules } from 'react-native';

const { GMBTModule } = NativeModules;

export default function CreateWallet({ navigation }) {

  const [mode, setMode] = useState('new');
  const [name, setName] = useState('');
  const [seed, setSeed] = useState('');
  const [confirmSeed, setConfirmSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    generateSeed();
  }, []);

  const generateSeed2 = () => {
    const mnemonic = bip39.generateMnemonic(128);
    setSeed(mnemonic);
    setConfirmSeed(mnemonic);
  };

const generateSeed = async () => {
  try {
console.log(GMBTModule);
    const mnemonic = await GMBTModule.newWordSeed();
    setSeed(mnemonic);
    setConfirmSeed(mnemonic);
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
    if (!name) {
      setError('Wallet name is required');
      return false;
    }

    if (!bip39.validateMnemonic(seed)) {
      setError('Invalid seed phrase');
      return false;
    }

    if (seed !== confirmSeed) {
      setError('Seed does not match');
      return false;
    }

    setError('');
    return true;
  };

const handleCreate = async () => {
  if (!validate()) return;

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
console.log(addressList);
  navigation.replace('MainWallet');
};

  const copySeed = async () => {
    await Clipboard.setStringAsync(seed);
    Alert.alert('Copied', 'Seed copied to clipboard');
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

            {/* Name */}
            <Text style={styles.label}>Wallet Name</Text>
            <TextInput
              placeholder="Enter wallet name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            {/* Seed Section */}
            <Text style={styles.label}>Seed Phrase</Text>

            {mode === 'new' ? (
              <>
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
                      Tap reveal to show seed
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

                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={copySeed}
                  >
                    <Ionicons name="copy" size={20} color="#fff" />
                    <Text style={styles.link}>Copy</Text>
                  </TouchableOpacity>
                </View>
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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff33',
    borderRadius: 30,
    marginBottom: 20
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: 'center'
  },
  activeBtn: {
    backgroundColor: '#00000088',
    borderRadius: 30
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    marginTop: 10
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  seedBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  wordItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 6
  },
  wordIndex: {
    fontWeight: 'bold',
    marginRight: 5
  },
  wordText: {
    color: '#333'
  },
  seedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  link: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6
  },
  createBtn: {
    marginTop: 20,
    backgroundColor: '#000000aa',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center'
  },
  createText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  error: {
    color: '#ffdddd',
    marginTop: 5
  }
});