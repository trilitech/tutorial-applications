import { MarketCard } from "@/components/market-card";
import ResolveMarkets from "@/components/resolve-markets";

interface MarketGridProps {
  existingMarketIds: number[];
  handlePlaceBet: (
    marketId: number,
    side: "yes" | "no",
    betAmount: number
  ) => void;
  claimWinnings: (marketId: number) => void;
  resolveMarket: (marketId: number, winner: string) => void;
}
export function MarketGrid({
  existingMarketIds,
  handlePlaceBet,
  claimWinnings,
  resolveMarket,
}: MarketGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {existingMarketIds.map((marketId) => (
        <div key={marketId}>
          <MarketCard
            marketId={marketId}
            key={marketId}
            handlePlaceBet={handlePlaceBet}
          />

          <div className="mt-4">
            <ResolveMarkets
              key={marketId}
              marketId={marketId}
              claimWinnings={claimWinnings}
              resolveMarket={resolveMarket}
            />
          </div>
        </div>
      ))}
    </div>
  );
}