import axios from 'axios';

export async function createMPCWallet(metamaskAddress: string) {
  try {
    const response = await axios.post('https://api.coinbase.com/mpc-wallet', {
      owner: metamaskAddress,
      walletName: `MPC Wallet for ${metamaskAddress}`,
    });

    return response.data;
  } catch (error) {
    throw new Error('Failed to create MPC wallet');
  }
}
