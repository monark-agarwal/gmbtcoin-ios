import axios from "axios";

const NODE_URL = "https://coin5.glbrain.com";

export const getWalletBalance = async (addresses = []) => {
  try {
    if (!addresses.length) {
      return { coins: 0, hours: 0 };
    }

    const addressString = addresses.join(",");
console.log(`${NODE_URL}/api/v1/balance?addrs=${addressString}`);
    const response = await axios.get(
      `${NODE_URL}/api/v1/balance?addrs=${addressString}`
    );

    const data = response.data;

    return {
      coins: (data.confirmed?.coins || 0) / 1000000,
      hours: data.confirmed?.hours || 0,
      addresses: data.addresses || {}
    };

  } catch (error) {
    console.log("Balance API error:", error.message);
    return { coins: 0, hours: 0 };
  }
};

export const getWalletHashes = async (addresses) => {
  try {
    const response = await axios.get(
      `${NODE_URL}/api/v1/outputs?addrs=${addresses}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postTransaction = async (rawtx) => {
  try {
    const response = await axios.post(
      `${NODE_URL}/api/v1/injectTransaction`,
      { rawtx }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};