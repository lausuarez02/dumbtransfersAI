// import { createConfig, http } from "wagmi";
// import { baseSepolia, base } from "wagmi/chains";
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

// export const config = createConfig({
//   chains: [baseSepolia, base],
//   connectors: [
//     metaMask(),
//     coinbaseWallet({
//       appName: 'AI Feedback Tool',
//       preference: 'smartWalletOnly',
//     }),
//   ],
//   transports: {
//     [baseSepolia.id]: http(),
//     [base.id]: http()
//   },
// });

import { http, createConfig } from '@wagmi/core'
import { baseSepolia, base } from '@wagmi/core/chains'

export const config = createConfig({
  chains: [base],
    connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'AI Feedback Tool',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
    // [baseSepolia.id]: http(),
  },
})

// import { http, createConfig } from 'wagmi'
// import { mainnet, sepolia } from 'wagmi/chains'

// export const config = createConfig({
//   chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// })