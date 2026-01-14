import { MarketCard } from "@/components/market-card"
import { Market } from "@/types/market"

interface MarketGridProps {
  markets: Market[]
  onMarketClick: (market: Market) => void
  onTradeClick: (market: Market, side: 'yes' | 'no') => void
}

export function MarketGrid({ markets, onMarketClick, onTradeClick }: MarketGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {markets.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          onClick={() => onMarketClick(market)}
          onTradeClick={onTradeClick}
        />
      ))}
    </div>
  )
}
