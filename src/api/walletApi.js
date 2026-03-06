import axios from "axios";
import { getNodeUrl } from "../utils/security";
import {
  DEFAULT_NODE_URL,
} from "../utils/GlobalConstants";
/**
 * Create axios instance dynamically
 */
const createApi = async () => {
  const baseURL = await getNodeUrl();
    // ✅ Fallback if null / undefined / empty string
  if (!baseURL || baseURL.trim() === "") {
    baseURL = DEFAULT_NODE_URL;
  }
  return axios.create({
    baseURL,
    timeout: 15000,
  });
};

/**
 * Wallet Balance
 */
export const getWalletBalance = async (addresses: string[] = []) => {
  try {
    if (!addresses.length) {
      return { coins: 0, hours: 0 };
    }

    const api = await createApi();

    const { data } = await api.get("/api/v1/balance", {
      params: { addrs: addresses.join(",") },
    });

    return {
      coins: (data.confirmed?.coins || 0) / 1_000_000,
      hours: data.confirmed?.hours || 0,
      addresses: data.addresses || {},
    };
  } catch (error) {
    console.log("Balance API error:", error?.message);
    return { coins: 0, hours: 0 };
  }
};

/**
 * Wallet Outputs (Hashes)
 */
export const getWalletHashes = async (addresses: string[]) => {
  try {
    const api = await createApi();

    const { data } = await api.get("/api/v1/outputs", {
      params: { addrs: addresses },
    });

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Transaction History
 */
export const getTransactionHistory = async (addresses: string[]) => {
  try {
    const api = await createApi();

    const { data } = await api.get("/api/v1/transactions", {
      params: {
        verbose: 1,
        addrs: addresses.join(","),
      },
    });

    return data;
  } catch (error) {
    console.log("Transaction error:", error?.message);
    throw error;
  }
};

/**
 * CSRF Token
 */
export const getCSRFToken = async () => {
  const api = await createApi();
  const { data } = await api.get("/api/v1/csrf");
  return data.csrf_token || data;
};

/**
 * Inject Transaction
 */
export const postTransaction = async (rawtx: string) => {
  try {
    const api = await createApi();
    const csrfToken = await getCSRFToken();
console.log(csrfToken);
console.log(rawtx);
console.log(api);
    const { data } = await api.post(
  "/api/v1/injectTransaction",
  JSON.stringify({ rawtx }),
  {
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
  }
);

    return data;
  } catch (error) {
	  console.log(error);
    throw error;
  }
};