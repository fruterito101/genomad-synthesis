"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Activity } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button-shadcn"
import { cn } from "@/lib/utils"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({ config, children, className, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{
        ...Object.entries(config).reduce(
          (acc, [key, value]) => ({ ...acc, [`--color-${key}`]: value.color }),
          {}
        ),
      } as React.CSSProperties}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

interface ActivityChartProps {
  data?: Array<{ date: string; agents: number; breedings: number }>
  loading?: boolean
  className?: string
  defaultExpanded?: boolean
}

const defaultData = [
  { date: "Jan", agents: 12, breedings: 4 },
  { date: "Feb", agents: 25, breedings: 8 },
  { date: "Mar", agents: 38, breedings: 15 },
  { date: "Apr", agents: 52, breedings: 22 },
  { date: "May", agents: 68, breedings: 31 },
  { date: "Jun", agents: 85, breedings: 45 },
]

const chartConfig: ChartConfig = {
  agents: { label: "Agents", color: "hsl(var(--primary))" },
  breedings: { label: "Breedings", color: "hsl(var(--secondary))" },
}

export function ActivityChart({ 
  data = defaultData, 
  loading = false,
  className,
  defaultExpanded = true
}: ActivityChartProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px] bg-muted/50 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Platform Activity</CardTitle>
              <CardDescription className="text-xs">Agents and breedings over time</CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px]">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillAgents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-agents)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-agents)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillBreedings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-breedings)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-breedings)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickMargin={4}
                    width={30}
                  />
                  <Area
                    type="monotone"
                    dataKey="breedings"
                    stroke="var(--color-breedings)"
                    strokeWidth={2}
                    fill="url(#fillBreedings)"
                  />
                  <Area
                    type="monotone"
                    dataKey="agents"
                    stroke="var(--color-agents)"
                    strokeWidth={2}
                    fill="url(#fillAgents)"
                  />
                </AreaChart>
              </ChartContainer>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Agents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  <span className="text-xs text-muted-foreground">Breedings</span>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
