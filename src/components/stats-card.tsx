import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label?: string
    isPositive: boolean
  }
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("transition-all hover:border-primary/30", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5",
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "bg-red-500/10 text-red-500"
            )}>
              {trend.isPositive 
                ? <TrendingUp className="h-3 w-3" /> 
                : <TrendingDown className="h-3 w-3" />
              }
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
          )}
          {icon && (
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend?.isPositive ? "↗" : trend ? "↘" : ""} {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
