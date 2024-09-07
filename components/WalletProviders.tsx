"use client";

import { config } from "@/app/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';


const queryClient = new QueryClient();

export default function WalletProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // const network = WalletAdapterNetwork.Devnet;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // const wallets = useMemo(() => [new UnsafeBurnerWalletAdapter()], [network]);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  //   <WagmiProvider config={config}>
  //   <ConnectionProvider endpoint={endpoint}>
  //     <WalletProvider wallets={wallets} autoConnect>
  //       <WalletModalProvider>
  //         <QueryClientProvider client={queryClient}>
  //           {children}
  //         </QueryClientProvider>
  //       </WalletModalProvider>
  //     </WalletProvider>
  //   </ConnectionProvider>
  // </WagmiProvider>
  );
}
