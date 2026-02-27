import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { savePin } from '../utils/security';

export default function ConfirmPin({ navigation, route }) {
  const originalPin = route.params.pin;
  const [pin, setPin] = useState('');

  function handlePress(num) {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (newPin === originalPin) {
          savePin(newPin);
          navigation.replace('CreateWallet');
        } else {
          Alert.alert('PIN mismatch');
          setPin('');
        }
      }
    }
  }

  function remove() {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm PIN</Text>

      {/* PIN Dots */}
      <View style={styles.dots}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.filled
            ]}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <TouchableOpacity
            key={n}
            style={styles.keyButton}
            onPress={() => handlePress(n.toString())}
            activeOpacity={0.7}
          >
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.keyButton} />

        <TouchableOpacity
          style={styles.keyButton}
          onPress={() => handlePress('0')}
          activeOpacity={0.7}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keyButton}
          onPress={remove}
          activeOpacity={0.7}
        >
          <Text style={styles.delText}>DEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5E60CE'
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 30
  },

  dots: {
    flexDirection: 'row',
    marginBottom: 50
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    marginHorizontal: 12
  },

  filled: {
    backgroundColor: '#fff'
  },

  keypad: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  keyButton: {
    width: '30%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },

  keyText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '500'
  },

  delText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1
  }
});
