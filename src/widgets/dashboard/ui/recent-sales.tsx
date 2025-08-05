import { cn } from '@/shared/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'

interface Sale {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  amount: string
  status: 'completed' | 'pending' | 'failed'
  date: string
}

interface RecentSalesProps {
  sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-4">
      {sales.map(sale => (
        <div
          key={sale.id}
          className={cn(
            'flex items-center gap-4 p-4 rounded-lg',
            'transition-colors hover:bg-muted/50',
            'cursor-pointer active:scale-[0.99]'
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={sale.customer.avatar} alt={sale.customer.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(sale.customer.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
              <div className="font-medium">{sale.amount}</div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
              <Badge variant={getStatusColor(sale.status)} className="text-xs">
                {sale.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
