import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      {/* Hero Section - Jazz puede modificar estilos */}
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        {/* Logo placeholder */}
        <div className="text-6xl">🧬</div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-emerald-400">Geno</span>
          <span className="text-white">mad</span>
        </h1>
        
        {/* Subtitle */}
        <p className="max-w-md text-lg text-zinc-400">
          Breed and evolve AI agents on Monad blockchain.
          Your DNA, your legacy.
        </p>
        
        {/* Login Button - Privy */}
        <div className="mt-4">
          <LoginButton />
        </div>
        
        {/* Stats placeholder */}
        <div className="mt-8 flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="text-sm text-zinc-500">Agents</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">0</p>
            <p className="text-sm text-zinc-500">Breedings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">Gen 0</p>
            <p className="text-sm text-zinc-500">Genesis</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-zinc-600">
        Built on Monad · Powered by genetics
      </footer>
    </div>
  );
}
