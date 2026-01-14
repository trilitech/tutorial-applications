import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { Market } from "@/types/market"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface MarketCardProps {
  market: Market
  onClick: () => void
  onTradeClick: (market: Market, side: 'yes' | 'no') => void
}

export function MarketCard({ market, onClick, onTradeClick }: MarketCardProps) {
  const [hoveredSide, setHoveredSide] = useState<'yes' | 'no' | null>(null)
  const isPositiveChange = market.change >= 0

  // Calculate potential returns (simplified calculation)
  const yesReturn = ((1 / market.yesPrice) * 100 - 100).toFixed(0)
  const noReturn = ((1 / market.noPrice) * 100 - 100).toFixed(0)

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer group">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4" onClick={onClick}>
          <div className="flex items-center space-x-2">
            <img 
              src={market.image || "/placeholder.svg"} 
              alt={market.title}
              className="w-10 h-10 rounded-lg"
            />
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              USDC
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{market.probability}%</div>
            <div className={cn(
              "flex items-center text-sm",
              isPositiveChange ? "text-green-400" : "text-red-400"
            )}>
              {isPositiveChange ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(market.change)}%
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-white font-medium mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors" onClick={onClick}>
          {market.title}
        </h3>

        {/* Probability Bar */}
        <div className="mb-4" onClick={onClick}>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{market.probability}%</span>
            <span>{100 - market.probability}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-pink-500 transition-all"
              style={{ width: `${market.probability}%` }}
            />
          </div>
        </div>

        {/* Action Buttons with Hover Effects */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button 
            variant="outline" 
            className={cn(
              "relative transition-all duration-200 font-semibold",
              hoveredSide === 'yes'
                ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25 scale-105"
                : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
            )}
            onMouseEnter={() => setHoveredSide('yes')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={(e) => {
              e.stopPropagation()
              onTradeClick(market, 'yes')
            }}
          >
            <div className="flex flex-col items-center">
              <span>YES</span>
              {hoveredSide === 'yes' && (
                <span className="text-xs opacity-90">+{yesReturn}%</span>
              )}
            </div>
          </Button>
          <Button 
            variant="outline" 
            className={cn(
              "relative transition-all duration-200 font-semibold",
              hoveredSide === 'no'
                ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/25 scale-105"
                : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            )}
            onMouseEnter={() => setHoveredSide('no')}
            onMouseLeave={() => setHoveredSide(null)}
            onClick={(e) => {
              e.stopPropagation()
              onTradeClick(market, 'no')
            }}
          >
            <div className="flex flex-col items-center">
              <span>NO</span>
              {hoveredSide === 'no' && (
                <span className="text-xs opacity-90">+{noReturn}%</span>
              )}
            </div>
          </Button>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500" onClick={onClick}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              {market.volume}
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {market.endDate}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
