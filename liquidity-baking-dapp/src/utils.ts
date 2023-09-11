import BigNumber from "bignumber.js";
import type { TezosToolkit } from "@taquito/taquito";
import type { token } from "./types";
import type { TezosAccountAddress } from "./store";
import { tzbtcAddress, sirsAddress } from "./config";

export const displayTokenAmount = (
  amount_: BigNumber | number,
  token: token
): string => {
  let amount = BigNumber.isBigNumber(amount_) ? amount_.toNumber() : amount_;
  switch (token) {
    case "XTZ":
      return (+(amount / 10 ** 6).toFixed(6)).toLocaleString("en-US");
    case "tzBTC":
      if (amount < 100) {
        return "> 0.000001";
      }
      return (+(amount / 10 ** 8).toFixed(8)).toLocaleString("en-US", {
        maximumSignificantDigits: 8
      });
    case "SIRS":
      return (+amount.toFixed(2)).toLocaleString("en-US");
  }
};

export const shortenHash = (hash: string): string =>
  hash ? hash.slice(0, 5) + "..." + hash.slice(-5) : "";

export const fetchExchangeRates = async (): Promise<{
  tzbtcPrice: number;
  xtzPrice: number;
} | null> => {
  const query = `
      query {
        overview { xtzUsdQuote },
        token(id: "KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn") { price }
      }
    `;
  const res = await fetch(`https://analytics-api.quipuswap.com/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query
    })
  });
  if (res.status === 200) {
    const resData = await res.json();
    let xtzPrice = resData?.data?.overview?.xtzUsdQuote;
    let tzbtcPrice = resData?.data?.token?.price;
    // validates the 2 values
    if (xtzPrice && tzbtcPrice) {
      xtzPrice = +xtzPrice;
      tzbtcPrice = +tzbtcPrice;
      if (!isNaN(xtzPrice) && !isNaN(tzbtcPrice)) {
        // tzBTC price is given in XTZ by the API
        tzbtcPrice = tzbtcPrice * xtzPrice;
        return { tzbtcPrice, xtzPrice };
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const fetchBalances = async (
  Tezos: TezosToolkit,
  userAddress: TezosAccountAddress
): Promise<{
  xtzBalance: number;
  tzbtcBalance: number;
  sirsBalance: number;
} | null> => {
  try {
    const xtzBalance = await Tezos.tz.getBalance(userAddress);
    if (!xtzBalance) throw "Unable to fetch XTZ balance";

    const res = await fetch(
      `https://api.tzkt.io/v1/tokens/balances?account=${userAddress}&token.contract.in=${tzbtcAddress},${sirsAddress}`
    );
    if (res.status === 200) {
      const data = await res.json();
        const tzbtcBalance = +data[0]?.balance || 0;
        const sirsBalance = +data[1]?.balance || 0;
        return {
          xtzBalance: xtzBalance.toNumber(),
          tzbtcBalance,
          sirsBalance
        }
      } else {
        // Wallet has no tzBTC or SIRS
        return {
          xtzBalance: xtzBalance.toNumber(),
          tzbtcBalance: 0,
          sirsBalance: 0
        };
      }
    } else {
      throw "Unable to fetch tzBTC and SIRS balances";
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const calcDeadline = () =>
  new Date(Date.now() + 3_600_000).toISOString();
