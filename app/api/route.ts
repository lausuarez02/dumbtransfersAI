// import { getRandomItems } from "@/utils/random";
// import { Coinbase } from "@coinbase/coinbase-sdk";

// export async function POST(request: Request) {
//   const { NAME, PRIVATE_KEY, WALLET_DATA } = process.env;

//   // Check if the environment variables are set
//   if (!NAME || !PRIVATE_KEY) {
//     return Response.json(
//       { message: "Environment variables are not set" },
//       { status: 500 }
//     );
//   }

//   const body = await request.json();

//   // Check if the address is provided
//   if (!body?.address) {
//     return Response.json({ message: "Address is required" }, { status: 400 });
//   }

//   // Create a new Coinbase instance
//   const coinbase = new Coinbase({
//     apiKeyName: NAME as string,
//     privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
//   });

//   // Get the default user
//   const user = await coinbase.getDefaultUser();
//   console.log(user, "check if the dude creates a new user 002")

//   let userWallet;

//   // Check if the wallet data is provided
//   if (WALLET_DATA && WALLET_DATA?.length > 0) {
//     try {
//       // Parse the wallet data
//       const seedFile = JSON.parse(WALLET_DATA || "{}");

//       // Get the wallet ids
//       const walletIds = Object.keys(seedFile);

//       // get the random wallet id
//       const walletId = getRandomItems(walletIds, 1)[0];

//       // Get the seed of the wallet
//       const seed = seedFile[walletId]?.seed;

//       console.log(`check the seed =${seed}` )
//       console.log(`check the walletId =${walletId}` )

//       // Import the wallet
//       userWallet = await user?.importWallet({ seed, walletId });
//       await userWallet.listAddresses();
//     } catch (e) {
//       return Response.json(
//         { message: "Failed to import wallet" },
//         { status: 500 }
//       );
//     }
//   } else {
//     // Otherwise, create a new wallet
//     userWallet = await user?.createWallet();
//     console.log(userWallet, "check if the dude creates a new wallet 001")
//     console.log(`check the userWallet=${userWallet}`)
//     try {
//       // Request funds from the faucet if it's available
//       await userWallet?.faucet();
//     } catch (e) {
//       // Log if the faucet is not available.
//       console.log("Faucet is not available");
//     }
//   }

//   // Create a transfer to the destination address
//   const transfer = await userWallet?.createTransfer({
//     amount: 0.00000001,
//     assetId: "eth",
//     destination: body.address,
//   });

//   // Return the transaction hash and link
//   return Response.json(
//     {
//       transactionHash: transfer?.getTransactionHash()?.substring(0, 10),
//       transactionLink: transfer?.getTransactionLink(),
//     },
//     { status: 200 }
//   );
// }

// export const dynamic = "force-dynamic";
// export const maxDuration = 30;

import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const { NAME, PRIVATE_KEY } = process.env;

  // Check if the environment variables are set
  if (!NAME || !PRIVATE_KEY) {
    return Response.json(
      { message: "Environment variables are not set" },
      { status: 500 }
    );
  }

  const body = await request.json();

  console.log(body, "checkout the body dyde")
  // Check if the address is provided
  if (!body?.address) {
    return Response.json({ message: "Address is required" }, { status: 400 });
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
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  // Create a new Coinbase instance
  const coinbase = new Coinbase({
    apiKeyName: NAME as string,
    privateKey: PRIVATE_KEY.replaceAll("\\n", "\n") as string,
  });

  // Get the default user
  const user = await coinbase.getDefaultUser();
  console.log(`Checkout the user=${user} 0002`)

  // Retrieve the existing wallet using the wallet ID stored in the database
  let userWallet;
  let userWalletId;
  try {

    let seed = existingUser.mpcSensitive.seed
    let walletId = existingUser.mpcWalletId
    userWallet = await user?.importWallet({ seed, walletId });
    await userWallet.listAddresses();
    console.log(`checkout the userswalletss ${userWallet}`)
    // console.log("check if going inside the if user", {user} )
    // // let wallet1 = await Wallet.import(fetchedData);
    // // userWallet = await user?.getWallet(existingUser.mpcWalletId);
    // userWallet = await user?.getWallet(existingUser.mpcWalletId);
    // userWalletId = userWallet.getId()

    // await userWallet.loadSeed(existingUser.mpcSensitive.seed);

    console.log(`check the wallet3 ${userWallet}`)
    console.log(`check the userWalletId ${userWalletId}`)


    // let fetchedData = await fetch((userWallet as any).getId());

    // let wallet1 = await Wallet.import(fetchedData);



    // console.log(`Checkout the fetchedData=${fetchedData} 0001`)
    console.log(`Checkout the userWallet=${userWallet} 0001`)

    // if (!userWallet) {
    //   throw new Error("Wallet not found");
    // }
    // const isPrivateKeyLoaded = userWallet?.isPrivateKeyLoaded?.();
    // if (!isPrivateKeyLoaded && userWallet?.loadPrivateKey) {
    //   await userWallet.loadPrivateKey(PRIVATE_KEY.replaceAll("\\n", "\n"));
    //   console.log("Private key loaded successfully.");
    // } else if (!isPrivateKeyLoaded) {
    //   throw new Error("Private key is not loaded, and cannot be loaded manually.");
    // }
  } catch (e) {
    return Response.json({ message: "Failed to retrieve wallet" }, { status: 500 });
  }

  try {
    console.log(`Creating transfer to address: ${body.address}`);
    
    await userWallet?.faucet();

    const transfer = await (userWallet as any)?.createTransfer({
      amount: body.amount,
      assetId: "usdc",
      destination: body.address,
    });

    console.log(`Transfer successful: ${transfer}`);
    
    // Return the transaction hash and link
    return Response.json(
      {
        transactionHash: transfer?.getTransactionHash()?.substring(0, 10),
        transactionLink: transfer?.getTransactionLink(),
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error creating transfer:", e);
    return Response.json({ message: "Failed to create transfer", error: e.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;
