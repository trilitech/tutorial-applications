import { InfoOutlined } from "@mui/icons-material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
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
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import BigNumber from "bignumber.js";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import React, { Fragment, useState } from "react";
import * as yup from "yup";
import { UserContext, UserContextType } from "./App";
import ConnectButton from "./ConnectWallet";
import { TransactionInvalidBeaconError } from "./TransactionInvalidBeaconError";
import { address, nat } from "./type-aliases";

const itemPerPage: number = 6;

type OfferEntry = [address, Offer];

type Offer = {
  price: nat;
  quantity: nat;
};

const validationSchema = yup.object({
  quantity: yup
    .number()
    .required("Quantity is required")
    .positive("ERROR: The number must be greater than 0!"),
});

export default function WineCataloguePage() {
  const {
    Tezos,
    nftContractTokenMetadataMap,
    setUserAddress,
    setUserBalance,
    wallet,
    userAddress,
    nftContract,
    refreshUserContextOnPageReload,
    storage,
  } = React.useContext(UserContext) as UserContextType;
  const [selectedOfferEntry, setSelectedOfferEntry] =
    React.useState<OfferEntry | null>(null);

  const formik = useFormik({
    initialValues: {
      quantity: 1,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log("onSubmit: (values)", values, selectedOfferEntry);
      buy(values.quantity, selectedOfferEntry!);
    },
  });
  const { enqueueSnackbar } = useSnackbar();
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);

  const buy = async (quantity: number, selectedOfferEntry: OfferEntry) => {
    try {
      const op = await nftContract?.methods
        .buy(BigNumber(quantity) as nat, selectedOfferEntry[0])
        .send({
          amount: quantity * selectedOfferEntry[1].price.toNumber(),
          mutez: true,
        });

      await op?.confirmation(2);

      enqueueSnackbar(
        "Bought " +
          quantity +
          " unit of Wine collection (token_id:" +
          selectedOfferEntry[0][1] +
          ")",
        {
          variant: "success",
        }
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
        Wine catalogue
      </Typography>

      {storage?.extension.offers && storage?.extension.offers.size != 0 ? (
        <Fragment>
          <Pagination
            page={currentPageIndex}
            onChange={(_, value) => setCurrentPageIndex(value)}
            count={Math.ceil(
              Array.from(storage?.extension.offers.entries()).filter(
                ([_, offer]) => offer.quantity.isGreaterThan(0)
              ).length / itemPerPage
            )}
            showFirstButton
            showLastButton
          />
          <ImageList
            cols={
              isDesktop ? itemPerPage / 2 : isTablet ? itemPerPage / 3 : 1
            }
          >
            {Array.from(storage?.extension.offers.entries())
              .filter(([_, offer]) => offer.quantity.isGreaterThan(0))
              .filter((_, index) =>
                index >= currentPageIndex * itemPerPage - itemPerPage &&
                index < currentPageIndex * itemPerPage
                  ? true
                  : false
              )
              .map(([owner, offer]) => (
                <Card key={owner}>
                  <CardHeader
                    avatar={
                      <Tooltip
                        title={
                          <Box>
                            <Typography>{"ID : " + 0}</Typography>
                            <Typography>
                              {"Description : " +
                                nftContractTokenMetadataMap.get("0")
                                  ?.description}
                            </Typography>
                            <Typography>{"Seller : " + owner} </Typography>
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
                        {"Price : " +
                          offer.price.dividedBy(1000000) +
                          " XTZ/bottle"}
                      </Typography>
                      <Typography variant="body2">
                        {"Available units : " + offer.quantity}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions>
                    {!userAddress ? (
                      <Box marginLeft="5vw">
                        <ConnectButton
                          Tezos={Tezos}
                          nftContractTokenMetadataMap={
                            nftContractTokenMetadataMap
                          }
                          setUserAddress={setUserAddress}
                          setUserBalance={setUserBalance}
                          wallet={wallet}
                        />
                      </Box>
                    ) : (
                      <form
                        style={{ width: "100%" }}
                        onSubmit={(values) => {
                          setSelectedOfferEntry([owner, offer]);
                          formik.handleSubmit(values);
                        }}
                      >
                        <TextField
                          type="number"
                          sx={{ bottom: 0, position: "relative" }}
                          fullWidth
                          name="quantity"
                          label="quantity"
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
                            inputProps: { min: 0, max: offer.quantity },
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button
                                  type="submit"
                                  aria-label="add to favorites"
                                >
                                  <ShoppingCartIcon /> BUY
                                </Button>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </form>
                    )}
                  </CardActions>
                </Card>
              ))}
          </ImageList>
        </Fragment>
      ) : (
        <Typography sx={{ py: '2em' }} variant="h4">
          There are no NFTs for sale. Mint some and offer them for sale.
        </Typography>
      )}
    </Paper>
  );
}