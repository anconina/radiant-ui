import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Progress } from '@/shared/ui/progress'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { Slider } from '@/shared/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export function UIComponentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">UI Components</h1>
        <p className="text-muted-foreground">
          A collection of reusable UI components built with Radix UI and Tailwind CSS.
        </p>
      </div>

      {/* Component Showcase */}
      <Tabs defaultValue="buttons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Different button variants and sizes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>A basic card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is the card content area.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card with Badge</CardTitle>
                <CardDescription>Card featuring a status badge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge>New</Badge>
                <p>Card content with a badge indicator.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Info Alert</AlertTitle>
              <AlertDescription>This is an informational alert message.</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm font-medium">Progress Examples</p>
              <Progress value={33} className="w-full" />
              <Progress value={66} className="w-full" />
              <Progress value={100} className="w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Loading Skeletons</p>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avatar Examples</CardTitle>
                <CardDescription>Different avatar sizes and styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xs">
                      JD
                    </div>
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-sm">
                      AB
                    </div>
                  </Avatar>
                  <Avatar className="h-12 w-12">
                    <div className="flex h-full w-full items-center justify-center bg-accent text-accent-foreground">
                      CD
                    </div>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Separators & Sliders</CardTitle>
                <CardDescription>Visual dividers and input controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Section 1</p>
                  <Separator />
                  <p className="text-sm mt-2">Section 2</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Slider Control</p>
                  <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
