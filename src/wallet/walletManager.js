import * as SecureStore from 'expo-secure-store';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { v4 as uuid } from 'uuid';

const KEY = 'WALLETS';

export async function createWallet() {
  const mnemonic = bip39.generateMnemonic(128);

  const seed = await bip39.mnemonicToSeed(mnemonic);

  const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0,32));

  const wallet = {
    id: uuid(),
    mnemonic,
    publicKey: Buffer.from(keypair.publicKey).toString('hex'),
    secretKey: Buffer.from(keypair.secretKey).toString('hex'),
    createdAt: Date.now()
  };

  const wallets = await getWallets();
  wallets.push(wallet);

  await SecureStore.setItemAsync(KEY, JSON.stringify(wallets));

  return wallet;
}

export async function importWallet(mnemonic) {
  if(!bip39.validateMnemonic(mnemonic)){
    throw "Invalid Seed";
  }

  const seed = await bip39.mnemonicToSeed(mnemonic);

  const keypair = nacl.sign.keyPair.fromSeed(seed.slice(0,32));

  const wallet = {
    id: uuid(),
    mnemonic,
    publicKey: Buffer.from(keypair.publicKey).toString('hex'),
    secretKey: Buffer.from(keypair.secretKey).toString('hex'),
    createdAt: Date.now()
  };

  const wallets = await getWallets();
  wallets.push(wallet);

  await SecureStore.setItemAsync(KEY, JSON.stringify(wallets));

  return wallet;
}

export async function getWallets() {
  const data = await SecureStore.getItemAsync(KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteWallet(id){
  let wallets = await getWallets();
  wallets = wallets.filter(w=>w.id!==id);

  await SecureStore.setItemAsync(KEY, JSON.stringify(wallets));
}
