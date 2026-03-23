// src/components/AgentChatButton.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";

interface Traits {
  technical: number;
  creativity: number;
  social: number;
  analysis: number;
  empathy: number;
  trading: number;
  teaching: number;
  leadership: number;
}

interface Agent {
  id: string;
  name: string;
  traits: Traits;
  tokenId?: string;
}

interface Message {
  role: "user" | "agent";
  content: string;
}

interface AgentChatButtonProps {
  agent: Agent;
  className?: string;
}

// Generate personality-based response
function generateResponse(agent: Agent, userMessage: string): string {
  const traits = agent.traits;
  const msg = userMessage.toLowerCase();
  
  // Dominant trait determines response style
  const dominant = Object.entries(traits).reduce((a, b) => 
    b[1] > a[1] ? b : a
  );
  
  const responses: Record<string, string[]> = {
    technical: [
      "Analyzing your query... From a technical perspective, I'd approach this systematically.",
      "Interesting problem! Let me break it down into components.",
      "The optimal solution involves several technical considerations.",
    ],
    creativity: [
      "Ooh, I love this! What if we tried something unconventional?",
      "Here's a creative twist on that idea...",
      "Let's think outside the box here!",
    ],
    social: [
      "Great question! I love connecting with you on this.",
      "Let's explore this together! What do you think about...",
      "I really appreciate you asking! Here's my take...",
    ],
    analysis: [
      "Let me analyze the data points here...",
      "Based on my analysis, there are several factors to consider.",
      "The logical conclusion would be...",
    ],
    empathy: [
      "I understand where you're coming from. Let me help.",
      "That's a thoughtful question. Here's what I feel...",
      "I sense this is important to you. Let me share my perspective.",
    ],
    trading: [
      "From a strategic standpoint, here's the play...",
      "Risk/reward analysis suggests...",
      "Market dynamics indicate...",
    ],
    teaching: [
      "Great question! Let me explain step by step.",
      "Here's how I'd teach this concept...",
      "The key thing to understand is...",
    ],
    leadership: [
      "Here's the direction I'd take on this.",
      "Let me guide you through this decision.",
      "The strategic move here would be...",
    ],
  };
  
  const dominantTrait = dominant[0] as keyof typeof responses;
  const traitResponses = responses[dominantTrait] || responses.social;
  const base = traitResponses[Math.floor(Math.random() * traitResponses.length)];
  
  // Add personalized touch
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hola")) {
    return `Hey there! I'm ${agent.name}. ${base}`;
  }
  
  if (msg.includes("breed") || msg.includes("offspring")) {
    return `Breeding is fascinating! My traits would combine with another agent to create unique offspring. ${base}`;
  }
  
  if (msg.includes("trait") || msg.includes("skill")) {
    const topTraits = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `My strongest traits are ${topTraits}. ${base}`;
  }
  
  return `${base} As ${agent.name}, my perspective is shaped by my unique traits. What else would you like to know?`;
}

export function AgentChatButton({ agent, className = "" }: AgentChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Only show if agent is on-chain
  if (!agent.tokenId) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
    
    const response = generateResponse(agent, userMessage);
    setMessages(prev => [...prev, { role: "agent", content: response }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Chat</span>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-zinc-400">Token #{agent.tokenId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation with {agent.name}</p>
                    <p className="text-sm mt-1">Ask about traits, breeding, or anything!</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-zinc-800 text-zinc-100 rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 px-4 py-2 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zinc-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder={`Message ${agent.name}...`}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-2 bg-primary rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors"
                  >
                    {isTyping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AgentChatButton;
