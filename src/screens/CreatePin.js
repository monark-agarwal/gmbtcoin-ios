import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform
} from 'react-native';

export default function CreatePin({ navigation }) {
  const [pin, setPin] = useState('');
  const scale = new Animated.Value(1);

  function animateDot() {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePress(num) {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      animateDot();

      if (newPin.length === 4) {
        setTimeout(() => {
          navigation.navigate('ConfirmPin', { pin: newPin });
        }, 200);
      }
    }
  }

  function remove() {
    setPin(pin.slice(0, -1));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create PIN</Text>

      {/* PIN Dots */}
      <View style={styles.dots}>
        {[0,1,2,3].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              pin.length > i && styles.filled,
              pin.length - 1 === i && {
                transform: [{ scale }]
              }
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
  <MaterialIcons
    name="backspace"
    size={28}
    color="#fff"
  />
</TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5E60CE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 30,
  },

  dots: {
    flexDirection: 'row',
    marginBottom: 50,
  },

  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    marginHorizontal: 12,
  },

  filled: {
    backgroundColor: '#fff',
  },

  keypad: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  keyButton: {
    width: '30%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 40,
  },

  keyText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '500',
  },
});
