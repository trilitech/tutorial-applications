# Tutorial application: Create a web app that mints NFTs

This is the completed application from the tutorial [Create a web app that mints NFTs](https://docs.tezos.com/tutorials/create-an-nft/nft-taquito/).

## Project structure

This project contains two applications that you run on your computer and one smart contract that you deploy to Tezos:

- The `frontend` folder contains a Vite and Svelte application that allows users to upload files and send a request to mint and NFT based on that file.
- The `backend` folder contains an Express application that receives the files and NFT information and mints NFTs.
- The `contract` folder contains a smart contract written in CameLIGO that manages the NFTs.

## Running the application

To run the application, you must deploy (originate) the contract and start the backend and frontend applications:

1. If you don't have an account on Pinata, set one up at <https://www.pinata.cloud/>.

1. On Pinata, create an API key with the `pinFileToIFPS` and `pinJSONToIFPS` permissions and copy the API key and secret.

1. Originate the `contract/NFTS_contract.mligo` file to Tezos, using the commented text at the end as the initial storage value.
For example, you can use the web IDE for LIGO at <https://ide.ligolang.org/local> to originate the contract.

1. Copy the address of the originated contract.

1. Start the backend app:

   1. Go to the `backend` folder.

   1. Install the dependencies by running `npm install`.

   1. In the file `src/PinataKeys.ts`, enter your Pinata API key and secret.

   1. Start the app by running `npm run dev`.

1. Start the frontend app:

   1. Go to the `frontend` folder.

   1. Install the dependencies by running `npm install`.

   1. Update the `src/App.svelte` file to set the address of the contract you originated in this line:

      ```ts
      const contractAddress = "KT1XKSMfewg86885Q25ezFdNVTr995XVhVCf";
      ```

   1. Start the app by running `npm run dev`.

1. Open the frontend app in a web browser by going to <http://localhost:5173>.
