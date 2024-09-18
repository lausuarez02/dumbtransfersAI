import {Coinbase, Wallet , TimeoutError} from "@coinbase/coinbase-sdk";
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

  console.log(body, "just check the body man")
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
  // try {
    let seed = existingUser.mpcSensitive.seed
    let walletId = existingUser.mpcWalletId
    userWallet = await Wallet.import({ seed, walletId });
    // await userWallet.listAddresses();
    console.log(`checkout the userswalletss ${userWallet}`)
    console.log(`Checkout the userWallet=${userWallet} 0001`)

  // } catch (e) {
  //   return (Response as any).json({ message: "Failed to retrieve wallet" }, { status: 500 });
  // }

  // try {    
    // await userWallet?.faucet();

    // Eth
    // Wei
    // Gwei
    // Usdc
    // Weth
  
    const CoinbaseTypes = {
      assets: {
        eth: 'eth',
        Wei: 'wei',
        Gwei: 'gwei',
        usdc: 'usdc',
        Weth: 'weth',
        eurc: 'eurc',
      },
    };
    
    // Define a mapping function to resolve the asset based on the token name (case-insensitive)
    const getAssetFromToken = (token: string) => {
      const assetMapping: { [key: string]: keyof typeof CoinbaseTypes.assets } = {
        ETH: 'eth',
        WEI: 'Wei',
        GWEI: 'Gwei',
        USDC: 'usdc',
        WETH: 'Weth',
        EURC: 'eurc',
      };
    
      return CoinbaseTypes.assets[assetMapping[token.toUpperCase()]];
    };

    const fromAssetId = getAssetFromToken(body.fromToken);
    const toAssetId = getAssetFromToken(body.toToken);

    console.log(fromAssetId, "check the fromassetId")
    console.log(toAssetId, "check the toAssetId")

    let trade;
    try{
      trade = await (userWallet as any)?.createTrade({
        amount: body.amount,
        fromAssetId: fromAssetId,
        toAssetId:toAssetId,
        // gasless: true
      });
  
    }catch(e){
      console.log(e,"chek the error")
    }

    // console.log(`Transfer successful: ${trade}`);
    
    // // Return the transaction hash and link
    // trade.wait({ timeoutSeconds: 10000 }).then((t:any) => {
    //   console.log(t, "check the t dude")
    //   // Do something with your wallet here.
    // });
    try {
      await trade.wait({ timeoutSeconds: 10000 });
    } catch (err) {
      if (err instanceof TimeoutError) {
        console.log("Waiting for transfer timed out");
      }
    }

    console.log(`Transfer successful: ${trade}`);

    return (Response as any).json(
      {
        status: trade?.getStatus(),
        to_amount: trade?.getToAmount()
      },
      { status: 200 }
    );
  // } catch (e:any) {
  //   console.error("Error creating transfer:", e);
  //   return (Response as any).json({ message: "Failed to create transfer", error: e.message }, { status: 500 });
  // }
}

// export const dynamic = "force-dynamic";
export const maxDuration = 300;
