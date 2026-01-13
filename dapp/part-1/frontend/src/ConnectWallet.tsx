   import "./init";
   import { NetworkType } from "@airgap/beacon-sdk";
   import { BeaconWallet } from "@taquito/beacon-wallet";
   import { TezosToolkit } from "@taquito/taquito";
   import { Dispatch, SetStateAction } from "react";

   type ButtonProps = {
     Tezos: TezosToolkit;
     setUserAddress: Dispatch<SetStateAction<string>>;
     setUserBalance: Dispatch<SetStateAction<number>>;
     wallet: BeaconWallet;
     setTezos: Dispatch<SetStateAction<TezosToolkit>>;
   };
   const ConnectButton = ({
     Tezos,
     setTezos,
     setUserAddress,
     setUserBalance,
     wallet,
   }: ButtonProps): JSX.Element => {
     const connectWallet = async (): Promise<void> => {
       try {
         await wallet.requestPermissions();
         // gets user's address
         const userAddress = await wallet.getPKH();
         const balanceMutez = await Tezos.tz.getBalance(userAddress);
         const balanceTez = balanceMutez.toNumber() / 10000000;
         setUserBalance(balanceTez);
         setUserAddress(userAddress);

         Tezos.setWalletProvider(wallet);
         setTezos(Tezos);
       } catch (error) {
         console.log(error);
       }
     };
     return (
       <div className="buttons">
         <button className="button" onClick={connectWallet}>
           <span>
             <i className="fas fa-wallet"></i>&nbsp; Connect with wallet
           </span>
         </button>
       </div>
     );
   };
   export default ConnectButton;
