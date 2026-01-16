"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X } from 'lucide-react'
import { Market } from "@/types/market"
import { cn } from "@/lib/utils"

interface TradingModalProps {
  market: Market
  side: 'yes' | 'no'
  onClose: () => void
  onConfirmTrade: (market: Market, side: 'yes' | 'no', amount: number) => void
}

export function TradingModal({ market, side, onClose, onConfirmTrade }: TradingModalProps) {
  const [amount, setAmount] = useState(10)
  const [sliderValue, setSliderValue] = useState([10])

  const price = side === 'yes' ? market.yesPrice : market.noPrice
  const shares = amount / price
  const potentialWin = shares * 1 // Each share pays $1 if correct
  const profit = potentialWin - amount

  useEffect(() => {
    setAmount(sliderValue[0])
  }, [sliderValue])

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount)
    setSliderValue([newAmount])
  }

  const handleConfirm = () => {
    onConfirmTrade(market, side, amount)
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md p-0 rounded-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={market.image || "/placeholder.svg"} 
                alt={market.title}
                className="w-10 h-10 rounded-lg"
              />
              <h2 className="text-lg font-semibold text-white">
                {market.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Amount Selection */}
          <div className="mb-6">
            <div className="bg-slate-700 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold">${amount}</div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                    onClick={() => handleAmountChange(Math.max(1, amount + 1))}
                  >
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                    onClick={() => handleAmountChange(amount + 10)}
                  >
                    +10
                  </Button>
                </div>
              </div>
              
              {/* Slider */}
              <div className="px-2">
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={1000}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <Button
            onClick={handleConfirm}
            className={cn(
              "w-full h-16 text-xl font-bold rounded-xl transition-all",
              side === 'yes'
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            )}
          >
            <div className="flex flex-col items-center">
              <span>Buy {side === 'yes' ? 'Yes' : 'No'}</span>
              <span className="text-sm opacity-90">
                To win ${potentialWin.toFixed(2)}
              </span>
            </div>
          </Button>

          {/* Trade Details */}
          <div className="mt-4 space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Shares</span>
              <span className="text-white">{shares.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Price per share</span>
              <span className="text-white">${price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Potential profit</span>
              <span className={cn(
                "font-semibold",
                profit > 0 ? "text-green-400" : "text-red-400"
              )}>
                ${profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
