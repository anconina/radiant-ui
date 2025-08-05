import { SearchFilters } from '@/features/examples'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function UrlStateDemoPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl min-w-0 overflow-hidden">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">URL State Management Demo</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          This demo shows how state is automatically synced with URL parameters. Try changing
          filters and notice how the URL updates. Refresh the page and see the state persist!
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>
              All filter states are automatically synced with URL parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <SearchFilters />
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Benefits of URL State</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none min-w-0">
            <ul className="space-y-2">
              <li>
                <strong>Shareable Links:</strong> Users can share URLs that preserve their current
                view
              </li>
              <li>
                <strong>Browser Navigation:</strong> Back/forward buttons work as expected
              </li>
              <li>
                <strong>Bookmarkable:</strong> Users can bookmark specific filtered views
              </li>
              <li>
                <strong>Refresh Safe:</strong> Page refreshes maintain the current state
              </li>
              <li>
                <strong>Analytics Friendly:</strong> Track which filters users apply most often
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Available Hooks</CardTitle>
            <CardDescription>
              Custom hooks for managing different types of URL state
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="space-y-4 min-w-0">
              <div className="min-w-0">
                <h4 className="font-medium mb-1">useUrlState</h4>
                <p className="text-sm text-muted-foreground">
                  Generic hook for any type of URL state with custom serialization
                </p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const [value, setValue] = useUrlState('key', defaultValue, {
  debounceMs: 300,
  removeEmpty: true,
  serialize: (v) => JSON.stringify(v),
  deserialize: (v) => JSON.parse(v)
})`}
                </pre>
              </div>

              <div className="min-w-0">
                <h4 className="font-medium mb-1">useUrlString</h4>
                <p className="text-sm text-muted-foreground">Specialized hook for string values</p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const [search, setSearch] = useUrlString('q', '', {
  debounceMs: 300
})`}
                </pre>
              </div>

              <div className="min-w-0">
                <h4 className="font-medium mb-1">useUrlNumber</h4>
                <p className="text-sm text-muted-foreground">Specialized hook for numeric values</p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const [page, setPage] = useUrlNumber('page', 1)`}
                </pre>
              </div>

              <div className="min-w-0">
                <h4 className="font-medium mb-1">useUrlBoolean</h4>
                <p className="text-sm text-muted-foreground">Specialized hook for boolean flags</p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const [showArchived, setShowArchived] = useUrlBoolean('archived', false)`}
                </pre>
              </div>

              <div className="min-w-0">
                <h4 className="font-medium mb-1">useUrlArray</h4>
                <p className="text-sm text-muted-foreground">Specialized hook for array values</p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const [tags, setTags] = useUrlArray('tags', [], {
  separator: ','
})`}
                </pre>
              </div>

              <div className="min-w-0">
                <h4 className="font-medium mb-1">useTableState</h4>
                <p className="text-sm text-muted-foreground">
                  Complete table state management including pagination, sorting, and filtering
                </p>
                <pre className="mt-2 p-3 bg-muted rounded text-xs sm:text-sm overflow-x-auto w-full max-w-full">
                  {`const {
  state,
  setPage,
  setPageSize,
  setSort,
  setSearch,
  setFilter,
  clearFilters
} = useTableState({
  defaultPageSize: 20,
  defaultSort: 'name'
})`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
