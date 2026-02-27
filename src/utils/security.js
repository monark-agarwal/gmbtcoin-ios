import * as SecureStore from "expo-secure-store";

const PIN_KEY = "USER_PIN";
const NODE_URL_KEY = "NODE_URL";

export async function savePin(pin) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function getPin() {
  return await SecureStore.getItemAsync(PIN_KEY);
}

export async function saveNodeUrl(url) {
  await SecureStore.setItemAsync(NODE_URL_KEY, url);
}

export async function getNodeUrl() {
  return await SecureStore.getItemAsync(NODE_URL_KEY);
}

export async function clearStorage() {
  await SecureStore.deleteItemAsync(PIN_KEY);
}