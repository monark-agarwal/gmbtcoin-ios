import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WALLET_META_KEY = 'WALLET_METADATA';

// 🔹 Get all wallets
export const getWallets = async () => {
  const data = await AsyncStorage.getItem(WALLET_META_KEY);
  return data ? JSON.parse(data) : [];
};

// 🔹 Save metadata list
const saveWalletMetadata = async (wallets) => {
  await AsyncStorage.setItem(WALLET_META_KEY, JSON.stringify(wallets));
};

// 🔹 Create wallet
export const createWallet = async ({
  walletId,
  walletName,
  seedValue,
  addresses
}) => {

  // 1️⃣ Save seed securely
  await SecureStore.setItemAsync(
    `wallet_seed_${walletId}`,
    seedValue,
    { requireAuthentication: true }
  );

  // 2️⃣ Save metadata
  const wallets = await getWallets();

  const newWallet = {
    walletId,
    walletName,
    addressNumber: addresses.length,
    addresses,
    createdAt: Date.now()
  };

  wallets.push(newWallet);

  await saveWalletMetadata(wallets);
};

// 🔹 Get seed
export const getSeed = async (walletId) => {
  return await SecureStore.getItemAsync(
    `wallet_seed_${walletId}`
  );
};