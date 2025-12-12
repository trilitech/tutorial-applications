import { Wallet } from "@mui/icons-material";
import { Button } from "@mui/material";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { TZIP21TokenMetadata } from "./App";
import { PagesPaths } from "./Navigator";

type ButtonProps = {
  Tezos: TezosToolkit;
  setUserAddress: Dispatch<SetStateAction<string>>;
  setUserBalance: Dispatch<SetStateAction<number>>;
  wallet: BeaconWallet;
  nftContractTokenMetadataMap: Map<string, TZIP21TokenMetadata>;
};

const ConnectButton = ({
  Tezos,
  setUserAddress,
  setUserBalance,
  wallet,
  nftContractTokenMetadataMap,
}: ButtonProps): JSX.Element => {
  const navigate = useNavigate();

  const connectWallet = async (): Promise<void> => {
    try {
      await wallet.requestPermissions();
      // gets user's address
      const userAddress = await wallet.getPKH();
      const balance = await Tezos.tz.getBalance(userAddress);
      setUserBalance(balance.toNumber());
      setUserAddress(userAddress);
      if (nftContractTokenMetadataMap && nftContractTokenMetadataMap.size > 0)
        navigate(PagesPaths.CATALOG);
      else navigate(PagesPaths.MINT);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button sx={{ p: 1 }} onClick={connectWallet}>
      <Wallet />
      &nbsp; Connect wallet
    </Button>
  );
};

export default ConnectButton;
