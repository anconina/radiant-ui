import { apiHandlers } from './handlers/api.handlers'
import { authHandlers } from './handlers/auth.handlers'
import { dashboardHandlers } from './handlers/dashboard.handlers'
import { dataTableHandlers } from './handlers/data-table.handlers'
import { miscHandlers } from './handlers/misc.handlers'
import { notificationHandlers } from './handlers/notification.handlers'
import { postHandlers } from './handlers/post.handlers'
import { profileHandlers } from './handlers/profile.handlers'
import { settingsHandlers } from './handlers/settings.handlers'
import { userHandlers } from './handlers/user.handlers'
import { usersHandlers } from './handlers/users.handlers'

// Combine all handlers
export const handlers = [
  ...apiHandlers,
  ...authHandlers,
  ...userHandlers,
  ...usersHandlers,
  ...profileHandlers,
  ...postHandlers,
  ...notificationHandlers,
  ...settingsHandlers,
  ...dashboardHandlers,
  ...dataTableHandlers,
  ...miscHandlers,
]
