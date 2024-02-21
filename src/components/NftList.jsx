import NftItem from "./NftItem";
import { useState } from "react";
import { getAlgodClient } from "../clients";
import { useWallet } from "@txnlab/use-wallet";
import * as algotxn from "@/algorand";
import algosdk from "algosdk";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algodClient = getAlgodClient(network);
const deployer = process.env.NEXT_PUBLIC_DEPLOYER_ADDR;
const assetIndex = parseInt(process.env.NEXT_PUBLIC_FT_ASSET_ID);

function NftList({ nfts }) {
  const [txnref, setTxnRef] = useState("");
  const [txnUrl, setTxnUrl] = useState("");
  const { activeAddress, signTransactions, sendTransactions } = useWallet();

  const getTxnRefUrl = (txId) => {
    if (network === "SandNet") {
      return `https://app.dappflow.org/explorer/transaction/${txId}`;
    } else if (network === "TestNet") {
      return `https://testnet.algoexplorer.io/tx/${txId}`;
    }

    return "";
  }

  const getThisNFT = async (assetId) => {
    // write your code here
    try {
      // opt into NFT from connected account
      const optInTxn  = await algotxn.getAssetOptInTxn(algodClient, activeAddress, assetId);
    // Transaction - send 5 Tokens from buyer to seller
    const tokenTransferTxn  = await algotxn.getPaymentTxn(algodClient,activeAddress,deployer,assetIndex,5);
    // Store both transactions
      const payload = [optInTxn, tokenTransferTxn];
      const groupedTxn = algosdk.assignGroupID(payload);
      const encodedTxns = groupedTxn.map((txn) => algosdk.encodeUnsignedTransaction(txn));
      const signed = await signTransactions(encodedTxns);
      const res = await sendTransactions(signed, 4);
      setTxnRef(res.txId)
      const txnUrl = getTxnRefUrl(res.txId);
      setTxnUrl(txnUrl);
 
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full">
      {activeAddress && txnref && (
        <p className="mb-4 text-left">
          <a href={txnUrl} target="_blank" className="text-blue-500">
            Tx ID: {txnref}
          </a>
        </p>
      )}
      {activeAddress && nfts.map((item, index) => (
        <NftItem
          key={index}
          src={item.imgUrl}
          metadata={item.metadata}
          assetId={item.asset["asset-id"]}
          onButtonClick={getThisNFT}
        />
      ))}
    </div>
  );
}

export default NftList;
