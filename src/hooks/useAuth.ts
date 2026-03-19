"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

export function useAuth() {
  const { 
    login, 
    logout, 
    authenticated, 
    user, 
    ready 
  } = usePrivy();
  
  const { wallets } = useWallets();

  // Extract Telegram data
  const telegram = user?.telegram;
  const telegramId = telegram?.telegramUserId;
  const telegramUsername = telegram?.username;

  // Extract wallet
  const wallet = wallets[0];
  const walletAddress = wallet?.address;

  // Completion state
  const hasTelegram = !!telegramId;
  const hasWallet = !!walletAddress;
  const isComplete = hasTelegram && hasWallet;

  return {
    // Auth methods
    login,
    logout,
    
    // State
    authenticated,
    ready,
    isComplete,
    
    // Telegram
    telegramId,
    telegramUsername,
    hasTelegram,
    
    // Wallet
    wallet,
    walletAddress,
    hasWallet,
    
    // Raw user
    user,
  };
}
