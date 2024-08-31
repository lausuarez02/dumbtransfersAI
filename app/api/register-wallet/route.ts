// import type { NextApiRequest, NextApiResponse } from 'next';
// import { connectToDatabase } from '@/lib/mongodb'; // Your MongoDB connection utility
// import { createMPCWallet } from '@/lib/mpc'; // Function to create MPC wallet

// export async function POST(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return Response.json({ message: 'Method not allowed' });
//   }

//   const { metamaskAddress } = req.body;

//   try {
//     const { db } = await connectToDatabase();
//     const user = await db.collection('users').findOne({ metamaskAddress });

//     // Check if the user is already registered
//     if (user) {
//       return Response.json({ message: 'User already registered', user });
//     }

//     // If user is not registered, create a new MPC wallet
//     const mpcWallet = await createMPCWallet(metamaskAddress); // Assuming you have a function to create MPC Wallet

//     // Save the new user in the database
//     const newUser = {
//       metamaskAddress,
//       mpcWalletId: mpcWallet.id, // ID of the MPC wallet
//       mpcWalletAddress: mpcWallet.address, // Address of the MPC wallet
//     };

//     await db.collection('users').insertOne(newUser);

//     return Response.json({ message: 'User registered successfully', newUser });
//   } catch (error) {
//     console.error(error);
//     return Response.json({ message: 'Internal server error' });
//   }
// }


import { Coinbase } from "@coinbase/coinbase-sdk";
import { connectToDatabase } from "@/lib/mongodb";
import { getRandomItems } from "@/utils/random";

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY, WALLET_DATA } = process.env;

  // Check if the environment variables are set
  if (!NAME || !PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ message: "Environment variables are not set" }),
      { status: 500 }
    );
  }

  const body = await request.json();

  // Check if the MetaMask address is provided
//   if (!body?.address) {
//     return new Response(
//       JSON.stringify({ message: "Address is required" }),
//       { status: 400 }
//     );
//   }

  // Connect to the database
  const { db } = await connectToDatabase();

  // Check if the MetaMask address is already registered
  const existingUser = await db.collection("users").findOne({ metamaskAddress: body.metamaskAddress });

  if (existingUser) {
    return new Response(
      JSON.stringify({ message: "User already registered", user: existingUser }),
      { status: 200 }
    );
  }

  // Create a new Coinbase instance
  const coinbase = new Coinbase({
    apiKeyName: NAME as string,
    privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
  });

  // Get the default user
  const user = await coinbase.getDefaultUser();

  let userWallet;

  // Check if the wallet data is provided
  if (WALLET_DATA && WALLET_DATA?.length > 0) {
    try {
      // Parse the wallet data
      const seedFile = JSON.parse(WALLET_DATA || "{}");

      // Get the wallet ids
      const walletIds = Object.keys(seedFile);

      // Get a random wallet id
      const walletId = getRandomItems(walletIds, 1)[0];

      // Get the seed of the wallet
      const seed = seedFile[walletId]?.seed;

      // Import the wallet
      userWallet = await user?.importWallet({ seed, walletId });
      await userWallet.listAddresses();
    } catch (e) {
      return new Response(
        JSON.stringify({ message: "Failed to import wallet" }),
        { status: 500 }
      );
    }
  } else {
    // Otherwise, create a new wallet
    userWallet = await user?.createWallet();
    console.log(`check the userWallet=${userWallet}`)
    try {
      // Request funds from the faucet if available
      await userWallet?.faucet();
    } catch (e) {
      console.log("Faucet is not available");
    }
  }

  // Save the new user with MetaMask address and MPC wallet details in the database
  const newUser = {
    metamaskAddress: body.metamaskAddress,
    mpcWalletId: userWallet?.getId(),
    mpcWalletAddress: userWallet?.getDefaultAddress(),
  };

  await db.collection("users").insertOne(newUser);

  // Return the transaction hash and link as a response
  const transfer = await userWallet?.createTransfer({
    amount: 0.00000001,
    assetId: "eth",
    destination: body.address,
  });

  return new Response(
    JSON.stringify({
      transactionHash: transfer?.getTransactionHash()?.substring(0, 10),
      transactionLink: transfer?.getTransactionLink(),
      user: newUser,
    }),
    { status: 200 }
  );
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
