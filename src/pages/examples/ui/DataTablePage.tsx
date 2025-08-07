import { useMemo, useState } from 'react'

import {
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'

import { useDataTableData } from '@/features/data-table'

import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Input } from '@/shared/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableHeader,
  ResponsiveTableRow,
} from '@/shared/ui/responsive-table'

type SortDirection = 'asc' | 'desc' | null
type SortField = 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'lastActive' | null

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  lastActive: string
}

export function DataTablePage() {
  const { data, loading, error } = useDataTableData()
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    role: true,
    department: true,
    status: true,
    createdAt: true,
    lastActive: true,
    actions: true,
  })

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!data?.users) return []

    const filtered = data.users.filter((user: User) => {
      // Global search
      if (globalFilter) {
        const searchTerm = globalFilter.toLowerCase()
        const matches =
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.role.toLowerCase().includes(searchTerm) ||
          user.department.toLowerCase().includes(searchTerm)

        if (!matches) return false
      }

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(user.status)) {
        return false
      }

      // Role filter
      if (roleFilter.length > 0 && !roleFilter.includes(user.role)) {
        return false
      }

      return true
    })

    // Sort
    if (sortField && sortDirection) {
      filtered.sort((a: User, b: User) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        if (sortField === 'createdAt' || sortField === 'lastActive') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, globalFilter, statusFilter, roleFilter, sortField, sortDirection])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedData.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(user => user.id)))
    } else {
      // Only remove items from current page
      const newSelected = new Set(selectedRows)
      paginatedData.forEach(user => newSelected.delete(user.id))
      setSelectedRows(newSelected)
    }
  }

  const handleSelectRow = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedRows(newSelected)
  }

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'inactive':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'default'
    }
  }

  const uniqueRoles = useMemo(() => {
    if (!data?.users) return []
    return Array.from(new Set(data.users.map((user: User) => user.role)))
  }, [data])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage your users and their account permissions</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Download className="me-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">Add User</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search and filters */}
            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute start-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className="ps-8"
                />
              </div>

              {/* Status filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="me-2 h-4 w-4" />
                    Status
                    {statusFilter.length > 0 && (
                      <Badge variant="secondary" className="ms-2 rounded-sm px-1">
                        {statusFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('active')}
                    onCheckedChange={checked => {
                      if (checked) {
                        setStatusFilter([...statusFilter, 'active'])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== 'active'))
                      }
                    }}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('inactive')}
                    onCheckedChange={checked => {
                      if (checked) {
                        setStatusFilter([...statusFilter, 'inactive'])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== 'inactive'))
                      }
                    }}
                  >
                    Inactive
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('pending')}
                    onCheckedChange={checked => {
                      if (checked) {
                        setStatusFilter([...statusFilter, 'pending'])
                      } else {
                        setStatusFilter(statusFilter.filter(s => s !== 'pending'))
                      }
                    }}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Role filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="me-2 h-4 w-4" />
                    Role
                    {roleFilter.length > 0 && (
                      <Badge variant="secondary" className="ms-2 rounded-sm px-1">
                        {roleFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel>Filter by role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {uniqueRoles.map(role => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={roleFilter.includes(role)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setRoleFilter([...roleFilter, role])
                        } else {
                          setRoleFilter(roleFilter.filter(r => r !== role))
                        }
                      }}
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Column visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Eye className="me-2 h-4 w-4" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={value}
                    onCheckedChange={checked => {
                      setVisibleColumns(prev => ({
                        ...prev,
                        [key]: checked,
                      }))
                    }}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable mobileLayout="cards">
            <ResponsiveTableHeader>
              <ResponsiveTableRow>
                <ResponsiveTableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every(user => selectedRows.has(user.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </ResponsiveTableHead>
                {visibleColumns.name && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('name')}
                    >
                      Name
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.email && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('email')}
                    >
                      Email
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.role && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('role')}
                    >
                      Role
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.department && <ResponsiveTableHead>Department</ResponsiveTableHead>}
                {visibleColumns.status && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.createdAt && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.lastActive && (
                  <ResponsiveTableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('lastActive')}
                    >
                      Last Active
                      <ArrowUpDown className="ms-2 h-4 w-4" />
                    </Button>
                  </ResponsiveTableHead>
                )}
                {visibleColumns.actions && (
                  <ResponsiveTableHead className="text-end">Actions</ResponsiveTableHead>
                )}
              </ResponsiveTableRow>
            </ResponsiveTableHeader>
            <ResponsiveTableBody>
              {loading ? (
                <ResponsiveTableRow>
                  <ResponsiveTableCell
                    colSpan={Object.values(visibleColumns).filter(v => v).length + 1}
                    className="text-center"
                  >
                    Loading...
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ) : paginatedData.length === 0 ? (
                <ResponsiveTableRow>
                  <ResponsiveTableCell
                    colSpan={Object.values(visibleColumns).filter(v => v).length + 1}
                    className="text-center"
                  >
                    No users found
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ) : (
                paginatedData.map(user => (
                  <ResponsiveTableRow
                    key={user.id}
                    data-state={selectedRows.has(user.id) && 'selected'}
                  >
                    <ResponsiveTableCell>
                      <Checkbox
                        checked={selectedRows.has(user.id)}
                        onCheckedChange={checked => handleSelectRow(user.id, checked as boolean)}
                      />
                    </ResponsiveTableCell>
                    {visibleColumns.name && (
                      <ResponsiveTableCell className="font-medium" mobileLabel="Name">
                        {user.name}
                      </ResponsiveTableCell>
                    )}
                    {visibleColumns.email && (
                      <ResponsiveTableCell mobileLabel="Email">{user.email}</ResponsiveTableCell>
                    )}
                    {visibleColumns.role && (
                      <ResponsiveTableCell mobileLabel="Role">{user.role}</ResponsiveTableCell>
                    )}
                    {visibleColumns.department && (
                      <ResponsiveTableCell mobileLabel="Department">
                        {user.department}
                      </ResponsiveTableCell>
                    )}
                    {visibleColumns.status && (
                      <ResponsiveTableCell mobileLabel="Status">
                        <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                      </ResponsiveTableCell>
                    )}
                    {visibleColumns.createdAt && (
                      <ResponsiveTableCell mobileLabel="Created">
                        {formatDate(user.createdAt)}
                      </ResponsiveTableCell>
                    )}
                    {visibleColumns.lastActive && (
                      <ResponsiveTableCell mobileLabel="Last Active">
                        {formatDate(user.lastActive)}
                      </ResponsiveTableCell>
                    )}
                    {visibleColumns.actions && (
                      <ResponsiveTableCell className="text-end" mobileLabel="Actions">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="me-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="me-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="me-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </ResponsiveTableCell>
                    )}
                  </ResponsiveTableRow>
                ))
              )}
            </ResponsiveTableBody>
          </ResponsiveTable>

          {/* Pagination */}
          <div className="flex flex-col gap-4 px-4 py-4 border-t md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-center md:flex-row md:items-center md:gap-4">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-16">
                      {pageSize}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {[10, 20, 30, 50, 100].map(size => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => {
                          setPageSize(size)
                          setCurrentPage(1)
                        }}
                      >
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedRows.size > 0 && <span>{selectedRows.size} row(s) selected • </span>}
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of{' '}
                {filteredAndSortedData.length} results
              </div>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={cn(
                      'cursor-pointer',
                      currentPage === 1 && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {(() => {
                  const pages = []
                  const maxVisible = 5
                  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                  const end = Math.min(totalPages, start + maxVisible - 1)

                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1)
                  }

                  if (start > 1) {
                    pages.push(
                      <PaginationItem key={1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )
                    if (start > 2) {
                      pages.push(
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }

                  return pages
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={cn(
                      'cursor-pointer',
                      currentPage === totalPages && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
