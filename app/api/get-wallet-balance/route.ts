// pages/api/get-wallet-balance.ts
const etherscanApiKey = process.env.BASESCAN_API_KEY; // Store this in your .env file
const usdcContractAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const usdcContractAddressSeploia = "0x5dEaC602762362FE5f135FA5904351916053cF70"

// export async function POST(req: Request) {
//   const {address}  = await req.json();

//   if (!address) {
//     return Response.json({ error: 'Wallet address is required' });
//   }

//   try {
//     // Fetch balance from Etherscan
//     const response = await fetch(
//       `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`
//     );
//     const data = await response.json();

//     if (data.status === '1') {
//       // Convert balance from wei to Ether
//       const balanceInEther = parseFloat(data.result) / 10 ** 18;
//       return Response.json({ balance: balanceInEther });
//     } else {
//         return Response.json({ error: 'Failed to fetch balance' });
//     }
//   } catch (error) {
//     return Response.json({ error: 'Internal server error' });
//   }
// }


export async function POST(req: Request) {
    const { address } = await req.json();
  
    if (!address) {
      return new Response(JSON.stringify({ error: 'Wallet address is required' }), { status: 400 });
    }
  
    try {
      // Fetch USDC balance from Etherscan (or Blockscan for Base)
      // const response = await fetch(
      //   `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${usdcContractAddress}&address=${address}&tag=latest&apikey=${etherscanApiKey}`
      // );
      const response = await fetch(
        `https://api-sepolia.basescan.org/api?module=account&action=tokenbalance&contractaddress=${usdcContractAddressSeploia}&address=${address}&tag=latest&apikey=${etherscanApiKey}`
      );
      const data = await response.json();
  
      console.log("API response:", data); // Debugging log
  
      if (data.status === '1') {
        // Convert balance from smallest unit to USDC (usually 6 decimal places)
        const balanceInUSDC = parseFloat(data.result) / 10 ** 6;
        return new Response(JSON.stringify({ balance: balanceInUSDC }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'Failed to fetch balance', message: data.message }), { status: 400 });
      }
    } catch (error) {
      console.error('Error fetching balance:', error); // Debugging log
      return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
  }
