import React, {useState} from 'react';
import { FaTimes } from 'react-icons/fa'; // X icon for closing the modal
import { FaDollarSign } from 'react-icons/fa'; // Replace with USDC icon if you have one
import Image from 'next/image';

const FullScreenTopUpModal = ({ isOpen, toggleModal }: any) => {

    const [amount, setAmount] = useState('');

    const handleTopUp = () => {
      // Implement top-up logic here
      console.log(`Topping up ${amount}`);
      toggleModal();
    };
    if (!isOpen) return null;

  return (
    <>
      {/* Full-screen modal */}
       {/* {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-md shadow-lg">
 <button
              onClick={toggleModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={24} />
            </button>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
              <Image
            alt="USDC"
            src="https://basescan.org/token/images/centre-usdc_28.png"
            width="20"
            height="20"
          />
                <span className="text-xl font-bold">USDC</span>
              </div>

              <input
                type="number"
                placeholder="Enter amount"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>
        </div> 
      )}  */}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Top Up Your Token</h2>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 rounded-lg mb-4">
            <p className="text-white text-center">Your Token Balance</p>
            {/* Add token balance display here */}
          </div>
          <input
            type="number"
            placeholder="Enter amount to top up"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />
          <button
            onClick={handleTopUp}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
          >
            Top Up
          </button>
        </div>
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            onClick={toggleModal}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default FullScreenTopUpModal;
