"use client";

import { useAuth } from "@/hooks/useAuth";

export function LoginButton() {
  const { 
    login, 
    logout,
    authenticated, 
    ready,
    isComplete, 
    telegramUsername, 
    walletAddress,
    hasTelegram,
    hasWallet
  } = useAuth();

  // Loading state
  if (!ready) {
    return (
      <button 
        disabled
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-800 px-6 text-white opacity-50"
      >
        Loading...
      </button>
    );
  }

  // Not logged in
  if (!authenticated) {
    return (
      <button 
        onClick={login}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-white font-medium transition-colors hover:bg-emerald-500"
      >
        🧬 Login with Telegram
      </button>
    );
  }

  // Logged in but no wallet
  if (!hasWallet) {
    return (
      <div className="flex flex-col items-center gap-3">
        {hasTelegram && (
          <p className="text-emerald-400">✅ @{telegramUsername}</p>
        )}
        <button 
          onClick={login}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-white font-medium transition-colors hover:bg-blue-500"
        >
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  // Fully connected
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-zinc-900 p-4">
      <div className="flex items-center gap-2 text-emerald-400">
        <span>✅</span>
        <span>@{telegramUsername}</span>
      </div>
      <div className="flex items-center gap-2 text-blue-400">
        <span>✅</span>
        <span>{walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
      </div>
      <button 
        onClick={logout}
        className="mt-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
