import { useWallet } from "@txnlab/use-wallet";
import { useEffect, useState } from "react";
import { getAlgodClient } from "../clients";
import Button from "./Button";
import algosdk from "algosdk";
import * as algotxn from "@/algorand";

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algod = getAlgodClient(network);

export default function TransferNFTForm() {
  const { activeAddress, signTransactions, sendTransactions } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [nft, setNft] = useState("");
  const [txnref, setTxnRef] = useState("");
  const [txnUrl, setTxnUrl] = useState("");

  // nfts.length > 0 ? nfts[0].asset["asset-id"] : ""
  useEffect(() => {
    const loadNfts  = async () => {
      const nftList = await algotxn.fetchNFTs(algod);
      setNfts(nftList);
      //set the value of nft to the asset ID of the first NFT in the list.
      if (nftList.length > 0) {
        setNft(nftList[0].asset["asset-id"]);
      }
    };

    loadNfts ();
  }, []);

  const getTxnRefUrl = (txId) => {
    if (network === "SandNet") {
      return `https://app.dappflow.org/explorer/transaction/${txId}`;
    } else if (network === "TestNet") {
      return `https://testnet.algoexplorer.io/tx/${txId}`;
    }

    return "";
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // write your code here
    try {
      const assetId = parseInt(nft);
      console.log(assetId);
     
      // transfer NFT from deployer account
      const response  = await algotxn.getNFTFromDeployer(algod,receiver, assetId);
      const groupedTxn = algosdk.assignGroupID(response);
      const encodedTxns = groupedTxn.map((txn) => algosdk.encodeUnsignedTransaction(txn));
      const signed = await signTransactions(encodedTxns);
      const res = await sendTransactions(signed, 4);
      setTxnRef(res.txId)
      const txnUrl = getTxnRefUrl(res.txId);
      setTxnUrl(txnUrl);
      // refresh the list
      if (res) {
            setNfts(
              nfts.filter(nftItem => nftItem.asset["asset-id"] !== assetId));
            }
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
      <form onSubmit={handleSubmit}>
        <div className="mb-4 w-full">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
            Select item to transfer
          </label>
          <select value={nft} onChange={(e) => setNft(e.target.value)}>
            {nfts.map((n, index) => (
              <option key={index} value={n.asset["asset-id"]}>
               {n.asset["asset-id"]}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="to">
            To
          </label>
          <input
            className="w-full"
            name="to"
            onChange={(e) => setReceiver(e.target.value)}
            value={receiver}
            type="text"
            placeholder="Recipient Address"
          />
        </div>
        <Button label="Send NFT" type="submit" />
      </form>
    </div>
  );
}
