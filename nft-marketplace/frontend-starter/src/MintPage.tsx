import { useMediaQuery } from "@mui/material";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";
import { UserContext, UserContextType } from "./App";

export default function MintPage() {
  const {
    userAddress,
    nftContractTokenMetadataMap,
    storage,
    refreshUserContextOnPageReload,
    nftContract,
  } = React.useContext(UserContext) as UserContextType;

  const isTablet = useMediaQuery("(min-width:600px)");

  return (
    <Paper>
      <Typography variant="h5">Mint your wine collection</Typography>

      {nftContractTokenMetadataMap.size != 0 ? (
        "//TODO"
      ) : (
        <Typography sx={{ py: "2em" }} variant="h4">
          No NFTs yet. Click "Connect Wallet" and mint an NFT.
        </Typography>
      )}
    </Paper>
  );
}
