/**
 * 🧬 GENOMAD - Header Component
 * Base layout component for Jazz to customize
 */

export function Header() {
  return (
    <header className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧬</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            GENOMAD
          </span>
        </div>
        <nav className="flex items-center gap-6">
          {/* Jazz: Add navigation items here */}
          <a href="/agents" className="text-gray-400 hover:text-white transition">Agents</a>
          <a href="/breed" className="text-gray-400 hover:text-white transition">Breed</a>
          <a href="/marketplace" className="text-gray-400 hover:text-white transition">Marketplace</a>
        </nav>
        <div>
          {/* Jazz: Add wallet connect button here */}
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition">
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
