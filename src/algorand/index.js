import algosdk from "algosdk";
import axios from "axios";

// Write functions to do the following,
// 1. Create the necessary transactions for deploying and transacting NFTs


const getPaymentTxn = async (algodClient, from, to, assetId, amount) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
    // const assetId = parseInt(process.env.NEXT_PUBLIC_FT_ASSET_ID);
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from,
      to,
      assetIndex: assetId,
      amount,
      suggestedParams,
    });
  };
  
  const getCreateNftTxn = async (algodClient, from, assetName, defaultFrozen, unitName, assetURL,note) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    // txn to create a pure nft
    return algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from,
      assetName,
      total: 1,
      decimals: 0,
      defaultFrozen,
      unitName,
      assetURL,
      note,
      suggestedParams,
    });
  };
  
  const signAndSubmit = async (algodClient, txns, signer) => {
    // used by backend to sign and submit txns
    const groupedTxns = algosdk.assignGroupID(txns);
  
    const signedTxns = groupedTxns.map((txn) => txn.signTxn(signer.sk));
  
    const response = await algodClient.sendRawTransaction(signedTxns).do();
  
    const confirmation = await algosdk.waitForConfirmation(algodClient, response.txId, 4);
  
    return {
      response,
      confirmation,
    };
  };
  
  const fetchNFTs = async (algodClient) => {
    const deployerAddr = process.env.NEXT_PUBLIC_DEPLOYER_ADDR;
    const { assets } = await algodClient.accountInformation(deployerAddr).do();
  
    let nfts = [];
    if (assets) {
      for (let asset of assets) {
        const assetInfo = await algodClient.getAssetByID(asset["asset-id"]).do();
        const { decimals, total, url } = assetInfo.params;
  
        const isNFT = url !== undefined && url.includes("ipfs://") && total === 1 && decimals === 0;
        const deployerHasNFT = asset.amount > 0;
  
        if (isNFT && deployerHasNFT) {
          try {
            // fetch JSON metadata based on ARC3 spec, we will replace the ipfs scheme with a gateway url in order to display it on the UI
            const gatewayUrl = url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  
            const response = await axios.get(gatewayUrl);
            const metadata = response.data;
  
            const imgUrl = metadata.image.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/");
  
            nfts.push({
              asset,
              assetInfo,
              metadata,
              imgUrl,
            });
          } catch (error) {
            console.log(error);
            continue;
          }
        }
      }
    }
  
    return nfts;
  };
  
  const getAssetOptInTxn = async (algodClient, accAddr, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: accAddr,
      to: accAddr,
      assetIndex: assetId,
      suggestedParams,
    });
  };

  // 2. To fetch NFTs from seller account to display it in the UI
  
  const getNFTFromDeployer = async (algodClient, accAddr, assetId) => {
    const suggestedParams = await algodClient.getTransactionParams().do();
  
    // for demo purposes, never expose mnemonic in frontend to sign txns
    const deployer = process.env.NEXT_PUBLIC_DEPLOYER_ADDR;
  
    // asset transfer
    const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: deployer,
      to: accAddr,
      assetIndex: assetId,
      suggestedParams,
      amount: 1,
    });
  
    return  [assetTransferTxn];
  };
  

export { getPaymentTxn, getCreateNftTxn, signAndSubmit, fetchNFTs, getAssetOptInTxn, getNFTFromDeployer};
