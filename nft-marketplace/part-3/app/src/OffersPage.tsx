import { InfoOutlined } from "@mui/icons-material";
import SellIcon from "@mui/icons-material/Sell";
import * as api from "@tzkt/sdk-api";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  ImageList,
  InputAdornment,
  Pagination,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";
import { UserContext, UserContextType } from "./App";
import ConnectButton from "./ConnectWallet";
import { TransactionInvalidBeaconError } from "./TransactionInvalidBeaconError";
import { address, nat } from "./type-aliases";

const itemPerPage: number = 6;

const validationSchema = yup.object({
  price: yup
    .number()
    .required("Price is required")
    .positive("ERROR: The number must be greater than 0!"),
  quantity: yup
    .number()
    .required("Quantity is required")
    .positive("ERROR: The number must be greater than 0!"),
});

type Offer = {
  price: nat;
  quantity: nat;
};

export default function OffersPage() {
  api.defaults.baseUrl = "https://api.shadownet.tzkt.io";

  const [selectedTokenId, setSelectedTokenId] = React.useState<number>(0);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);

  let [ownerOffers, setOwnerOffers] = React.useState<Offer | null>(null);
  let [ownerBalance, setOwnerBalance] = React.useState<number>(0);

  const {
    nftContract,
    nftContractTokenMetadataMap,
    userAddress,
    storage,
    refreshUserContextOnPageReload,
    Tezos,
    setUserAddress,
    setUserBalance,
    wallet,
  } = React.useContext(UserContext) as UserContextType;

  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      price: 0,
      quantity: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log("onSubmit: (values)", values, selectedTokenId);
      sell(selectedTokenId, values.quantity, values.price);
    },
  });

  const initPage = async () => {
    if (storage) {
      console.log("context is not empty, init page now");

      const ledgerBigMapId = (
        storage.ledger as unknown as { id: BigNumber }
      ).id.toNumber();

      const ownersKeys = await api.bigMapsGetKeys(ledgerBigMapId, {
        micheline: "Json",
        active: true,
      });

      await Promise.all(
        ownersKeys.map(async (ownerKey) => {
          if (ownerKey.key === userAddress) {
            const ownerBalance = await storage.ledger.get(
              userAddress as address
            );
            setOwnerBalance(ownerBalance.toNumber());
            const ownerOffers = await storage.extension.offers.get(
              userAddress as address
            );
            if (ownerOffers && ownerOffers.quantity != BigNumber(0))
              setOwnerOffers(ownerOffers!);

            console.log(
              "found for " +
                ownerKey.key +
                " on token_id " +
                0 +
                " with balance " +
                ownerBalance
            );
          } else {
            console.log("skip to next owner");
          }
        })
      );
    } else {
      console.log("context is empty, wait for parent and retry ...");
    }
  };

  useEffect(() => {
    (async () => {
      console.log("after a storage changed");
      await initPage();
    })();
  }, [storage]);

  useEffect(() => {
    (async () => {
      console.log("on Page init");
      await initPage();
    })();
  }, []);

  const sell = async (token_id: number, quantity: number, price: number) => {
    try {
      const op = await nftContract?.methods
        .sell(
          BigNumber(quantity) as nat,
          BigNumber(price * 1000000) as nat //to mutez
        )
        .send();

      await op?.confirmation(2);

      enqueueSnackbar(
        "Wine collection (token_id=" +
          token_id +
          ") offer for " +
          quantity +
          " units at price of " +
          price +
          " XTZ",
        { variant: "success" }
      );

      refreshUserContextOnPageReload(); //force all app to refresh the context
    } catch (error) {
      console.table(`Error: ${JSON.stringify(error, null, 2)}`);
      let tibe: TransactionInvalidBeaconError =
        new TransactionInvalidBeaconError(error);
      enqueueSnackbar(tibe.data_message, {
        variant: "error",
        autoHideDuration: 10000,
      });
    }
  };

  const isDesktop = useMediaQuery("(min-width:1100px)");
  const isTablet = useMediaQuery("(min-width:600px)");
  return (
    <Paper>
      <Typography style={{ paddingBottom: "10px" }} variant="h5">
        Sell my bottles
      </Typography>
      {ownerBalance != 0 ? (
        <Fragment>
          <Pagination
            page={currentPageIndex}
            onChange={(_, value) => setCurrentPageIndex(value)}
            count={Math.ceil(1 / itemPerPage)}
            showFirstButton
            showLastButton
          />

          <ImageList
            cols={
              isDesktop ? itemPerPage / 2 : isTablet ? itemPerPage / 3 : 1
            }
          >
            <Card key={userAddress + "-" + 0}>
              <CardHeader
                avatar={
                  <Tooltip
                    title={
                      <Box>
                        <Typography>{"ID : " + 0}</Typography>
                        <Typography>
                          {"Description : " +
                            nftContractTokenMetadataMap.get("0")?.description}
                        </Typography>
                      </Box>
                    }
                  >
                    <InfoOutlined />
                  </Tooltip>
                }
                title={nftContractTokenMetadataMap.get("0")?.name}
              />
              <CardMedia
                sx={{ width: "auto", marginLeft: "33%" }}
                component="img"
                height="100px"
                image={nftContractTokenMetadataMap
                  .get("0")
                  ?.thumbnailUri?.replace(
                    "ipfs://",
                    "https://gateway.pinata.cloud/ipfs/"
                  )}
              />

              <CardContent>
                <Box>
                  <Typography variant="body2">
                    {"Owned : " + ownerBalance}
                  </Typography>
                  <Typography variant="body2">
                    {ownerOffers
                      ? "Traded : " +
                        ownerOffers?.quantity +
                        " (price : " +
                        ownerOffers?.price.dividedBy(1000000) +
                        " Tz/b)"
                      : ""}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                {!userAddress ? (
                  <Box marginLeft="5vw">
                    <ConnectButton
                      Tezos={Tezos}
                      nftContractTokenMetadataMap={nftContractTokenMetadataMap}
                      setUserAddress={setUserAddress}
                      setUserBalance={setUserBalance}
                      wallet={wallet}
                    />
                  </Box>
                ) : (
                  <form
                    style={{ width: "100%" }}
                    onSubmit={(values) => {
                      setSelectedTokenId(0);
                      formik.handleSubmit(values);
                    }}
                  >
                    <span>
                      <TextField
                        type="number"
                        sx={{ width: "40%" }}
                        name="price"
                        label="price/bottle"
                        placeholder="Enter a price"
                        variant="filled"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.price &&
                          Boolean(formik.errors.price)
                        }
                        helperText={
                          formik.touched.price && formik.errors.price
                        }
                      />
                      <TextField
                        sx={{
                          width: "60%",
                          bottom: 0,
                          position: "relative",
                        }}
                        type="number"
                        label="quantity"
                        name="quantity"
                        placeholder="Enter a quantity"
                        variant="filled"
                        value={formik.values.quantity}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.quantity &&
                          Boolean(formik.errors.quantity)
                        }
                        helperText={
                          formik.touched.quantity && formik.errors.quantity
                        }
                        InputProps={{
                          inputProps: { min: 0, max: ownerBalance },
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button
                                type="submit"
                                aria-label="add to favorites"
                              >
                                <SellIcon /> Sell
                              </Button>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </span>
                  </form>
                )}
              </CardActions>
            </Card>
          </ImageList>
        </Fragment>
      ) : (
        <Typography sx={{ py: "2em" }} variant="h4">
          Sorry, you don't own any bottles, buy or mint some first
        </Typography>
      )}
    </Paper>
  );
}