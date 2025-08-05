import { useState } from 'react'

import { useAsyncLoading, useGlobalLoading, useLoading } from '@/shared/stores'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { LoadingOverlay } from '@/shared/ui/loading-overlay'
import {
  IndeterminateProgress,
  MultiStepProgress,
  Progress,
  ProgressBar,
} from '@/shared/ui/progress'
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonBadge,
  SkeletonButton,
  SkeletonCard,
  SkeletonInput,
  SkeletonText,
} from '@/shared/ui/skeleton'

export default function LoadingSystemDemo() {
  const [progressValue, setProgressValue] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const { showLoading, hideLoading } = useGlobalLoading()

  // Example async operation
  const { execute: runAsyncOperation, isLoading: asyncLoading } = useAsyncLoading(
    'demo-async',
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      return 'Operation completed!'
    },
    {
      onSuccess: result => {
        console.log(result)
      },
      showProgress: true,
    }
  )

  // Simulate progress
  const simulateProgress = () => {
    setProgressValue(0)
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  // Simulate multi-step progress
  const simulateSteps = () => {
    setCurrentStep(1)
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 5) {
          clearInterval(interval)
          return 5
        }
        return prev + 1
      })
    }, 1000)
  }

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Loading System Demo</h1>

        {/* Skeleton Components */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Skeleton Components</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Basic Skeleton</p>
                <Skeleton className="h-12 w-full" />
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">Text Skeleton</p>
                <SkeletonText lines={3} />
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">Avatar Skeleton</p>
                <div className="flex gap-2">
                  <SkeletonAvatar size={40} />
                  <SkeletonAvatar size={60} />
                  <SkeletonAvatar size={80} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Button Skeleton</p>
                <div className="flex gap-2">
                  <SkeletonButton size="sm" />
                  <SkeletonButton />
                  <SkeletonButton size="lg" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">Input Skeleton</p>
                <SkeletonInput />
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">Badge Skeleton</p>
                <div className="flex gap-2">
                  <SkeletonBadge />
                  <SkeletonBadge />
                  <SkeletonBadge />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm text-muted-foreground">Card Skeleton</p>
            <SkeletonCard />
          </div>
        </Card>

        {/* Progress Components */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Progress Components</h2>

          <div className="space-y-6">
            <div>
              <Progress value={progressValue} showValue label="Basic Progress" />
              <Button onClick={simulateProgress} className="mt-2" size="sm">
                Simulate Progress
              </Button>
            </div>

            <div className="space-y-2">
              <Progress value={33} variant="success" label="Success Progress" />
              <Progress value={50} variant="warning" label="Warning Progress" />
              <Progress value={75} variant="destructive" label="Error Progress" />
              <Progress value={90} variant="info" label="Info Progress" />
            </div>

            <div className="space-y-2">
              <Progress value={60} size="xs" label="Extra Small" />
              <Progress value={60} size="sm" label="Small" />
              <Progress value={60} size="md" label="Medium" />
              <Progress value={60} size="lg" label="Large" />
            </div>

            <div>
              <Progress value={70} striped animated label="Striped Progress" />
            </div>

            <div>
              <IndeterminateProgress label="Loading..." />
            </div>

            <div>
              <ProgressBar value={150} max={300} showValue label="Custom Max Progress" />
            </div>

            <div>
              <MultiStepProgress
                steps={5}
                currentStep={currentStep}
                labels={['Start', 'Process', 'Review', 'Confirm', 'Complete']}
              />
              <Button onClick={simulateSteps} className="mt-2" size="sm">
                Simulate Steps
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading Overlay */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Loading Overlay</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <LoadingOverlay isLoading message="Loading content...">
              <Card className="h-32 p-4">
                <p>This content is behind a loading overlay</p>
              </Card>
            </LoadingOverlay>

            <LoadingOverlay isLoading size="sm" blur={false}>
              <Card className="h-32 p-4">
                <p>Small spinner, no blur</p>
              </Card>
            </LoadingOverlay>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => showLoading('Performing operation...')}>
              Show Global Loading
            </Button>
            <Button onClick={hideLoading} variant="outline">
              Hide Global Loading
            </Button>
          </div>
        </Card>

        {/* Async Operation Example */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Async Operation Example</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Example of using the loading store with async operations
          </p>

          <Button onClick={runAsyncOperation} disabled={asyncLoading}>
            {asyncLoading ? 'Processing...' : 'Run Async Operation'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
