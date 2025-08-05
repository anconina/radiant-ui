import { Activity, Settings, Shield, Users } from 'lucide-react'

import { CanAccess, CanAccessAdmin } from '@/features/auth'

import { PERMISSIONS } from '@/shared/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function AdminDashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, settings, and system configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* User Management Card */}
        <CanAccess permissions={[PERMISSIONS.ADMIN_USERS]}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
        </CanAccess>

        {/* System Settings Card */}
        <CanAccess permissions={[PERMISSIONS.ADMIN_SETTINGS]}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">23 new in last hour</p>
            </CardContent>
          </Card>
        </CanAccess>

        {/* Security Card */}
        <CanAccessAdmin>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </CanAccessAdmin>

        {/* System Config Card */}
        <CanAccess permissions={[PERMISSIONS.SYSTEM_CONFIG]}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45.2K</div>
              <p className="text-xs text-muted-foreground">+4.5% from yesterday</p>
            </CardContent>
          </Card>
        </CanAccess>
      </div>

      {/* Admin Actions */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <CanAccess permissions={[PERMISSIONS.ADMIN_USERS]}>
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Add, edit, or remove users and manage their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  View All Users
                </button>
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  Add New User
                </button>
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  Manage Roles
                </button>
              </div>
            </CardContent>
          </Card>
        </CanAccess>

        <CanAccess permissions={[PERMISSIONS.SYSTEM_CONFIG]}>
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  General Settings
                </button>
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  Email Configuration
                </button>
                <button className="w-full px-3 py-2 rounded-md hover:bg-accent">
                  API Settings
                </button>
              </div>
            </CardContent>
          </Card>
        </CanAccess>
      </div>

      {/* Fallback for users without admin access */}
      <CanAccess
        roles={['admin']}
        fallback={
          <Card className="mt-8">
            <CardContent className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                You need admin privileges to view this content
              </p>
            </CardContent>
          </Card>
        }
      >
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Admin Only Section</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This content is only visible to administrators.</p>
          </CardContent>
        </Card>
      </CanAccess>
    </div>
  )
}
