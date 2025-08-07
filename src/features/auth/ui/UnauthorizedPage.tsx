import { useNavigate } from 'react-router-dom'

import { ShieldOff } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldOff className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this resource</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            This page requires special permissions that your account doesn&apos;t have. If you believe
            this is an error, please contact your administrator.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button className="flex-1" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
