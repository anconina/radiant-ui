import { AppRouter } from '@/app/routes'

import { useNotificationBridge } from '@/shared/lib/hooks/use-notification-bridge'

function App() {
  // Bridge app store notifications to toast system
  useNotificationBridge()

  return <AppRouter />
}

export default App
