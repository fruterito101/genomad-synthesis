// src/components/onboarding/OnboardingStepper.tsx
// Step-by-step onboarding wizard

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, Bot, Zap, Check, ArrowRight, ArrowLeft, 
  Copy, ExternalLink, Loader2, CheckCircle2, Circle
} from "lucide-react";
import { Button } from "@/components/ui/button-shadcn";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";

interface Step {
  id: string;
  title: string;
  description: string;
  icon: typeof Wallet;
  isCompleted: boolean;
  isActive: boolean;
}

interface OnboardingStepperProps {
  onComplete: () => void;
  currentStep?: number;
}

export function OnboardingStepper({ onComplete, currentStep = 0 }: OnboardingStepperProps) {
  const { login, authenticated, user } = usePrivy();
  const [activeStep, setActiveStep] = useState(currentStep);
  const [isLoading, setIsLoading] = useState(false);

  const steps: Step[] = [
    {
      id: "connect",
      title: "Conecta tu Wallet",
      description: "Usa tu wallet favorita para acceder a Genomad",
      icon: Wallet,
      isCompleted: authenticated,
      isActive: activeStep === 0,
    },
    {
      id: "link",
      title: "Vincula tu Agente",
      description: "Conecta tu bot de Telegram o crea uno nuevo",
      icon: Bot,
      isCompleted: false, // Will be dynamic
      isActive: activeStep === 1,
    },
    {
      id: "activate",
      title: "Activa On-Chain",
      description: "Mint tu agente como NFT en Base",
      icon: Zap,
      isCompleted: false,
      isActive: activeStep === 2,
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await login();
      setTimeout(() => {
        setActiveStep(1);
        setIsLoading(false);
      }, 1000);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < activeStep || step.isCompleted;
            const isActive = index === activeStep;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted 
                        ? "hsl(var(--primary))" 
                        : isActive 
                          ? "hsl(var(--primary))" 
                          : "hsl(var(--muted))",
                    }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      isActive && "ring-4 ring-primary/20"
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="h-6 w-6 text-primary-foreground" />
                    ) : (
                      <Icon className={cn(
                        "h-6 w-6",
                        isActive || isCompleted ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-xs mt-2 font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-muted relative">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: index < activeStep ? "100%" : "0%" }}
                      className="absolute inset-0 bg-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]"
          >
            {activeStep === 0 && (
              <StepConnectWallet 
                onConnect={handleConnectWallet} 
                isConnected={authenticated}
                isLoading={isLoading}
                userAddress={user?.wallet?.address}
              />
            )}
            {activeStep === 1 && (
              <StepLinkAgent onNext={handleNext} />
            )}
            {activeStep === 2 && (
              <StepActivate onComplete={onComplete} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={activeStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Atrás
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onComplete} className="gap-2">
              Finalizar
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Step 1: Connect Wallet
function StepConnectWallet({ 
  onConnect, 
  isConnected, 
  isLoading,
  userAddress 
}: { 
  onConnect: () => void; 
  isConnected: boolean;
  isLoading: boolean;
  userAddress?: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Conecta tu Wallet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Usa MetaMask, WalletConnect o cualquier wallet compatible para comenzar.
      </p>

      {isConnected ? (
        <div className="flex items-center justify-center gap-2 text-green-500">
          <CheckCircle2 className="h-5 w-5" />
          <span>Conectado: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</span>
        </div>
      ) : (
        <Button onClick={onConnect} size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Conectar Wallet
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// Step 2: Link Agent
function StepLinkAgent({ onNext }: { onNext: () => void }) {
  const [linkCode, setLinkCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLinkCode(code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Bot className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Vincula tu Agente AI</h3>
        <p className="text-muted-foreground text-sm">
          Conecta tu bot de Telegram existente o crea uno nuevo
        </p>
      </div>

      <div className="space-y-4">
        {/* Option 1: Generate link code */}
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2">Opción 1: Código de vinculación</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Genera un código y úsalo en tu bot con /genomad-register
          </p>
          
          {linkCode ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-muted rounded-lg font-mono text-lg text-center">
                {linkCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <Button onClick={generateCode} variant="outline" className="w-full">
              Generar Código
            </Button>
          )}
        </div>

        {/* Option 2: Create new bot */}
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-2">Opción 2: Crear nuevo agente</h4>
          <p className="text-sm text-muted-foreground mb-3">
            No tienes un bot? Crea uno con BotFather
          </p>
          <Button variant="outline" className="w-full gap-2" asChild>
            <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">
              Abrir BotFather <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Skip option */}
        <p className="text-center text-sm text-muted-foreground">
          Puedes vincular tu agente más tarde desde tu perfil
        </p>
      </div>
    </div>
  );
}

// Step 3: Activate On-Chain
function StepActivate({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/10 flex items-center justify-center">
        <Zap className="h-10 w-10 text-orange-500" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Activa tu Agente On-Chain</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Convierte tu agente en un NFT en Base blockchain. Esto requiere una pequeña cantidad de MON para gas.
      </p>

      <div className="space-y-3 max-w-sm mx-auto text-left mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <span className="text-sm">DNA verificable on-chain</span>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <span className="text-sm">Participa en breeding con otros agentes</span>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <span className="text-sm">Aparece en el leaderboard</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" className="gap-2">
          <Zap className="h-4 w-4" />
          Activar Agente
        </Button>
        <button 
          onClick={onComplete}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Lo haré después
        </button>
      </div>
    </div>
  );
}

export default OnboardingStepper;
