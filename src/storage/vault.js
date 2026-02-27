import * as SecureStore from 'expo-secure-store';

export async function save(key,val){
  return SecureStore.setItemAsync(key,JSON.stringify(val));
}

export async function load(key){
  const v = await SecureStore.getItemAsync(key);
  return v?JSON.parse(v):null;
}
