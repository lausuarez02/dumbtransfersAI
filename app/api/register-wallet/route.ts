import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY, WALLET_DATA } = process.env;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }

  // Check if the environment variables are set
  if (!NAME || !PRIVATE_KEY) {
    return (Response as any).json(
      JSON.stringify({ message: "Environment variables are not set" }),
      { status: 500 }
    );
  }

  const body = await request.json();

const db = mongoose.connection.db;
  const usersCollection = db?.collection("users");
  const existingUser = await usersCollection?.findOne({ metamaskAddress: body.metamaskAddress });

  const coinbase = new Coinbase({
    apiKeyName: NAME as string,
    privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
  });

//   // Get the default user

  let userWallet;

if (existingUser) {
    if (existingUser.mpcWalletId) {
      return (Response as any).json(
        JSON.stringify({ message: "User already registered with a wallet", user: existingUser }),
        { status: 200 }
      );
    }
  }
  
  // Ensure the wallet creation and user registration process is atomic
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    userWallet = await Wallet.create({networkId: Coinbase.networks.BaseMainnet});
    console.log(`check the userWallet=${userWallet}`);
    
    // Export wallet data if needed
    let check = userWallet.export();
    
    // Save the new user with MetaMask address and MPC wallet details in the database
    const newUser = {
      metamaskAddress: body.metamaskAddress,
      mpcWalletId: userWallet?.getId(),
      mpcWalletAddress: userWallet?.getDefaultAddress(),
      mpcSensitive: userWallet.export(),
    };
  
    await usersCollection?.insertOne(newUser);
  
    await session.commitTransaction();
  
    return (Response as any).json(
      JSON.stringify({
        user: newUser,
      }),
      { status: 200 }
    );
  } catch (e:any) {
    await session.abortTransaction();
    console.error("Error during wallet creation or user registration:", e);
    return (Response as any).json(
      JSON.stringify({ message: "Failed to create wallet or register user", error: e.message }),
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
