"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { MarketGrid } from "@/components/market-grid";
import {
  ConnectButton,
  useSendAndConfirmTransaction,
  useReadContract,
} from "thirdweb/react";
import { marketIds } from "../lib/utils";
import {client} from '../lib/providers'
import { contract } from "@/lib/contract-utils";
import { prepareContractCall } from "thirdweb";
import { toWei } from "thirdweb/utils";
import toast, { Toaster } from "react-hot-toast";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [existingMarketIds, setExistingMarketIds] = useState<number[]>([]);

  // Fetch the number of markets from the contract
  const { data: marketCounter } = useReadContract({
    contract: contract,
    method: "marketCounter",
    params: [],
  });

  const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();

  useEffect(() => {
    // Update existingMarketIds when marketCounter changes
    if (marketCounter) {
      setExistingMarketIds(marketIds(marketCounter));
    }
  }, [marketCounter]);

  // place a bet
  const handlePlaceBet = async (
    marketId: number,
    side: "yes" | "no",
    betAmount: number
  ) => {
    const isYes = side === "yes" ? true : false;
    const marketIdBigInt = BigInt(marketId);
    const betAmountWei = toWei(betAmount.toString());

    // Prepare and send the transaction to place a bet
    const transaction = prepareContractCall({
      contract,
      method: "function placeBet(uint256 marketId, bool isYes)",
      params: [marketIdBigInt, isYes],
      value: betAmountWei, // Attach the bet amount as value
    });

    try {
      const result = await mutateTransaction(transaction);
      console.log({ result });
    } catch (error) {
      console.log({ error });
      toast.error("Market not active.");
    }
  };

  const claimWinnings = async (marketId: number) => {
    console.log("Claiming winnings for market ID:", marketId);
    // Prepare and send the transaction to claim winnings
    const marketIdBigInt = BigInt(marketId);
    const transaction = prepareContractCall({
      contract,
      method: "function claimWinnings(uint256 marketId)",
      params: [marketIdBigInt],
    });

    try {
      const result = await mutateTransaction(transaction);
      console.log("Winnings claimed", result);
      toast.success("Congrats on your winnings!");
    } catch (error) {
      toast.error("Winnings have been claimed.");
    }
  };

  const resolveMarket = async (marketId: number, winner: string) => {
    console.log("resolve market for market ID:", marketId);
    // Prepare and send the transaction to claim winnings
    const marketIdBigInt = BigInt(marketId);
    const winnerInt = Number(winner);
    const transaction = prepareContractCall({
      contract,
      method: "function resolveMarket(uint256 marketId, uint8 winner)",
      params: [marketIdBigInt, winnerInt],
    });
    try {
      await mutateTransaction(transaction);
    } catch (error) {
      toast.error("Market has been resolved.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Markets</h1>
            <p className="text-gray-400">
              Show you're an expert. Trade on the outcomes of future events.
            </p>
          </div>

          <div>
            <ConnectButton client={client} />
          </div>
        </div>

        {/* pass the array of existing market IDs to MarketGrid to generate cards for each market */}
        <MarketGrid
          existingMarketIds={existingMarketIds}
          handlePlaceBet={handlePlaceBet}
          claimWinnings={claimWinnings}
          resolveMarket={resolveMarket}
        />
        <Toaster />
      </main>
    </div>
  );
}