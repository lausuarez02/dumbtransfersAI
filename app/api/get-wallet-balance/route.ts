// pages/api/get-wallet-balance.ts

const etherscanApiKey = process.env.ETHERSCAN_API_KEY; // Store this in your .env file

export async function GET(req: Request) {
  const { address } = await req.json();

  if (!address) {
    return new Response.json({ error: 'Wallet address is required' });
  }

  try {
    // Fetch balance from Etherscan
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`
    );
    const data = await response.json();

    if (data.status === '1') {
      // Convert balance from wei to Ether
      const balanceInEther = parseFloat(data.result) / 10 ** 18;
      return new Response.json({ balance: balanceInEther });
    } else {
        return new Response.json({ error: 'Failed to fetch balance' });
    }
  } catch (error) {
    return new Response.json({ error: 'Internal server error' });
  }
}
