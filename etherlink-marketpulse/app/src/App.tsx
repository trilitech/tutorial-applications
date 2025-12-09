import { Marketpulse, Marketpulse__factory } from "./typechain-types";

import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import "./App.css";

import {
  defineChain,
  getContract,
  prepareContractCall,
  readContract,
  sendTransaction,
  ThirdwebClient,
  waitForReceipt,
} from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { parseEther } from "viem";
import { etherlinkShadownetTestnet } from "viem/chains";
import { extractErrorDetails } from "./DecodeEvmTransactionLogsArgs";
import CONTRACT_ADDRESS_JSON from "./deployed_addresses.json";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "passkey", "phone"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("com.trustwallet.app"),
  createWallet("global.safe"),
];

//copy pasta from Solidity code as Abi and Typechain does not export enum types
enum BET_RESULT {
  WIN = 0,
  DRAW = 1,
  PENDING = 2,
}

interface AppProps {
  thirdwebClient: ThirdwebClient;
}

export default function App({ thirdwebClient }: AppProps) {
  console.log("*************App");

  const marketPulseContract = {
    abi: Marketpulse__factory.abi,
    client: thirdwebClient,
    chain: defineChain(etherlinkShadownetTestnet.id),
    address: CONTRACT_ADDRESS_JSON["MarketpulseModule#Marketpulse"],
  }

  const account = useActiveAccount();

  const [options, setOptions] = useState<Map<string, bigint>>(new Map());

  const [error, setError] = useState<string>("");

  const [status, setStatus] = useState<BET_RESULT>(BET_RESULT.PENDING);
  const [winner, setWinner] = useState<string | undefined>(undefined);
  const [fees, setFees] = useState<number>(0);
  const [betKeys, setBetKeys] = useState<bigint[]>([]);
  const [_bets, setBets] = useState<Marketpulse.BetStruct[]>([]);

  const reload = async () => {
    if (!account?.address) {
      console.log("No address...");
    } else {
      const dataStatus = await readContract({
        contract: getContract(marketPulseContract),
        method: "status",
        params: [],
      });

      const dataWinner = await readContract({
        contract: getContract(marketPulseContract),
        method: "winner",
        params: [],
      });

      const dataFEES = await readContract({
        contract: getContract(marketPulseContract),
        method: "FEES",
        params: [],
      });

      const dataBetKeys = await readContract({
        contract: getContract(marketPulseContract),
        method: "getBetKeys",
        params: [],
      });

      setStatus(dataStatus as unknown as BET_RESULT);
      setWinner(dataWinner as unknown as string);
      setFees(Number(dataFEES as unknown as bigint) / 100);
      setBetKeys(dataBetKeys as unknown as bigint[]);

      console.log(
        "**********status, winner, fees, betKeys",
        status,
        winner,
        fees,
        betKeys
      );
    }
  };

  //first call to load data
  useEffect(() => {
    (() => reload())();
  }, [account?.address]);

  //fetch bets

  useEffect(() => {
    (async () => {
      if (!betKeys || betKeys.length === 0) {
        console.log("no dataBetKeys");
        setBets([]);
      } else {
        const bets = await Promise.all(
          betKeys.map(
            async (betKey) =>
              (await readContract({
                contract: getContract(marketPulseContract),
                method: "getBets",
                params: [betKey],
              })) as unknown as Marketpulse.BetStruct
          )
        );
        setBets(bets);

        //fetch options
        let newOptions = new Map();
        setOptions(newOptions);
        bets.forEach((bet) => {
          if (newOptions.has(bet!.option)) {
            newOptions.set(
              bet!.option,
              newOptions.get(bet!.option)! + bet!.amount
            ); //acc
          } else {
            newOptions.set(bet!.option, bet!.amount);
          }
        });
        setOptions(newOptions);
        console.log("options", newOptions);
      }
    })();
  }, [betKeys]);

  const Ping = () => {
    // Comprehensive error handling
    const handlePing = async () => {
      try {
        const preparedContractCall = await prepareContractCall({
          contract: getContract(marketPulseContract),
          method: "ping",
          params: [],
        });

        console.log("preparedContractCall", preparedContractCall);

        const transaction = await sendTransaction({
          transaction: preparedContractCall,
          account: account!,
        });

        //wait for tx to be included on a block
        const receipt = await waitForReceipt({
          client: thirdwebClient,
          chain: defineChain(etherlinkShadownetTestnet.id),
          transactionHash: transaction.transactionHash,
        });

        console.log("receipt:", receipt);

        setError("");
      } catch (error) {
        const errorParsed = extractErrorDetails(
          error,
          Marketpulse__factory.abi
        );
        setError(errorParsed.message);
      }
    };

    return (
      <span style={{ alignContent: "center", paddingLeft: 100 }}>
        <button onClick={handlePing}>Ping</button>
        {!error || error === "" ? <>&#128994;</> : <>&#128308;</>}
      </span>
    );
  };

  const BetFunction = () => {
    const [amount, setAmount] = useState<BigNumber>(BigNumber(0)); //in Ether decimals
    const [option, setOption] = useState("chiefs");

    const runFunction = async () => {
      try {
        const contract = getContract(marketPulseContract);

        const preparedContractCall = await prepareContractCall({
          contract,
          method: "bet",
          params: [option, parseEther(amount.toString(10))],
          value: parseEther(amount.toString(10)),
        });

        const transaction = await sendTransaction({
          transaction: preparedContractCall,
          account: account!,
        });

        //wait for tx to be included on a block
        const receipt = await waitForReceipt({
          client: thirdwebClient,
          chain: defineChain(etherlinkShadownetTestnet.id),
          transactionHash: transaction.transactionHash,
        });

        console.log("receipt:", receipt);

        await reload();

        setError("");
      } catch (error) {
        const errorParsed = extractErrorDetails(
          error,
          Marketpulse__factory.abi
        );
        console.log("ERROR", error);
        setError(errorParsed.message);
      }
    };

    const calculateOdds = (option: string, amount?: bigint): BigNumber => {
      //check option exists
      if (!options.has(option)) return new BigNumber(0);

      console.log(
        "actuel",
        options && options.size > 0
          ? new BigNumber(options.get(option)!.toString()).toString()
          : 0,
        "total",
        new BigNumber(
          [...options.values()]
            .reduce((acc, newValue) => acc + newValue, amount ? amount : 0n)
            .toString()
        ).toString()
      );

      return options && options.size > 0
        ? new BigNumber(options.get(option)!.toString(10))
            .plus(
              amount ? new BigNumber(amount.toString(10)) : new BigNumber(0)
            )
            .div(
              new BigNumber(
                [...options.values()]
                  .reduce(
                    (acc, newValue) => acc + newValue,
                    amount ? amount : 0n
                  )
                  .toString(10)
              )
            )
            .plus(1)
            .minus(fees)
        : new BigNumber(0);
    };

    return (
      <span style={{ alignContent: "center", width: "100%" }}>
        {status && status === BET_RESULT.PENDING ? (
          <>
            <h3>Choose team</h3>

            <select
              name="options"
              onChange={(e) => setOption(e.target.value)}
              value={option}
            >
              <option value="chiefs"> Chiefs</option>
              <option value="lions">Lions </option>
            </select>
            <h3>Amount</h3>
            <input
              type="number"
              id="amount"
              name="amount"
              required
              onChange={(e) => {
                if (e.target.value && !isNaN(Number(e.target.value))) {
                  //console.log("e.target.value",e.target.value)
                  setAmount(new BigNumber(e.target.value));
                }
              }}
            />

            <hr />
            {account?.address ? <button onClick={runFunction}>Bet</button> : ""}

            <table style={{ fontWeight: "normal", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "left" }}>Avg price (decimal)</td>
                  <td style={{ textAlign: "right" }}>
                    {options && options.size > 0
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .toFixed(3)
                          .toString()
                      : 0}
                  </td>
                </tr>

                <tr>
                  <td style={{ textAlign: "left" }}>Potential return</td>
                  <td style={{ textAlign: "right" }}>
                    XTZ{" "}
                    {amount
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .multipliedBy(amount)
                          .toFixed(6)
                          .toString()
                      : 0}{" "}
                    (
                    {options && options.size > 0
                      ? calculateOdds(option, parseEther(amount.toString(10)))
                          .minus(new BigNumber(1))
                          .multipliedBy(100)
                          .toFixed(2)
                          .toString()
                      : 0}
                    %)
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <span style={{ color: "#2D9CDB", fontSize: "1.125rem" }}>
              Outcome: {BET_RESULT[status]}
            </span>
            {winner ? <div style={{ color: "#858D92" }}>{winner}</div> : ""}
          </>
        )}
      </span>
    );
  };

  const resolve = async (option: string) => {
    try {
      const preparedContractCall = await prepareContractCall({
        contract: getContract(marketPulseContract),
        method: "resolveResult",
        params: [option, BET_RESULT.WIN],
      });

      console.log("preparedContractCall", preparedContractCall);

      const transaction = await sendTransaction({
        transaction: preparedContractCall,
        account: account!,
      });

      //wait for tx to be included on a block
      const receipt = await waitForReceipt({
        client: thirdwebClient,
        chain: defineChain(etherlinkShadownetTestnet.id),
        transactionHash: transaction.transactionHash,
      });

      console.log("receipt:", receipt);

      await reload();

      setError("");
    } catch (error) {
      const errorParsed = extractErrorDetails(error, Marketpulse__factory.abi);
      setError(errorParsed.message);
    }
  };

  return (
    <>
      <header>
        <span style={{ display: "flex" }}>
          <h1>Market Pulse</h1>

          <div className="flex items-center gap-4">
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              connectModal={{ size: "compact" }}
              chain={defineChain(etherlinkShadownetTestnet.id)}
            />
          </div>
        </span>
      </header>

      <div id="content" style={{ display: "flex", paddingTop: 10 }}>
        <div style={{ width: "calc(66vw - 4rem)" }}>
          <img
            style={{ maxHeight: "40vh" }}
            src="https://zamrokk.github.io/marketpulse/images/graph.png"
          />
          <hr />

          <table style={{ width: "inherit" }}>
            <thead>
              <tr>
                <th>Outcome</th>
                <th>% chance</th>
                <th>action</th>
              </tr>
            </thead>
            <tbody>
              {options && options.size > 0 ? (
                [...options.entries()].map(([option, amount]) => (
                  <tr key={option}>
                    <td className="tdTable">
                      <div className="picDiv">
                        <img
                          style={{ objectFit: "cover", height: "inherit" }}
                          src={
                            "https://zamrokk.github.io/marketpulse/images/" +
                            option +
                            ".png"
                          }
                        ></img>
                      </div>
                      {option}
                    </td>
                    <td>
                      {new BigNumber(amount.toString())
                        .div(
                          new BigNumber(
                            [...options.values()]
                              .reduce((acc, newValue) => acc + newValue, 0n)
                              .toString()
                          )
                        )
                        .multipliedBy(100)
                        .toFixed(2)}
                      %
                    </td>

                    <td>
                      {status && status === BET_RESULT.PENDING ? (
                        <button onClick={() => resolve(option)}>Winner</button>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            width: "calc(33vw - 4rem)",
            boxShadow: "",
            margin: "1rem",
            borderRadius: "12px",
            border: "1px solid #344452",
            padding: "1rem",
          }}
        >
          <span className="tdTable">{<BetFunction />}</span>
        </div>
      </div>

      <footer>
        <h3>Errors</h3>

        <textarea
          readOnly
          rows={10}
          style={{ width: "100%" }}
          value={error}
        ></textarea>

        {account?.address ? <Ping /> : ""}
      </footer>
    </>
  );
}