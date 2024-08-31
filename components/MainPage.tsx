import React, { useState } from 'react';
import  FuturisticInput from '@/components/FuturisticInput';
import  FuturisticButton  from '@/components/FuturisticButton';
import { Send } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from 'wagmi/connectors'
import { useCallback, useEffect, useMemo, useRef } from "react";

const DumbTransfersAIMainPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any>([]);
//   const account = useAccount();
  const [entries, setEntries] = useState<any>([]);
  const account = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

//   connect({ connector: injected() })
//   const { isFetched, error, data, refetch } = useQuery({
//     queryKey: ["transaction-request"],
//     queryFn: () =>
//       fetch("/api", {
//         method: "POST",
//         body: JSON.stringify({ address: account.address }),
//       }).then((res) => res.json()),
//     enabled: false,
//     retry: false,
//   });

useEffect(() => {
    if (account.address) {
        console.log(account.address, "check the account.address")
      fetch('/api/register-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metamaskAddress: account.address }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === 'User already registered') {
            console.log('User already registered:', data.user);
          } else {
            console.log('New user registered:', data.newUser);
          }
        })
        .catch(err => console.error('Error registering wallet:', err));
    }
  }, [account.address]);
  
  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    setMessages((prev:any) => [...prev, { text: inputValue, isUser: true }]);
    
    // Simulate AI response (replace with actual AI logic later)
    setTimeout(() => {
      setMessages((prev:any) => [...prev, { text: `AI response to: ${inputValue}`, isUser: false }]);
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
          {account.address ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Connected: {account.address}</span>
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
      
      <main className="flex-grow overflow-y-auto p-4 pb-20">
      <div className="space-y-4">
          {messages.map((message:any, index:any) => (
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
            onChange={(e:any) => setInputValue(e.target.value)}
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