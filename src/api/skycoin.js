import axios from 'axios';

const API = 'https://api.skycoin.net';

export async function getBalance(address){
  const res = await axios.get(`${API}/api/v1/balance?addrs=${address}`);
  return res.data;
}

export async function broadcastTx(tx){
  return axios.post(`${API}/api/v1/injectTransaction`,{rawtx:tx});
}
