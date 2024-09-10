import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY } = process.env;

  // Check if the environment variables are set
  if (!NAME || !PRIVATE_KEY) {
    return (Response as any).json(
      { message: "Environment variables are not set" },
      { status: 500 }
    );
  }

  const body = await request.json();

  console.log(body, "checkout the body dyde")
  // Check if the address is provided
  if (!body?.address) {
    return (Response as any).json({ message: "Address is required" }, { status: 400 });
  }

  // Connect to MongoDB
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI as string);
  }
  const db = mongoose.connection.db;
  const usersCollection = db?.collection("users");

  // Check if the user exists in the database
  const existingUser = await usersCollection?.findOne({ metamaskAddress: body.address });
  
  console.log(existingUser, "check the existing user dude")
  if (!existingUser) {
    return (Response as any).json({ message: "User not found" }, { status: 404 });
  }

  // Create a new Coinbase instance
  const coinbase = new Coinbase({
    apiKeyName: NAME as string,
    privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
  });

  // Retrieve the existing wallet using the wallet ID stored in the database
  let userWallet;
  let userWalletId;
  try {
    let seed = existingUser.mpcSensitive.seed
    let walletId = existingUser.mpcWalletId
    userWallet = await Wallet.import({ seed, walletId });
    await userWallet.listAddresses();
    console.log(`checkout the userswalletss ${userWallet}`)
    console.log(`Checkout the userWallet=${userWallet} 0001`)

  } catch (e) {
    return (Response as any).json({ message: "Failed to retrieve wallet" }, { status: 500 });
  }

  try {
    console.log(`Creating transfer to address: ${body.address}`);
    
    await userWallet?.faucet();

    const transfer = await (userWallet as any)?.createTransfer({
      amount: body.amount,
      assetId: "usdc",
      destination: body.addressTo,
    });

    console.log(`Transfer successful: ${transfer}`);
    
    // Return the transaction hash and link
    return (Response as any).json(
      {
        transactionHash: transfer?.getTransactionHash()?.substring(0, 10),
        transactionLink: transfer?.getTransactionLink(),
      },
      { status: 200 }
    );
  } catch (e:any) {
    console.error("Error creating transfer:", e);
    return (Response as any).json({ message: "Failed to create transfer", error: e.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
