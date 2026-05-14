import type { PermissionPresetType } from '@/types/user'

export const usePermissions = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiUrl
  const { token } = useAuth()

  const headers = {
    'Authorization': `${token.value}`,
    'Content-Type': 'application/json'
  }

  const getPermissionPresets = async () => {
    try {
      const { permission_presets } = await $fetch<{ permission_presets: PermissionPresetType[] }>(`/api/admin/role/get-permission-preset`, {
        baseURL: baseUrl,
        headers,
        method: 'GET'
      })

      return permission_presets
      
    } catch (error) {
      throw error
    }
  }


  return {
    getPermissionPresets,
  }
}
