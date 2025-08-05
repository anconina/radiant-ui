import { HttpResponse, http } from 'msw'

import { config } from '@/shared/lib/environment'

// This is already handled by users.handlers.ts which provides the /users endpoint
// The data table page uses the same endpoint, so we don't need separate handlers
// Just re-export the users handlers for consistency

export { usersHandlers as dataTableHandlers } from './users.handlers'
