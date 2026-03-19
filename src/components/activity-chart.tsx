"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={
        {
          ...Object.entries(config).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [`--color-${key}`]: value.color,
            }),
            {}
          ),
        } as React.CSSProperties
      }
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    dataKey: string
    color: string
  }>
  label?: string
  config?: ChartConfig
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-background p-2 shadow-md">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-col gap-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {config?.[item.dataKey]?.label || item.name}:
            </span>
            <span className="font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Pre-configured Activity Chart for Genomad
interface ActivityChartProps {
  data?: Array<{
    date: string
    agents: number
    breedings: number
  }>
  loading?: boolean
  className?: string
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
  agents: {
    label: "Agents",
    color: "hsl(var(--primary))",
  },
  breedings: {
    label: "Breedings",
    color: "hsl(var(--secondary))",
  },
}

export function ActivityChart({ 
  data = defaultData, 
  loading = false,
  className 
}: ActivityChartProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/50 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Platform Activity</CardTitle>
        <CardDescription>Total agents and breedings over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickMargin={8}
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
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chartConfig.agents.color }} />
            <span className="text-sm text-muted-foreground">{chartConfig.agents.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chartConfig.breedings.color }} />
            <span className="text-sm text-muted-foreground">{chartConfig.breedings.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
