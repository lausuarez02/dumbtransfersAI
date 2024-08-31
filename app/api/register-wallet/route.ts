import { Coinbase } from "@coinbase/coinbase-sdk";
// import { connectToDatabase } from "@/lib/mongodb";
import { getRandomItems } from "@/utils/random";
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY, WALLET_DATA } = process.env;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }

  // Check if the environment variables are set
  if (!NAME || !PRIVATE_KEY) {
    return Response.json(
      JSON.stringify({ message: "Environment variables are not set" }),
      { status: 500 }
    );
  }

  const body = await request.json();

const db = mongoose.connection.db;
  const usersCollection = db?.collection("users");
  const existingUser = await usersCollection?.findOne({ metamaskAddress: body.metamaskAddress });

//   if (existingUser) {
//     return Response.json(
//       JSON.stringify({ message: "User already registered", user: existingUser }),
//       { status: 200 }
//     );
//   }

//   // Create a new Coinbase instance
  const coinbase = new Coinbase({
    apiKeyName: NAME as string,
    privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
  });

//   // Get the default user
  const user = await coinbase.getDefaultUser();

  let userWallet;

//   // Check if the wallet data is provided
//     // Otherwise, create a new wallet
    // userWallet = await user?.createWallet();
//     console.log(`check the userWallet=${userWallet}`)
//     let check = userWallet.export();
//     console.log(check, "the userWallet info dude")
//     try {
//       // Request funds from the faucet if available
//       await userWallet?.faucet();
//     } catch (e) {
//       console.log("Faucet is not available");
//     }
  

//   // Save the new user with MetaMask address and MPC wallet details in the database
//   const newUser = {
//     metamaskAddress: body.metamaskAddress,
//     mpcWalletId: userWallet?.getId(),
//     mpcWalletAddress: userWallet?.getDefaultAddress(),
//     mpcSensitive: userWallet.export(),
//   };

if (existingUser) {
    // Check if the user already has a wallet associated with their account
    if (existingUser.mpcWalletId) {
      return Response.json(
        JSON.stringify({ message: "User already registered with a wallet", user: existingUser }),
        { status: 200 }
      );
    }
  }
  
  // Ensure the wallet creation and user registration process is atomic
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    userWallet = await user?.createWallet();
    console.log(`check the userWallet=${userWallet}`);
    
    // Export wallet data if needed
    let check = userWallet.export();
    console.log(check, "the userWallet info dude");
  
    try {
      // Request funds from the faucet if available
      await userWallet?.faucet();
    } catch (e) {
      console.log("Faucet is not available");
    }
  
    // Save the new user with MetaMask address and MPC wallet details in the database
    const newUser = {
      metamaskAddress: body.metamaskAddress,
      mpcWalletId: userWallet?.getId(),
      mpcWalletAddress: userWallet?.getDefaultAddress(),
      mpcSensitive: userWallet.export(),
    };
  
    await usersCollection?.insertOne(newUser);
  
    await session.commitTransaction();
  
    return Response.json(
      JSON.stringify({
        user: newUser,
      }),
      { status: 200 }
    );
  } catch (e:any) {
    await session.abortTransaction();
    console.error("Error during wallet creation or user registration:", e);
    return Response.json(
      JSON.stringify({ message: "Failed to create wallet or register user", error: e.message }),
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
  
//   await usersCollection?.insertOne(newUser);

  // Return the transaction hash and link as a response
//   const transfer = await userWallet?.createTransfer({
//     amount: 0.00000001,
//     assetId: "eth",
//     destination: body.address,
//   });

//   return Response.json(
//     JSON.stringify({
//       user: newUser,
//     }),
//     { status: 200 }
//   );
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
