import { createConfig, http } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  autoConnect: true, // Automatically connect if a wallet is already connected
  chains: [baseSepolia, base],
  connectors: [
    () => metaMask(),
    () => coinbaseWallet({
      appName: 'AI Feedback Tool',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http()
  },
});

// import { http, createConfig } from 'wagmi'
// import { mainnet, sepolia } from 'wagmi/chains'

// export const config = createConfig({
//   chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// })