export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server side to prevent SSR issues
  if (process.server) return

  const { token, getSession } = useAuth()

  // If on login page and has token, redirect to dashboard
  if (to.path === '/login' && token.value) {
    return navigateTo('/business')
  }

  if (to.path === '/digital-signage/login') {
    return
  }

  if (to.path === '/order/invoice') {
    return
  }

  // If token exists, verify session first
  if (token.value) {
    try {
      await getSession()
      // After successful session check, if on login page redirect to dashboard
      if (to.path === '/login') {
        return navigateTo('/business')
      }

      return 
    } catch (error) {
      // If session is invalid, clear token and redirect to login
      // token.value = null
      return navigateTo('/login')
    }
  }

  // No token, redirect to login if not already there
  if (to.path !== '/login') {
    return navigateTo('/login')
  }
})