import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SafeguardSeed({ navigation }) {
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safeguard your seed!</Text>

      <Text style={styles.desc}>
        We want to make sure you wrote down your seed and stored it safely.
        If you forget your seed, you WILL NOT be able to recover your wallet.
      </Text>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
      >
        <View style={[styles.checkbox, checked && styles.checked]} />
        <Text style={styles.checkboxText}>It's safe, I swear.</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { opacity: checked ? 1 : 0.4 }]}
        disabled={!checked}
        onPress={() => navigation.navigate('CreatePin')}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:20, backgroundColor:'#5E60CE' },
  title: { fontSize:24, color:'#fff', fontWeight:'bold', textAlign:'center', marginBottom:20 },
  desc: { color:'#eee', textAlign:'center', marginBottom:30 },
  checkboxRow: { flexDirection:'row', alignItems:'center', marginBottom:30 },
  checkbox: { width:22, height:22, borderWidth:2, borderColor:'#fff', marginRight:10 },
  checked: { backgroundColor:'#fff' },
  checkboxText: { color:'#fff' },
  button: { backgroundColor:'#3A0CA3', padding:15, borderRadius:30 },
  buttonText: { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
