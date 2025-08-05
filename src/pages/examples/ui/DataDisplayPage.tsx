import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function DataDisplayPage() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Display Components</h1>
        <p className="text-muted-foreground">
          Components for displaying structured data, tables, and information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tables */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Displaying tabular data with headers and rows</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Badges and Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Status</CardTitle>
            <CardDescription>Various badge styles for status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">User Avatars</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-xs">
                    JD
                  </div>
                </Avatar>
                <Avatar className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-sm">
                    JS
                  </div>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <div className="flex h-full w-full items-center justify-center bg-accent text-accent-foreground">
                    BJ
                  </div>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress & Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Progress & Statistics</CardTitle>
            <CardDescription>Visual representations of data and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span>65%</span>
              </div>
              <Progress value={65} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>80%</span>
              </div>
              <Progress value={80} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98.5%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Information Cards</CardTitle>
            <CardDescription>Structured content display with actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
                <Badge>Healthy</Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Backup</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active Users</p>
                  <p className="text-xs text-muted-foreground">Currently online</p>
                </div>
                <div className="text-sm font-medium">1,789</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List Display */}
        <Card>
          <CardHeader>
            <CardTitle>List Items</CardTitle>
            <CardDescription>Structured list display with metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: 'Project Alpha',
                  description: 'Web application development',
                  status: 'In Progress',
                },
                { title: 'Project Beta', description: 'Mobile app prototype', status: 'Completed' },
                { title: 'Project Gamma', description: 'API development', status: 'Planning' },
              ].map((project, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.description}</p>
                  </div>
                  <Badge
                    variant={
                      project.status === 'Completed'
                        ? 'secondary'
                        : project.status === 'In Progress'
                          ? 'default'
                          : 'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
