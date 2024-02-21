import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import { getAlgodClient } from "../src/clients/index.js";
import algosdk from "algosdk";
import * as algotxns from "../src/algorand/index.js";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algodClient = getAlgodClient(network);

// get creator account
const deployer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_DEPLOYER_MNEMONIC);
const buyer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_BUYER_MNEMONIC);
const reserve_addr = process.env.NEXT_PUBLIC_RESERVE_ADDR;
// const assetIndex = parseInt(process.env.NEXT_PUBLIC_FT_ASSET_ID);
let ft_asset;


// PART 1: CREATE MY TOKEN 
const createToken = async () => {

  const suggestedParams = await algodClient.getTransactionParams().do();
  
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: deployer.addr,
    suggestedParams,
    defaultFrozen: false,
    unitName: 'ALC',
    assetName: 'Autumn Leaf Coin',
    manager: deployer.addr,
    reserve: reserve_addr,
    freeze: deployer.addr,
    clawback: deployer.addr,
    assetURL: 'https://al.co.za/',
    total: 1000000,
    decimals: 2,
  });
  
  // Must be signed by the account sending the asset 
  const rawSignedTxn = txn.signTxn(deployer.sk);
  console.log('Sending transaction to the network...create asset');
  const xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, xtx.txId, 4);
  //Get the completed Transaction
  console.log("Transaction " + xtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
  // PRINT ASSET ID
  const assetId = confirmedTxn['asset-index'];
  // console.log(`Asset ID created: ${assetId}`);
  return assetId;
  }

// OPT IN TO RECEIVE TOKENS
const optIn = async () => {

  const xtxn = await algotxns.getAssetOptInTxn(algodClient,buyer.addr,ft_asset)
  // Must be signed by the account sending the asset  
  const rawSignedTxn = xtxn.signTxn(buyer.sk);
  console.log('Sending transaction to the network...opt in');
  const xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, xtx.txId, 4);
  //Get the completed Transaction
  console.log("Transaction " + xtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

}

// PART 1: SEND 100 TOKENS
const transferToken = async () => {

  const xtxn = await algotxns.getPaymentTxn(algodClient, deployer.addr,buyer.addr ,ft_asset, 100)
  // Must be signed by the account sending the asset  
  const rawSignedTxn = xtxn.signTxn(deployer.sk);
  console.log('Sending transaction to the network...sending 100 algos');
  const xtx = await algodClient.sendRawTransaction(rawSignedTxn).do();
  // Wait for confirmation
  const confirmedTxn = await algosdk.waitForConfirmation(algodClient, xtx.txId, 4);
  //Get the completed Transaction
  console.log("Transaction " + xtx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

// MAIN async function
(async () => {
  // write your code here
// Run to reate a Token
ft_asset = await createToken(); 

// Run to optIn
await optIn() 

// Run to transfer tokens
await transferToken()

// Print asset ID
console.log(`Asset ID created: ${ft_asset}`);
})();
