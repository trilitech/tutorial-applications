"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MarketGrid } from "@/components/market-grid"
import { MarketModal } from "@/components/market-modal"
import { TradingModal } from "@/components/trading-modal"
import { Market } from "@/types/market"
import { ConnectButton } from "thirdweb/react";
import {client} from '../lib/providers'


const sampleMarkets: Market[] = [
  {
    id: "1",
    title: "Ethereum's new ATH by end of 2025?",
    category: "Crypto",
    probability: 58,
    change: 2,
    volume: "$50.1k",
    endDate: "Dec 31",
    image: "/ethereum-logo.png",
    yesPrice: 0.58,
    noPrice: 0.42,
    totalVolume: 4849,
    description: "Will Ethereum reach a new all-time high price by December 31, 2025?"
  },
  {
    id: "2",
    title: "Bitcoin's next hit: moon to $125K or dip to $105K?",
    category: "Crypto",
    probability: 54,
    change: 1,
    volume: "$72.5k",
    endDate: "Dec 31",
    image: "/bitcoin-logo.png",
    yesPrice: 0.54,
    noPrice: 0.46,
    totalVolume: 3540,
    description: "Will Bitcoin reach $125K before it drops to $105K?"
  },
]

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [tradingModal, setTradingModal] = useState<{
    market: Market
    side: 'yes' | 'no'
  } | null>(null)

  const filteredMarkets = selectedCategory === "All" 
    ? sampleMarkets 
    : sampleMarkets.filter(market => market.category === selectedCategory)

  const handleTradeClick = (market: Market, side: 'yes' | 'no') => {
    setTradingModal({ market, side })
  }

  const handleConfirmTrade = (market: Market, side: 'yes' | 'no', amount: number) => {
    // Handle the trade confirmation here
    console.log(`Trading ${amount} on ${side} for market: ${market.title}`)
    // You would typically send this to your backend/blockchain here
  }


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
              Trade on the outcomes of future events
            </p>
          </div>

          <div>
            <ConnectButton client={client} />
          </div>
        </div>

        <MarketGrid
          markets={filteredMarkets}
          onMarketClick={setSelectedMarket}
          onTradeClick={handleTradeClick}
        />
      </main>

      {selectedMarket && (
        <MarketModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
        />
      )}

      {tradingModal && (
        <TradingModal
          market={tradingModal.market}
          side={tradingModal.side}
          onClose={() => setTradingModal(null)}
          onConfirmTrade={handleConfirmTrade}
        />
      )}
    </div>
  );
}
