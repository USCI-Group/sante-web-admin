import type { Role } from '@/types/user'
import type { Option } from '@/types/common'
export const useRoles = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const getAllRoles = async () => {
        try {
            const response = await $fetch<{ data: Role[] }>(`/api/admin/role/get-all`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: {}
            })

            if (response?.data && Array.isArray(response.data)) {
                return response.data
            }

            return [] // Return empty array if no valid data
        } catch (error) {
            console.error('Error fetching roles:', error)
            return [] // Return empty array on error
        }
    }

    const getRole = async (id: string) => {
        try {
            const response = await $fetch<Role>(`/api/admin/role/get/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })

            if (response) {
                return response
            }

            return null // Return null if no valid data
        } catch (error) {
            return null // Return null on error
        }
    }

    const createRole = async (role: Role) => {
        if(role.business_id === ''){
            role.business_id = null
        }

        try {
            const data = await $fetch<any>(`/api/admin/role/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: role
            })

            return data
        } catch (error) {
            throw error
        }
    }

    const updateRole = async (role: Role) => {
        if(role.business_id === ''){
            role.business_id = null
        }
        
        try {
            const data = await $fetch<Role>(`/api/admin/role/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: role
            })

            return data
        } catch (error) {
            throw error
        }
    }

    const deleteRole = async (id: string, confirmation: string) => {
        try {
            const data = await $fetch<any>(`/api/admin/role/delete`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: {
                id,
                confirmation
            }
        })

            return data
        } catch (error) {
            throw error
        }
    }

    const getRoleOptions = async (businessId?: string) => {
        try {
            let body = {}
            if(businessId){
                body = {
                    business_id: businessId
                }
            }

            const response = await $fetch<{ data: Option[] }>(`/api/admin/role/options`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',  
                body
            })

            return response.data
        } catch (error) {
            throw error
        }
    }


    return {
        getAllRoles,
        getRole,
        createRole,
        updateRole,
        deleteRole,
        getRoleOptions
    }
}