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
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { config } from '@/app/config';
import FullScreenTopUpModal from './FullScreenTopUpModal';
import Image from 'next/image';
import { FaTimes, FaBars, FaPaperclip, FaSmile } from 'react-icons/fa';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });
const DumbTransfersAIMainPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<any>([]);
  const { address } = useAccount(); // Directly destructuring address from useAccount
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
//   const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amountUsdc, setAmountUsdc] = useState(0)
  const [contactName, setContactName] = useState('')
  const [isButtonDisabled ,setIsButtonDisabled] = useState(false)
  const [mpcWallet, setMpcWallet] = useState('')
  const [contacts, setContacts] = useState<any>('')
  console.log(contacts, "check the contacts")
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

  const fetchUserContacts = async (address: any) => {
    try {
      const response = await fetch(`/api/get-contacts?address=${encodeURIComponent(address)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
  
      const data = await response.json();
      console.log(data, 'check if I got data dude');
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // const handleAiAssistant = async (value:string) => {
  //   const responseStream = await transactionAssistant(value);
  //   return responseStream
  // }

  const handleAiAssistant = async (value: string) => {
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: value, mpcWallet, address }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get a response from the AI assistant.');
      }
  
      const responseStream = await response.json();
      return responseStream;
    } catch (error) {
      console.error('Error handling AI assistant:', error);
      return null;
    }
  };
  

  // const fetchTransactionData = async (address:any,addressTo:string, amount:any) => {
  //   if (!address || !amount) throw new Error("Address and amount must be provided");
  //   setIsLoading(true)
  //   const response = await fetch("/api", {
  //     method: "POST",
  //     body: JSON.stringify({ address, amount, addressTo }),
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   });
  
  //   setIsLoading(false)
  //   if (!response.ok) {
  //     throw new Error("Network response was not ok");
  //   }
    
  //   let responseData = response.json()
  //   return responseData;
  // };
  

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
  const handleTopUp = async (amount:number) => {
    const usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"

    const usdcContractAddressSeploia = "0x5dEaC602762362FE5f135FA5904351916053cF70"
    try {

      await writeContract(config,{
        abi: abiUsdc,
        address: usdcContractAddress,
        functionName: 'approve',
        args: [
          address as any, // The address that will spend the tokens (e.g., your contract or wallet)
          BigInt(Math.floor(amount * 10 ** 6)), // The amount of tokens to approve
        ],
      });

const hash = await writeContract(config,{
  abi: abiUsdc,
  address: usdcContractAddress,
  functionName: 'transferFrom',
  args: [
    address as any, // from
    mpcWallet as any, // to
    // BigInt(amount), // amount
    BigInt(Math.floor(amount * 10 ** 6))
  ],
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
      fetchUserContacts(mpcWallet)
    }
  }, [mpcWallet])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    // setMessages((prev: any) => [...prev, { text: inputValue, isUser: true }]);
    setMessages((prev: any) => [...prev, { text: inputValue, isUser: true }]);

    try {
        // Await the AI assistant's response
        setIsLoading(true)
        const aiResponse = await handleAiAssistant(inputValue);
          if (aiResponse) {
              setMessages((prev: any) => [...prev, { text: aiResponse, isUser: false , hasButton: aiResponse.hasButton || false, buttonText: aiResponse.buttonText || "",}]);
            }
            setIsLoading(false)

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
  };



  const handleModal = () => {
    setIsOpen(true)
  }

  const handleChange = (e: any) => {
    const { value } = e.target;
    setAmountUsdc(value);
  };

  const handleUserResponse = async (response:string) => {
    let aiResponse:string;
    if (!isButtonDisabled) {
      setIsButtonDisabled(true); // Disable the button to prevent double-click
      // Your click handling logic here
  
      // Optionally, re-enable the button after some async action (e.g., after submitting data)
      setTimeout(() => setIsButtonDisabled(false), 3000); // Example timeout for re-enabling
    }
    setIsLoading(true)
    if (response === 'yes') {
      // Logic for saving the contact
      aiResponse = await handleAiAssistant('yes')
      console.log("User wants to save the contact.");
    } else if (response === 'no') {
      aiResponse = await handleAiAssistant('no')
    }
    else{
      aiResponse = await handleAiAssistant(response)
    }
    setIsLoading(false)
    setMessages((prev: any) => [...prev, { text: aiResponse, isUser: false}]);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white text-black">
      <aside
        className={`bg-gray-100 border-r border-gray-300 p-4 transform transition-transform duration-300 ease-in-out 
          w-64 fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          md:w-1/4`}
      >
        <div className="flex justify-between items-center mb-4">
        <button
        className="md:hidden fixed top-4 left-4 z-30 bg-[#004aad] hover:bg-[#004aad] text-white p-3 rounded-lg focus:outline-none"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
        </div>
        <h2 className="text-lg font-bold">Contacts</h2>
        <ul className="space-y-4">
          {contacts !== '' && contacts.map((contact:any) => {
            return(
              <li className="p-3 rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300">{contact.name}</li>
            )
          })}
        </ul>
        {/* Hide Sidebar Button for Desktop */}
        {/* <button
          onClick={toggleSidebar}
          className="hidden md:block bg-red-500 text-white p-2 rounded-lg mt-4"
        >
          Hide Sidebar
        </button> */}
      </aside>


      {/* Main Chat Area */}
      <div className={`flex-grow flex flex-col ${isSidebarOpen && 'md:ml-0'} transition-all`}>
  <header className="sticky top-0 z-50 p-4 bg-white border-b border-gray-300 flex justify-between items-center">
    <button
      className="md:hidden top-4 left-4 z-30 bg-white text-white p-3 rounded-lg focus:outline-none"
      onClick={toggleSidebar}
    >
      {isSidebarOpen ? <FaTimes size={24} /> : <FaBars color='blue' size={24} />}
    </button>
    <h1 className={`text-2xl font-bold bg-clip-text text-transparent bg-[#004aad] ${spaceGrotesk.className}`}>
      DumbTransfers
    </h1>
    <div className="bg-white text-black">
      {address ? (
        <div className="relative flex items-center gap-2">
          <button
            onClick={toggleDropdown}
            className="bg-[#004aad] px-4 py-2 rounded-lg text-white"
          >
            Wallet
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 right-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Connected: {truncateAddress(address)}</span>
                <ClipboardIcon
                  className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(address)}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">MPC address: {truncateAddress(mpcWallet)}</span>
                <ClipboardIcon
                  className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => copyToClipboard(mpcWallet)}
                />
              </div>
              <button
                onClick={() => disconnect()}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white w-full mt-4"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => connect({ connector: injected(), chainId: 8453 })}
          className="bg-[#004aad] px-4 py-2 rounded-lg text-white"
        >
          Connect Wallet
        </button>
      )}
    </div>
  </header>

        {/* Second Header */}
        {address && (
          <div className="p-4 bg-white border-b border-gray-300 flex justify-between items-center">
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
            <button
              onClick={handleModal}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
            >
              Top Up
            </button>
          </div>
        )}
<main className="flex-grow overflow-y-auto p-4 pb-20">
  <div className="space-y-4">
    {messages.map((message: any, index: any) => (
      <div
        key={index}
        className={`flex items-start max-w-[80%] ${
          message.isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
        }`}
      >
        {/* Image */}
        <div className="flex-shrink-0">
          <Image
            width={50}
            height={50}
            src={message.isUser ? '/person.png' : '/chat-bot.webp'}
            alt={message.isUser ? 'User' : 'AI'}
            className="rounded-full"
          />
        </div>

        {/* Message Bubble */}
        <div
          className={`relative p-3 max-w-[70%] break-words ${
            message.isUser
              ? 'mr-2 bg-gray-200 bg-opacity-50 backdrop-blur-sm rounded-tl-lg rounded-br-lg rounded-bl-lg'
              : 'ml-2 bg-[#004aad] bg-opacity-50 backdrop-blur-sm rounded-tr-lg rounded-bl-lg rounded-br-lg'
          }`}
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} // Ensure text breaks properly
        >
          <div dangerouslySetInnerHTML={{ __html: message.text.text ? message.text.text : message.text }}></div>

          {message.text.hasInput && (
            <input 
              type="text"
              placeholder={message.text.translatedName || 'Name'}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-2 px-3 py-2 border border-gray-300 rounded w-full"
            />
          )}

          {message.text.hasButtonName && (
            <button 
              disabled={isButtonDisabled}
              onClick={() => handleUserResponse(contactName)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              {message.text.translatedSend || 'Send'}
            </button>
          )}

          {message.text.hasButton && (
            <div className="flex space-x-2 mt-2">
              <button 
                disabled={isButtonDisabled}
                onClick={() => handleUserResponse('yes')}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {message.text.buttonTextYes || 'Yes'}
              </button>

              <button 
                disabled={isButtonDisabled}
                onClick={() => handleUserResponse('no')}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {message.text.buttonTextNo || 'No'}
              </button>
            </div>
          )}
        </div>
      </div>
    ))}

    {isLoading && <LoadingIcon />}
  </div>
  {isOpen && <FullScreenTopUpModal onClick={handleTopUp} amount={amountUsdc} handleChange={handleChange} isOpen={isOpen} toggleModal={toggleModal} />}
</main>
        <footer className="p-4 border-t border-gray-300 bg-white sticky bottom-0">
  <form onSubmit={handleSubmit} className="flex gap-2 items-center">
    <button className="p-2 text-gray-500 hover:text-gray-700">
      <FaPaperclip size={18} />
    </button>
    <button className="p-2 text-gray-500 hover:text-gray-700">
      <FaSmile size={18} />
    </button>
    <input
      type="text"
      placeholder="Transfer..."
      value={inputValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setInputValue(e.target.value)
      }
      className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
    <button
      type="submit"
      className="bg-[#004aad] px-4 py-2 rounded-lg text-white"
    >
      <Send size={18} />
    </button>
  </form>
</footer>

      </div>
    </div>
  );
};

export default DumbTransfersAIMainPage;
