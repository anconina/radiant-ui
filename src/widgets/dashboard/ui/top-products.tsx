import { cn } from '@/shared/lib/utils'
import { Progress } from '@/shared/ui/progress'

interface Product {
  id: string
  name: string
  sales: number
  revenue: string
  growth: number
}

interface TopProductsProps {
  products: Product[]
}

export function TopProducts({ products }: TopProductsProps) {
  const maxSales = Math.max(...products.map(p => p.sales))

  return (
    <div className="space-y-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={cn(
            'space-y-2 cursor-pointer',
            'transition-all hover:scale-[1.02]',
            'active:scale-[0.98]'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'bg-primary/10 text-primary text-sm font-medium'
                )}
              >
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.sales} sales</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{product.revenue}</p>
              <p
                className={cn(
                  'text-xs',
                  product.growth > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {product.growth > 0 ? '+' : ''}
                {product.growth}%
              </p>
            </div>
          </div>
          <Progress value={(product.sales / maxSales) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}
