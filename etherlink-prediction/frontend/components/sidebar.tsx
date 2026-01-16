import { Home, TrendingUp, Trophy, DollarSign, Newspaper, Gamepad2, Cpu, Briefcase, Users } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const navigation = [
  { name: "Home", icon: Home, href: "#" },
  { name: "Markets", icon: TrendingUp, href: "#", active: true },
  { name: "Leaderboard", icon: Trophy, href: "#" },
  { name: "Earn", icon: DollarSign, href: "#" },
  { name: "News", icon: Newspaper, href: "#" },
]

const topics = [
  { name: "All", icon: "🌐", markets: "All Markets" },
  { name: "Crypto", icon: "₿", markets: "27 Markets" },
  { name: "Sports", icon: "⚽", markets: "15 Markets" },
  { name: "Politics", icon: "🏛️", markets: "8 Markets" },
  { name: "Economy", icon: "📈", markets: "12 Markets" },
  { name: "Gaming", icon: "🎮", markets: "6 Markets" },
  { name: "Culture", icon: "🎭", markets: "9 Markets" },
  { name: "Tech & Science", icon: "🔬", markets: "11 Markets" },
]

export function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">PredictXtz</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </a>
        ))}
      </nav>

      {/* Topics */}
      <div className="p-4 flex-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Topics
        </h3>
        <div className="space-y-1">
          {topics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onCategoryChange(topic.name)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left",
                selectedCategory === topic.name
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <span className="text-lg">{topic.icon}</span>
              <div className="flex-1">
                <div className="text-sm">{topic.name}</div>
                <div className="text-xs text-gray-500">{topic.markets}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
