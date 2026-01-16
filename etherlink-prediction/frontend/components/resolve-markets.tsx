import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/lib/contract-utils";
import { toEther } from "thirdweb/utils";

interface ResolveMarketsProps {
  marketId: number;
  claimWinnings: (marketId: number) => void;
  resolveMarket: (marketId: number, winner:string) => void;
}

export default function ResolveMarkets({
  marketId,
  claimWinnings,
  resolveMarket,
}: ResolveMarketsProps) {
  const [selectedWinner, setSelectedWinner] = useState<"1" | "2" | "">("");
  const [isResolving, setIsResolving] = useState(false);

  // get Data about the market from the contract
  const { data: marketInfo, isLoading: isLoadingMarketInfo } = useReadContract({
    contract: contract,
    method: "getMarket",
    params: [BigInt(marketId)],
  });

  // Parse the market data using useMemo for performance and consistency
  const marketData = useMemo(() => {
    if (!marketInfo) {
      return undefined;
    }

    const typedMarketInfo = marketInfo as any;

    // Ensure all BigInts are handled correctly to prevent precision loss
    const totalYesAmount = typedMarketInfo.totalYesAmount as bigint;
    const totalNoAmount = typedMarketInfo.totalNoAmount as bigint;
    const totalYesShares = typedMarketInfo.totalYesShares as bigint;
    const totalNoShares = typedMarketInfo.totalNoShares as bigint;

    return {
      title: typedMarketInfo.question,
      endTime: typedMarketInfo.endTime.toString(),
      volume: Number(toEther(totalYesAmount + totalNoAmount)),
      resolved: typedMarketInfo.resolved,
      totalYesShares: totalYesShares,
      winner: typedMarketInfo.winner,
      totalNoShares: totalNoShares,
      image: "/penguin-mascot.png",
      marketBalance: toEther(typedMarketInfo.marketBalance)
    };
  }, [marketInfo]);


  if (isLoadingMarketInfo || !marketData) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-gray-800 hover:border-gray-700 transition-all">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={marketData.image || "/placeholder.svg"}
              alt={marketData.title}
              className="w-10 h-10 rounded-lg"
            />
            <Badge
              variant="secondary"
              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
            >
              Market #{marketId}
            </Badge>
            {marketData.resolved && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-medium mb-4 line-clamp-2">
          {marketData.title}
        </h3>

        {/* Resolution Interface */}
        {!marketData.resolved ? (
          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Market Resolution Required
              </span>
            </div>

            {/* Winner Selection */}
            <div className="space-y-2">
              <label className="text-gray-400 text-sm font-medium">
                Select Winning Side:
              </label>
              <Select value={selectedWinner} onValueChange={setSelectedWinner}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Choose the winning outcome" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem
                    value="1"
                    className="text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        YES
                      </Badge>
                      <span>Side 1 - YES wins</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="2"
                    className="text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        NO
                      </Badge>
                      <span>Side 2 - NO wins</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {selectedWinner && (
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-white">
                  Resolution Preview:
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Market ID:</span>
                  <span className="text-white">#{marketId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Winner:</span>
                  <Badge
                    className={
                      selectedWinner === "1"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    Side {selectedWinner} (
                    {selectedWinner === "1" ? "YES" : "NO"})
                  </Badge>
                </div>
              </div>
            )}

            {/* Resolve Button */}
            <Button
              onClick={()=> resolveMarket(marketId, selectedWinner)}
              disabled={!selectedWinner || isResolving}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
            >
              {isResolving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resolving Market...
                </div>
              ) : (
                "Resolve Market"
              )}
            </Button>

            {/* Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div className="text-xs text-yellow-400">
                  <strong>Warning:</strong> Market resolution is permanent and
                  cannot be undone. Verify the outcome before proceeding.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Market Resolved</span>
              </div>
              <div className="text-xs">
                Winning side: {marketData.winner === 1 ? "Yes" : "No"}
              </div>
            </div>
          </div>
        )}

        {/* Show resolved status */}
        {marketData?.resolved && (
          <Button
            onClick={() => claimWinnings(marketId)}
            variant="secondary"
            className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2"
          >
            Claim winnings
          </Button>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              {marketData.marketBalance} XTZ
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(
                parseInt(marketData.endTime) * 1000
              ).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}