import pinataSDK from "@pinata/sdk";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as mime from "mime-types";
import * as dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import * as algotxns from "../src/algorand/index.js";
import { getAlgodClient } from "../src/clients/index.js";
import algosdk from "algosdk";

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const network = process.env.NEXT_PUBLIC_NETWORK || "SandNet";
const algodClient = getAlgodClient(network);

// get creator account
const deployer = algosdk.mnemonicToSecretKey(process.env.NEXT_PUBLIC_DEPLOYER_MNEMONIC);

(async () => {
  // check pinata connection
  const response = await pinata.testAuthentication();
  if (!response) {
    console.log("Unable to authenticate with Pinata");
    return;
  }

  // write your code here
    // list of asset names
    const assetNames = ["ACS Corgi", "ACS Shiba Inu"];

    // read directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const sourcePath = path.join(__dirname, "../assets/nfts/");
    const assets = fs.readdirSync(sourcePath).map((file, index) => {
      const asset = {
        index: index + 1, // 1-based index
        name: `${assetNames[index]} #${index + 1}`, // e.g Corgi #1
        description: `Asset ${index + 1}/${assetNames.length}`,
        image_mimetype: mime.lookup(file),
        file: file,
      };
      return asset;
    });
    console.log(assets);
  
      // pin content directory
    const folderOptions = {
      pinataMetadata: {
        name: "nfts",
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };
  
    const result = await pinata.pinFromFS (sourcePath, folderOptions);
    console.log("Digital content pinned: ", result);
  
    // prepare to deploy assets
    await Promise.all(
      assets.map(async (asset) => {
        // construct JSON metadata for each asset
        const metadata = {
          name: asset.name,
          description: asset.description,
          image: `ipfs://${result.IpfsHash}/Users/User/Documents/autumn-leaf/al-coin/assets/nfts/${asset.file}#i`, // update url here for windows users
          image_mimetype: asset.image_mimetype,
          properties: {
            file_url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/Users/User/Documents/autumn-leaf/al-coin/nfts/${asset.file}#i`, // update url here for windows users
            file_url_mimetype: asset.image_mimetype,
          },
        };
        //https://gateway.pinata.cloud/ipfs/QmSe69gSnUvknDJwMYFDQqGdzeqW6nYsmGNkMnjManPoAC/Documents/arc69-nft-lisonyandu/assets/nfts/corgi.jpeg
        // pin metadata
        const jsonOptions = {
          pinataMetadata: {
            name: `${asset.index}-metadata.json`,
          },
          pinataOptions: {
            cidVersion: 0,
          },
        };
  
        const resultMeta = await pinata.pinJSONToIPFS(metadata, jsonOptions);
        console.log("JSON Metadata pinned: ", resultMeta);
  
        // ARC69 asset url should end with #arc69 
        const preparedAsset = {
          name: asset.name,
          url: `ipfs://${resultMeta.IpfsHash}#arc69`,
        };
        const note =  new Uint8Array(Buffer.from((JSON.stringify(resultMeta))))
        // deploy asset
        const createNftTxn = await algotxns.getCreateNftTxn(
          algodClient,
          deployer.addr,
          asset.name,
          false,
          "ACSNFT",
          preparedAsset.url,
         note
        );
        console.log(await algotxns.signAndSubmit(algodClient, [createNftTxn], deployer));
        })
        );
})();
