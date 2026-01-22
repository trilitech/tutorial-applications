import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/lib/contract-utils";
import { toEther } from "thirdweb/utils";

interface MarketCardProps {
  handlePlaceBet: (
    marketId: number,
    side: "yes" | "no",
    betAmount: number
  ) => void;
  marketId: number;
}

export function MarketCard({ marketId, handlePlaceBet }: MarketCardProps) {
  const [hoveredSide, setHoveredSide] = useState<"yes" | "no" | null>(null);
  const [selectedSide, setSelectedSide] = useState<"yes" | "no" | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [showBettingInterface, setShowBettingInterface] = useState(false);

  // get Data about the market from the contract
  const {
    data: marketInfo,
    isLoading: isLoadingMarketInfo,
    error: marketInfoError,
  } = useReadContract({
    contract: contract,
    method: "getMarket",
    params: [BigInt(marketId)],
  });

  const {
    data: marketProbData,
    isLoading: isLoadingMarketProb,
    error: marketProbError,
  } = useReadContract({
    contract: contract,
    method: "getProbability",
    params: [BigInt(marketId), true],
  });

  // Parse the market data using useMemo for performance and consistency
  const marketData = useMemo(() => {
    if (!marketInfo) {
      return undefined;
    }

    const typedMarketInfo = marketInfo as any;
    const typedMarketProbData = marketProbData as any;

    // Ensure all BigInts are handled correctly to prevent precision loss
    const totalYesAmount = typedMarketInfo.totalYesAmount as bigint;
    const totalNoAmount = typedMarketInfo.totalNoAmount as bigint;
    const totalYesShares = typedMarketInfo.totalYesShares as bigint;
    const totalNoShares = typedMarketInfo.totalNoShares as bigint;
    const probYes = typedMarketProbData as bigint;

    return {
      title: typedMarketInfo.question,
      endTime: typedMarketInfo.endTime.toString(),
      probYes: probYes.toString(),
      probNo: 100 - Number(probYes),
      change: Number(probYes) - (100 - Number(typedMarketProbData)), // difference between yes and no
      volume: Number(toEther(totalYesAmount + totalNoAmount)),
      resolved: typedMarketInfo.resolved,
      totalYesShares: totalYesShares,
      winner: typedMarketInfo.winner,
      totalNoShares: totalNoShares,
      image: "/penguin-mascot.png",
      marketBalance: toEther(typedMarketInfo.marketBalance),
    };
  }, [marketInfo]);

  const calculatePotentialPayout = (betAmount: number) => {
    if (betAmount <= 0) return 0;

    // NOTE: The code here does not take into account other holders of a position in the pool
    // in this calculation
    const totalPool = marketData ? marketData.volume + betAmount : 0;
    return totalPool;
  };

  const calculateProfit = (amount: number) => {
    const payout = calculatePotentialPayout(amount);

    return payout - amount;
  };

  if (!isLoadingMarketInfo) {
    return (
      <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <img
                src={marketData?.image || "/placeholder.svg"}
                alt={marketData?.title}
                className="w-10 h-10 rounded-lg"
              />
              <Badge
                variant="secondary"
                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
              >
                XTZ
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {marketData?.probYes}%
              </div>

              <div
                className={cn(
                  "flex items-center text-sm",
                  marketData && marketData.change >= 0 ? "text-green-400" : "text-red-400"
                )}
              >
                {marketData && marketData.change >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {marketData && Math.abs(marketData.change)}%
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-medium mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {marketData?.title}
          </h3>

          {/* Probability Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{marketData?.probYes}%</span>
              <span>{marketData?.probNo}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-pink-500 transition-all"
                style={{ width: `${marketData?.probYes}%` }}
              />
            </div>
          </div>

          {/* Betting Interface */}
          {!showBettingInterface ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                className={cn(
                  "relative transition-all duration-200 font-semibold",
                  hoveredSide === "yes"
                    ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 scale-105"
                    : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                )}
                onMouseEnter={() => setHoveredSide("yes")}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSide("yes");
                  setShowBettingInterface(true);
                }}
              >
                <div className="flex flex-col items-center">
                  <span>YES</span>
                  {hoveredSide === "yes" && (
                    <span className="text-xs opacity-90">
                      +{marketData?.probYes}%
                    </span>
                  )}
                </div>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "relative transition-all duration-200 font-semibold",
                  hoveredSide === "no"
                    ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25 scale-105"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                )}
                onMouseEnter={() => setHoveredSide("no")}
                onMouseLeave={() => setHoveredSide(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSide("no");
                  setShowBettingInterface(true);
                }}
              >
                <div className="flex flex-col items-center">
                  <span>NO</span>
                  {hoveredSide === "no" && (
                    <span className="text-xs opacity-90">
                      +{marketData?.probNo}%
                    </span>
                  )}
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {/* Selected Side Display */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Betting on:</span>
                <Badge
                  className={cn(
                    "font-semibold",
                    selectedSide === "yes"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  )}
                >
                  {selectedSide?.toUpperCase()}
                </Badge>
              </div>

              {/* Bet Amount Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bet Amount:</span>
                  <span className="text-white font-semibold">
                    {betAmount} XTZ
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, ${
                      selectedSide === "yes" ? "#10b981" : "#ef4444"
                    } 0%, ${selectedSide === "yes" ? "#10b981" : "#ef4444"} ${
                      (betAmount / 1000) * 100
                    }%, #374151 ${(betAmount / 1000) * 100}%, #374151 100%)`,
                  }}
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 XTZ</span>
                  <span>1000 XTZ</span>
                </div>
              </div>

              {/* Real-time Returns */}
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Potential Win:</span>
                  <span className="text-green-400 font-semibold">
                    {calculatePotentialPayout(betAmount)} XTZ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Profit:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      calculateProfit(betAmount) > 0
                        ? "text-green-400"
                        : "text-red-400"
                    )}
                  >
                    {calculateProfit(betAmount).toFixed(2)} XTZ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Return:</span>
                  <span className="text-blue-400 font-semibold">
                    +
                    {((calculateProfit(betAmount) / betAmount) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBettingInterface(false);
                    setSelectedSide(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    "flex-1 font-semibold",
                    selectedSide === "yes"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaceBet(marketId, selectedSide!, betAmount); // call on the index page
                    setShowBettingInterface(false);
                    setSelectedSide(null);
                  }}
                >
                  Place Bet
                </Button>
              </div>
            </div>
          )}

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                {marketData?.marketBalance} XTZ
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(
                  parseInt(marketData?.endTime) * 1000
                ).toLocaleDateString()}
              </div>
            </div>
            {!marketData?.resolved ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
        </div>
      </Card>
    );
  }
}