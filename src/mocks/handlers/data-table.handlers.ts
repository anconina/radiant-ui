// HttpResponse and http imports are not needed as we're re-exporting from users.handlers
// Config import also not needed for re-export

// This is already handled by users.handlers.ts which provides the /users endpoint
// The data table page uses the same endpoint, so we don't need separate handlers
// Just re-export the users handlers for consistency

export { usersHandlers as dataTableHandlers } from './users.handlers'
