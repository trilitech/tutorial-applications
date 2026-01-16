"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, TrendingUp, TrendingDown, Clock, DollarSign, Users } from 'lucide-react'
import { Market } from "@/types/market"
import { cn } from "@/lib/utils"

interface MarketModalProps {
  market: Market
  onClose: () => void
}

export function MarketModal({ market, onClose }: MarketModalProps) {
  const [activeTab, setActiveTab] = useState("buy")
  const [selectedSide, setSelectedSide] = useState<"yes" | "no" | null>(null)
  const [amount, setAmount] = useState("")

  const isPositiveChange = market.change >= 0

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={market.image || "/placeholder.svg"} 
                alt={market.title}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {market.title}
                </DialogTitle>
                <p className="text-gray-400 text-sm mt-1">{market.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Market Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{market.probability}%</span>
                <div className={cn(
                  "flex items-center text-sm",
                  isPositiveChange ? "text-green-400" : "text-red-400"
                )}>
                  {isPositiveChange ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(market.change)}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">Current Probability</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-blue-400" />
                <span className="text-xl font-bold">{market.volume}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">24h Volume</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-purple-400" />
                <span className="text-xl font-bold">{market.endDate}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Ends</p>
            </div>
          </div>

          {/* Probability Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>YES {market.probability}%</span>
              <span>NO {100 - market.probability}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-pink-500"
                style={{ width: `${market.probability}%` }}
              />
            </div>
          </div>

          {/* Trading Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="buy" className="data-[state=active]:bg-blue-600">
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-gray-700">
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-3">Pick a side</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={selectedSide === "yes" ? "default" : "outline"}
                    className={cn(
                      "h-12 text-lg font-semibold",
                      selectedSide === "yes"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                    )}
                    onClick={() => setSelectedSide("yes")}
                  >
                    YES
                  </Button>
                  <Button
                    variant={selectedSide === "no" ? "default" : "outline"}
                    className={cn(
                      "h-12 text-lg font-semibold",
                      selectedSide === "no"
                        ? "bg-pink-600 hover:bg-pink-700 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    )}
                    onClick={() => setSelectedSide("no")}
                  >
                    NO
                  </Button>
                </div>
              </div>

              {selectedSide && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Amount (USDC)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price per share</span>
                      <span className="text-white">
                        ${selectedSide === "yes" ? market.yesPrice.toFixed(2) : market.noPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shares</span>
                      <span className="text-white">
                        {amount ? (parseFloat(amount) / (selectedSide === "yes" ? market.yesPrice : market.noPrice)).toFixed(2) : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Potential return</span>
                      <span className="text-green-400">
                        ${amount ? (parseFloat(amount) / (selectedSide === "yes" ? market.yesPrice : market.noPrice)).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    Buy {selectedSide.toUpperCase()} shares
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sell" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-400">You don't own any shares in this market</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("buy")}>
                  Buy shares first
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
