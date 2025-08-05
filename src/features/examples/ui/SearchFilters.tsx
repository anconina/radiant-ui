import { Search, X } from 'lucide-react'

import { useTableState } from '@/shared/lib/state'
import { useUrlArray, useUrlBoolean, useUrlString } from '@/shared/lib/state'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function SearchFilters() {
  // Individual URL state management
  const [category, setCategory] = useUrlString('category', '')
  const [tags, setTags] = useUrlArray<string>('tags', [])
  const [featured, setFeatured] = useUrlBoolean('featured', false)

  // Table state management (page, sort, search, etc.)
  const { state, setSearch, setFilter, clearFilters } = useTableState({
    defaultPageSize: 20,
    defaultSort: 'name',
    defaultOrder: 'asc',
  })

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search input with debounce */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          value={state.search}
          onChange={e => setSearch(e.target.value)}
          className="ps-10"
        />
      </div>

      {/* Category filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
        </select>
      </div>

      {/* Tags filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium block">Tags</label>
        <Input
          placeholder="Add tag and press Enter..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddTag(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-0.5 text-sm"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={e => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="featured" className="text-sm font-medium cursor-pointer">
          Featured only
        </label>
      </div>

      {/* Status filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Status</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={state.filters.status === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('status', state.filters.status === 'active' ? '' : 'active')}
          >
            Active
          </Button>
          <Button
            variant={state.filters.status === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setFilter('status', state.filters.status === 'inactive' ? '' : 'inactive')
            }
          >
            Inactive
          </Button>
          <Button
            variant={state.filters.status === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('status', state.filters.status === 'pending' ? '' : 'pending')}
          >
            Pending
          </Button>
        </div>
      </div>

      {/* Clear filters */}
      {(state.search ||
        category ||
        tags.length > 0 ||
        featured ||
        Object.keys(state.filters).length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch('')
            setCategory('')
            setTags([])
            setFeatured(false)
            clearFilters()
          }}
          className="text-muted-foreground"
        >
          Clear all filters
        </Button>
      )}

      {/* Current state display (for demo) */}
      <div className="rounded-lg bg-muted p-3 sm:p-4 text-sm min-w-0">
        <p className="font-medium mb-2">Current URL State:</p>
        <pre className="text-xs sm:text-sm overflow-x-auto w-full max-w-full">
          {JSON.stringify(
            {
              search: state.search,
              category,
              tags,
              featured,
              page: state.page,
              pageSize: state.pageSize,
              sort: state.sort,
              order: state.order,
              filters: state.filters,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}
