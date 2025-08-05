import { useState } from 'react'

import { useLoadingState } from '@/shared/lib/state'
import { AsyncButton } from '@/shared/ui/async-button'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { LoadingList, LoadingState } from '@/shared/ui/loading'
import { PageLoader, ProgressLoader } from '@/shared/ui/loading'
import { SkeletonCard } from '@/shared/ui/loading'
import { SkeletonForm } from '@/shared/ui/loading'
import { SkeletonList } from '@/shared/ui/loading'
import { SkeletonTable } from '@/shared/ui/loading'
import { Spinner, SpinnerOverlay } from '@/shared/ui/loading'
import { Skeleton } from '@/shared/ui/skeleton'

// Mock data
const mockItems = [
  { id: 1, name: 'Item 1', description: 'Description for item 1' },
  { id: 2, name: 'Item 2', description: 'Description for item 2' },
  { id: 3, name: 'Item 3', description: 'Description for item 3' },
]

export default function LoadingStatesDemo() {
  const [showProgress, setShowProgress] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [demoState, setDemoState] = useState<'loading' | 'error' | 'empty' | 'success'>('success')

  const listState = useLoadingState<typeof mockItems>({
    initialData: mockItems,
  })

  const simulateAsync = () => new Promise(resolve => setTimeout(resolve, 2000))

  const handleLoadData = async () => {
    await listState.execute(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(mockItems)
        }, 2000)
      })
    )
  }

  const handleLoadError = async () => {
    await listState
      .execute(
        new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Failed to load data'))
          }, 1000)
        })
      )
      .catch(() => {})
  }

  const handleLoadEmpty = async () => {
    await listState.execute(
      new Promise(resolve => {
        setTimeout(() => {
          resolve([])
        }, 1000)
      })
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <ProgressLoader isLoading={showProgress} />

      <div className="relative">
        {showOverlay && <SpinnerOverlay />}

        <div>
          <h1 className="text-3xl font-bold mb-2">Loading States & Skeleton Screens</h1>
          <p className="text-muted-foreground">
            Comprehensive loading state management with skeleton screens and spinners
          </p>
        </div>
      </div>

      {/* Skeleton Components */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Components</CardTitle>
          <CardDescription>Pre-built skeleton components for common UI patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Skeletons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Skeletons</h3>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          {/* Skeleton Card */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Card</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard showFooter lines={2} />
            </div>
          </div>

          {/* Skeleton Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Table</h3>
            <SkeletonTable rows={3} columns={4} />
          </div>

          {/* Skeleton Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton Form</h3>
            <div className="max-w-md">
              <SkeletonForm fields={3} />
            </div>
          </div>

          {/* Skeleton List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skeleton List</h3>
            <SkeletonList items={3} showAvatar />
          </div>
        </CardContent>
      </Card>

      {/* Spinner Components */}
      <Card>
        <CardHeader>
          <CardTitle>Spinner Components</CardTitle>
          <CardDescription>Various spinner sizes and overlay options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <Spinner size="sm" />
              <p className="text-sm text-muted-foreground mt-2">Small</p>
            </div>
            <div className="text-center">
              <Spinner size="md" />
              <p className="text-sm text-muted-foreground mt-2">Medium</p>
            </div>
            <div className="text-center">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground mt-2">Large</p>
            </div>
            <div className="text-center">
              <Spinner size="xl" />
              <p className="text-sm text-muted-foreground mt-2">Extra Large</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setShowOverlay(true)}>Show Overlay Spinner</Button>
            {showOverlay && (
              <Button variant="outline" onClick={() => setShowOverlay(false)}>
                Hide Overlay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State Wrapper */}
      <Card>
        <CardHeader>
          <CardTitle>Loading State Wrapper</CardTitle>
          <CardDescription>Handles loading, error, and empty states automatically</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setDemoState('loading')}>Show Loading</Button>
            <Button onClick={() => setDemoState('error')}>Show Error</Button>
            <Button onClick={() => setDemoState('empty')}>Show Empty</Button>
            <Button onClick={() => setDemoState('success')}>Show Success</Button>
          </div>

          <LoadingState
            isLoading={demoState === 'loading'}
            isError={demoState === 'error'}
            isEmpty={demoState === 'empty'}
            error={demoState === 'error' ? new Error('Something went wrong') : null}
          >
            <div className="p-8 bg-secondary rounded">
              <h3 className="text-lg font-medium mb-2">Success State</h3>
              <p>This content is shown when data loads successfully.</p>
            </div>
          </LoadingState>
        </CardContent>
      </Card>

      {/* Loading List */}
      <Card>
        <CardHeader>
          <CardTitle>Loading List Component</CardTitle>
          <CardDescription>List component with integrated loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleLoadData}>Load Data</Button>
            <Button onClick={handleLoadError}>Load with Error</Button>
            <Button onClick={handleLoadEmpty}>Load Empty</Button>
            <Button onClick={() => listState.reset()}>Reset</Button>
          </div>

          <LoadingList
            items={listState.data || []}
            isLoading={listState.isLoading}
            isError={listState.isError}
            error={listState.error}
            renderItem={item => (
              <div key={item.id} className="p-4 border rounded mb-2">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            )}
            loadingComponent={<SkeletonList items={3} />}
          />
        </CardContent>
      </Card>

      {/* Async Button */}
      <Card>
        <CardHeader>
          <CardTitle>Async Button</CardTitle>
          <CardDescription>Button with built-in loading and success states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <AsyncButton
              onClick={simulateAsync}
              loadingText="Saving..."
              successText="Saved!"
              errorText="Failed"
            >
              Save Changes
            </AsyncButton>

            <AsyncButton onClick={simulateAsync} variant="secondary">
              Process Data
            </AsyncButton>

            <AsyncButton
              onClick={async () => {
                await simulateAsync()
                throw new Error('Failed')
              }}
              variant="destructive"
              loadingText="Deleting..."
              errorText="Delete Failed"
            >
              Delete Item
            </AsyncButton>
          </div>
        </CardContent>
      </Card>

      {/* Page Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Page Loaders</CardTitle>
          <CardDescription>Full page and progress bar loaders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setShowProgress(true)}>Show Progress Bar</Button>
            {showProgress && (
              <Button variant="outline" onClick={() => setShowProgress(false)}>
                Hide Progress Bar
              </Button>
            )}
          </div>

          <div className="border rounded" style={{ height: 200 }}>
            <PageLoader text="Loading page content..." />
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
            {`// Skeleton Components
<Skeleton className="h-4 w-full" />
<SkeletonCard showFooter />
<SkeletonTable rows={5} columns={3} />
<SkeletonForm fields={4} />
<SkeletonList items={5} showAvatar />

// Spinner Components
<Spinner size="lg" />
<SpinnerOverlay show={isLoading} />

// Loading State Wrapper
<LoadingState
  isLoading={isLoading}
  isError={isError}
  isEmpty={data.length === 0}
  error={error}
>
  <YourContent />
</LoadingState>

// Async Button
<AsyncButton
  onClick={async () => await saveData()}
  loadingText="Saving..."
  successText="Saved!"
>
  Save Changes
</AsyncButton>

// Loading State Hook
const {
  data,
  isLoading,
  isError,
  error,
  execute,
  setSuccess,
  setError
} = useLoadingState({ initialData: [] })`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
