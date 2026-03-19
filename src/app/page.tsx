import { LoginButton } from "@/components/LoginButton";

export default function Home() {
  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center text-white"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Hero Section */}
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        {/* Logo placeholder */}
        <div className="text-6xl animate-float">🧬</div>
        
        {/* Title with gradient */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="gradient-text">Geno</span>
          <span className="text-white">mad</span>
        </h1>
        
        {/* Subtitle */}
        <p 
          className="max-w-md text-lg"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Breed and evolve AI agents on Monad blockchain.
          Your DNA, your legacy.
        </p>
        
        {/* Login Button - Privy */}
        <div className="mt-4">
          <LoginButton />
        </div>
        
        {/* Stats */}
        <div className="mt-8 flex gap-8 text-center">
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-secondary)' }}
            >0</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Agents</p>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >0</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Breedings</p>
          </div>
          <div>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-accent-1)' }}
            >Gen 0</p>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">Genesis</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer 
        className="absolute bottom-4 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Built on Monad · Powered by genetics
      </footer>
    </div>
  );
}
