"use client"

import React, { useState, useEffect, useCallback } from 'react';
import FuturisticInput from '@/components/FuturisticInput';
import FuturisticButton from '@/components/FuturisticButton';
import { Send } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useSendTransaction,useWalletClient, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { parseEther } from 'viem'
import { Coinbase } from "@coinbase/coinbase-sdk";
import usdcAbi from "@/abi/usdc.json"
import { LoadingIcon } from "./LoadingIcon";
import { useQuery } from "@tanstack/react-query";
import { TransactionSuccessMessage } from "./TransactionSuccessMessage";
import { TransactionFailedMessage } from "./TransactionFailedMessage";

const DumbTransfersAIMainPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<any>([]);
  const { address } = useAccount(); // Directly destructuring address from useAccount
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [amountSend, setAmountSend] = useState<string | number>(0)
  const [mpcWallet, setMpcWallet] = useState('')
  const { writeContract } = useWriteContract()
  const account = useAccount();

  const fetchMpcWalletBalance = async () => {
    try {
      const response = await fetch('/api/get-wallet-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };
  const { isFetched, error, data, refetch, isLoading } = useQuery({
    queryKey: ["transaction-request"],
    queryFn: () =>
      fetch("/api", {
        method: "POST",
        body: JSON.stringify({ address: address, amount: amountSend }),
      }).then((res) => res.json()),
    enabled: false,
    retry: false,
  });

  const initiateRequest = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isFetched && data && !isLoading) {
      // Handle data or update state
      console.log(`checkout the data from transactionrquest${data}`)
    //   setEntries(data.entries);
    }
  }, [isFetched, data]);

const { data: walletClient } = useWalletClient();
const { sendTransaction } = useSendTransaction()

//   const handleTopUp = async () => {
//     try {

//       // Use the async version if you need to handle promises directly
//       const txResponse = sendTransaction({to: (mpcWallet as any),
//       value: parseEther('0.01'),
// });
//       console.log('Transaction response:', txResponse);

//       // Optionally wait for the transaction to be mined
//     //   await txResponse.wait();

//       console.log('Transaction mined!');
//     } catch (error) {
//       console.error('Error handling transaction:', error);
//     }
//   };

const handleTopUp = () => {
    writeContract({
        abi: usdcAbi,
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC mainnet contract address
        functionName: 'transferFrom',
        args: [
          '0xYourSenderAddressHere', // Sender's address (who approved the spending)
          '0xRecipientAddressHere',  // Recipient's address
          BigInt(100 * 10 ** 6), // Amount to transfer in USDC (USDC has 6 decimals, so 100 USDC = 100 * 10^6)
        ],
      });
}
  useEffect(() => {
    if (address) {
      fetch('/api/register-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metamaskAddress: address }),
      })
        .then(res => res.json())
        .then(text => {
            try {
                const data = JSON.parse(text); // Parse the text to JSON
                console.log('Response data:', data);
      
                if (data.message && data.message === 'User already registered') {
                  console.log('User already registered:', data);
                  setMpcWallet(data.user.mpcWalletAddress.id)
                } else {
                  console.log('New user registered:', data);
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
        })
        .catch(err => console.error('Error registering wallet:', err));
      fetchMpcWalletBalance();
    }
  }, [address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    setMessages((prev: any) => [...prev, { text: inputValue, isUser: true }]);

    // Simulate AI response (replace with actual AI logic later)
    setTimeout(() => {
      setMessages((prev: any) => [...prev, { text: `AI response to: ${inputValue}`, isUser: false }]);
    }, 1000);

    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          DumbTransfersAI
        </h1>
        <div>
          {address ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Connected: {address}</span>
              <span className="text-sm">MPC address: {mpcWallet}</span>

              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>
      {/* Second Header */}
      {address && (
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <div className="text-lg font-medium">
            Balance: {balance !== null ? `${balance} USDC` : 'Loading...'}
          </div>
          <div>
            <button
            onClick={initiateRequest}
            //   onClick={() => handleTopUp()
            //     }
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
            >
              Top Up
            </button>
          </div>
        </div>
      )}
      <main className="flex-grow overflow-y-auto p-4 pb-20">
        <div className="space-y-4">
          {messages.map((message: any, index: any) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.isUser
                  ? 'ml-auto bg-blue-600 bg-opacity-50 backdrop-blur-sm'
                  : 'mr-auto bg-purple-600 bg-opacity-50 backdrop-blur-sm'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
          <FuturisticInput
            type="text"
            placeholder="Enter your transfer command..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <FuturisticButton type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Send size={18} />
          </FuturisticButton>
        </form>
      </footer>
    </div>
  );
};

export default DumbTransfersAIMainPage;
