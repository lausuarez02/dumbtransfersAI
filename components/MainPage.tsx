"use client"

import React, { useState, useEffect, useCallback } from 'react';
import FuturisticInput from '@/components/FuturisticInput';
import FuturisticButton from '@/components/FuturisticButton';
import { Send } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useSendTransaction,useWalletClient, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { writeContract, simulateContract } from '@wagmi/core'
import { parseEther } from 'viem'
import { Coinbase } from "@coinbase/coinbase-sdk";
import { abiUsdc } from '@/abi/usdc';
import { LoadingIcon } from "./LoadingIcon";
import { useQuery } from "@tanstack/react-query";
import { TransactionSuccessMessage } from "./TransactionSuccessMessage";
import { TransactionFailedMessage } from "./TransactionFailedMessage";
import { transactionAssistant } from '@/app/utils/ai';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { config } from '@/app/config';
import FullScreenTopUpModal from './FullScreenTopUpModal';
import Image from 'next/image';

const DumbTransfersAIMainPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<any>([]);
  const [isOpenModal , setIsOpenModal] = useState(false)
  const { address } = useAccount(); // Directly destructuring address from useAccount
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
//   const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>({amount:0, address: ''})
  const [transactionDataSuccess, setTransactionDataSuccess] = useState<any>()

  const [mpcWallet, setMpcWallet] = useState('')
  // const { data: hash, writeContract} = useWriteContract()
  const account = useAccount();

  const fetchMpcWalletBalance = async () => {
    try {
      const response = await fetch('/api/get-wallet-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ address }),
        body: JSON.stringify({ address: mpcWallet})
      });
      const data = await response.json();
      setBalance(data.balance);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleAiAssistant = async (value:string) => {
    const responseStream = await transactionAssistant(value);
    return responseStream
  }


  const fetchTransactionData = async (address:any,addressTo:string, amount:any) => {
    if (!address || !amount) throw new Error("Address and amount must be provided");
    setIsLoading(true)
    const response = await fetch("/api", {
      method: "POST",
      body: JSON.stringify({ address, amount, addressTo }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    setIsLoading(false)
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    let responseData = response.json()
    return responseData;
  };
  

const { data: walletClient } = useWalletClient();
const { sendTransaction } = useSendTransaction()

async function switchNetwork(chainId:string) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    console.error('Failed to switch network', error);
  }
}
  const handleTopUp = async () => {
    const usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

    const usdcContractAddressSeploia = "0x5dEaC602762362FE5f135FA5904351916053cF70"
    try {

      // Use the async version if you need to handle promises directly
//       const txResponse = sendTransaction({to: (mpcWallet as any),
//       value: parseEther('0.01'),
// });
//       console.log('Transaction response:', txResponse);
// const { request } = await simulateContract({
//   abi: abiUsdc,
//   address: usdcContractAddress,
//   functionName: 'transferFrom',
//   args: [
//     '0x52eF0e850337ecEC348C41919862dBAac42F620B', // from
//     '0x52eF0e850337ecEC348C41919862dBAac42F620B', // to
//     123n, // amount
//   ],
// });

// console.log("Request:", request);

const hash = await writeContract(config,{
  abi: abiUsdc,
  address: usdcContractAddressSeploia,
  functionName: 'transferFrom',
  args: [
    '0x52eF0e850337ecEC348C41919862dBAac42F620B', // from
    '0x76C68154AB7CbbB8ae008c6D7dBc8d21e74E78b9', // to
    BigInt(123), // amount
  ],
  // account: '0xd2135CfB216b74109775236E36d4b433F1DF507B', 
  // request,
});
    console.log(`check the hash ${hash} `)
      console.log('Transaction mined!');
    } catch (error) {
      console.error('Error handling transaction:', error);
    }
  };

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
                  setMpcWallet(data.user.mpcWalletAddress.id)
                }
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
        })
        .catch(err => console.error('Error registering wallet:', err));
    }
  }, [address]);

  useEffect(() => {
    if(mpcWallet !== ''){
      fetchMpcWalletBalance();
    }
  }, [mpcWallet])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // setMessages((prev: any) => [...prev, { text: inputValue, isUser: true }]);
    setMessages((prev: any) => [...prev, { text: inputValue, isUser: true }]);

    try {
        // Await the AI assistant's response
        const aiResponse = await handleAiAssistant(inputValue);
        console.log(aiResponse, "check the aiResponse dude")
        // Ensure data is available before setting messages
        if (aiResponse && aiResponse.answer) {
            if(aiResponse.transaction === true){
                setTransactionData({amount:aiResponse.amount,addressTo:aiResponse.to, address: address})
                const dataSuccess = await fetchTransactionData(address, aiResponse.to, aiResponse.amount);
                console.log(dataSuccess, "check the dataSuccess bro")
                // setTransactionDataSuccess(dataSuccess)
                setMessages((prev: any) => [...prev, { text: `Transaction successful!`, isUser: false, transactionLink: dataSuccess.transactionLink }]);

                // setMessages((prev: any) => [...prev, { text: aiResponse.answer, isUser: false, transactionLink: data.transactionLink }])
            }else{
                setMessages((prev: any) => [...prev, { text: aiResponse.answer, isUser: false }]);
            }
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
    }

    setInputValue('');
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  const copyToClipboard = (text:string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  const truncateAddress = (addr:string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };


  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen)
    setIsOpenModal(!isOpenModal)
  };



  const handleModal = () => {
    setIsOpenModal(true)
    setIsOpen(true)
    // return(
    //   <FullScreenTopUpModal isOpen={isOpen} toggleModal={toggleModal}/>
    // )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          DumbTransfersAI
        </h1>
        <div className='bg-gradient-to-br from-gray-900 to-gray-800 text-white'>
      {address ? (
        <div className="relative flex items-center gap-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <button
            onClick={toggleDropdown}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Wallet Info
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Connected: {truncateAddress(address)}
                </span>
                <ClipboardIcon
                  className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(address)}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">
                  MPC address: {truncateAddress(mpcWallet)}
                </span>
                <ClipboardIcon
                  className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(mpcWallet)}
                />
              </div>
            </div>
          )}

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
              <div className="flex items-center space-x-2">
      <span className="font-medium">Balance:</span>
      {balance !== null ? (
        <div className="flex items-center space-x-1">
           <Image
            alt="USDC"
            src="https://basescan.org/token/images/centre-usdc_28.png"
            width="20"
            height="20"
          />
          <span>{`${balance}`}</span>
        </div>
      ) : (
        'Loading...'
      )}
    </div>
          {/* <div className="text-lg font-medium">
            Balance: {balance !== null ? (<>{`${balance}` }<Image alt="" src="https://basescan.org/token/images/centre-usdc_28.png" width="20" height="20"/> </>): 'Loading...'}
           
          </div> */}
          <div>
            <button
            onClick={handleModal}
            // onClick={() => handleTopUp()}
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
        className={`p-3 rounded-lg max-w-[80%] break-words ${
          message.isUser
            ? 'ml-auto bg-blue-600 bg-opacity-50 backdrop-blur-sm'
            : 'mr-auto bg-purple-600 bg-opacity-50 backdrop-blur-sm'
        }`}
      >
        {message.text}
        {message.transactionLink ? (
          <div className="break-words">
            Transaction Link: {message.transactionLink}
          </div>
        ) : null}
      </div>
    ))}
    {isLoading && <LoadingIcon />}
  </div>
  {isOpenModal && <FullScreenTopUpModal isOpen={isOpen} toggleModal={toggleModal}/>}
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
