# Autumn Leaf Coin

Welcome to Autumn Leaf Coin, our very own digital currency powered by the Algorand blockchain. This innovative currency serves a dual purpose within our organization.

## Recognition and Rewards

Autumn Leaf Coin is more than just a digital currency; it's a token of appreciation for the exceptional efforts of our company's rockstars. When someone goes above and beyond, we reward them with Autumn Leaf Coin, providing a tangible and shiny acknowledgment of their outstanding contributions.

## Internal Economy and Community Building

Beyond recognition, Autumn Leaf Coin functions as an internal currency for our organization. Employees can use it to purchase exclusive company merchandise, fostering a unique and vibrant economy within our community. By embracing this digital currency for internal transactions, we aim to strengthen the sense of community, engagement, and value among our team members.

Join us in this exciting venture as we integrate technology, recognition, and community building through Autumn Leaf Coin!

### Part 1: Create and transfer fungible tokens

1. Deploy a fungible token using the seller account. You will be using this token to "purchase" the NFT.
2. Transfer 100 fungible tokens to your buyer account.
3. Save the asset ID in the `.env.local` file for use in the application frontend.
4. Complete the code in `deployTokens.js` to do this.

### Part 2: Create and transfer NFTs

1. Deploy an NFT collection and display it on the sample Dapp provided. The digital content of the NFTs can be found in the `assets/nft` folder.
2. Complete the code in `deployNfts.js` to do this.

The created NFTs should follow [ARC69](https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0069.md) standards. This includes

1. Include `arc69` in the JSON metadata, under `properties > standard` field.
2. Specify mimetype in asset url. e.g. `ipfs://QmWS1VAdMD353A6SDk9wNyvkT14kyCiZrNDYAad4w1tKqT#v` contains `#v` if the content is a video.
3. JSON metadata should be added to the `note` field in the asset create/config `acfg` transaction.

### Part 3: Updating the Dapp

The Dapp is able to allow end users to connect to it and determine if he/she is a buyer or seller account, based on the asset deployment.

#### Making the purchase

1. Purchase an NFT on the Dapp with your buyer account. Each purchase costs `5 fungible tokens`.
2. NFT purchase should be done using an *atomic transfer*, which includes the following transactions (NFT opt-in, Fungible token transfer).
3. Complete the code in `NftList.jsx` to do this.

#### Simulating a completed purchase

1. When you connect with the seller account, you should be able to send the NFT to the seller account. This is to simulate a completed purchase from a smart contract that creates these NFTs. Complete the code in `TransferNFTForm.jsx` to do this.

## Part 4: TestNet

Your Dapp should also be able to run on TestNet. If you are deploying assets / NFTs on TestNet, please ensure the following,

1. Import your buyer and seller accounts by updating the duplicated `.env` file. Make sure they are funded via the [dispenser](https://bank.testnet.algorand.network/).
2. Do *NOT* import any account mnemonics to the frontend to sign transactions.

## Setup instructions

### 1. Install packages

Run `yarn install`

### 2. Update environement variables

1. Copy `.env.example` to `.env.local`.
2. Update Algorand Sandbox credentials in `.env.local` file.

### 3. Setup Pinata IPFS

1. Create a free account on [Pinata](https://www.pinata.cloud/)
2. Generate API key via account page.
3. Update `.env.local` file with the credentials.

### 4. Deploying tokens and NFTs

Run `yarn tsx scripts/deployTokens.js`
Run `yarn tsx scripts/deployNfts.js`

### 8. Run the Dapp

Run `yarn dev`
