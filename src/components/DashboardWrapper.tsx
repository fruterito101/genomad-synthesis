"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Dna } from "lucide-react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

interface DashboardWrapperProps {
  children: React.ReactNode
  title?: string
}

export function DashboardWrapper({ children, title }: DashboardWrapperProps) {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Dna className="w-10 h-10 animate-pulse text-primary" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          {title && <h1 className="font-semibold">{title}</h1>}
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
