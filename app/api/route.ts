import { Coinbase, Wallet, TimeoutError } from "@coinbase/coinbase-sdk";
import mongoose from 'mongoose';

const waitForTransferStatus = async (transfer: any, timeout: number, interval: number) => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = transfer.getSponsoredSend()?.getStatus();

        console.log(`Current transfer status: ${status}`);

        if (['complete', 'submitted', 'signed', 'pending'].includes(status)) {
          return resolve(status); // Stop polling if we reach the desired status
        }

        if (Date.now() - start >= timeout) {
          return reject(new Error("Timeout reached while waiting for transfer to complete"));
        }

        setTimeout(checkStatus, interval); // Poll at the specified interval
      } catch (err) {
        return reject(err);
      }
    };

    checkStatus();
  });
};

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

  // Get the default user
  // const user = await coinbase.getDefaultUser();

  // Retrieve the existing wallet using the wallet ID stored in the database
  let userWallet;
  let userWalletId;
  // try {
    let seed = existingUser.mpcSensitive.seed
    let walletId = existingUser.mpcWalletId
    userWallet = await Wallet.import({ seed, walletId });
    await userWallet.listAddresses();
    console.log(`checkout the userswalletss ${userWallet}`)
    console.log(`Checkout the userWallet=${userWallet} 0001`)

  // } catch (e) {
  //   return (Response as any).json({ message: "Failed to retrieve wallet" }, { status: 500 });
  // }

  let transfer;
  try {
    console.log(`Creating transfer to address: ${body.address}`);

    transfer = await userWallet?.createTransfer({
      amount: body.amount,
      assetId: Coinbase.assets.Usdc,
      destination: body.addressTo,
      gasless: true
    });
    // await transfer.wait()
    
    // Return the transaction hash and link
  } catch (e:any) {
    console.error("Error creating transfer:", e);
    return (Response as any).json({ message: "Failed to create transfer", error: e.message }, { status: 500 });
  }
  try {
    await transfer.wait({ timeoutSeconds: 10000 });
  } catch (err) {
    if (err instanceof TimeoutError) {
      console.log("Waiting for transfer timed out");
    }
  }

  await waitForTransferStatus(transfer, 10000, 1000); // 10 seconds timeout, 1-second intervals

  console.log(transfer, 'checkout the transfer final dude')
  // if (transfer.getStatus() === ('complete' || 'pending' || 'submitted' || 'signed' || 'broadcast') ) {
    if (['complete', 'submitted'].includes(transfer.getSponsoredSend()?.getStatus() as any) ) {
    return (Response as any).json(
      {
        transactionHash: transfer?.getSponsoredSend()?.getTransactionHash()?.substring(0, 10),
        transactionLink: transfer?.getSponsoredSend()?.getTransactionLink(),
      },
      { status: 200 }
    );
  } else {
    return (Response as any).json(
      {
        error: "error"
      },
      { status: 500 }
    );  }
}

// export const dynamic = "force-dynamic";
export const maxDuration = 300;
