import type { User, Permission } from '@/types/user'
import type { Address, Option } from '@/types/common'
import type { Meta } from '@/types/common'

export const useUsers = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`, 
        'Content-Type': 'application/json'
    }

    const me = ref<User | null>(null)
    const myPermissions = ref<Permission[]>([])

    const getMe = async () => {
        try {
            const data = await $fetch<User>(`/api/me`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })

            me.value = data
            myPermissions.value = data.GroupRole.permissions
        } catch (error) {
            console.error('Error fetching user details:', error)
            return null
        }
    }

    const getUsers = async (
        body: { 
            page: number, 
            page_size: number, 
            filter?: { business_id?: string, outlet_id?: string, name?: string } }
        ) => {
        try {
            const res = await $fetch<{ data: User[], meta: Meta }>(`/api/admin/user/get-all`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',    
                body: body
            })

            return res
        } catch (error) {
            // empty meta
            const meta = {
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 1
            }
            console.error('Error fetching users:', error)
            return { data: [], meta }
        }
    }

    const createUser = async (body: {
        first_name: string
        surname: string
        email: string
        phone: string
        address?: Address
        identification_no?: string
        role_id: string
        business_id: string | null
        outlet_id: string | null
        password: string
        employee_no?: string
    }) => {
        console.log(body)
        try {
            if(!body.business_id){
                body.business_id = null
            }

            if(!body.outlet_id){
                body.outlet_id = null
            }

            const res = await $fetch<User>(`/api/admin/user/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const getUser = async (id: string) => {
        try {
            const res = await $fetch<User>(`/api/admin/user/get/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const updateUser = async (userForm: User, role_id?: string) => {
        try {
            const body: any = {
                ...userForm,
                business_id: !userForm.business_id ? null : userForm.business_id,
                outlet_id: !userForm.outlet_id ? null : userForm.outlet_id,
                role_id: role_id
            }

            const res = await $fetch<User>(`/api/user/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })  

            return res
        } catch (error) {
            throw error
        }
    }

    const deleteUser = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/user/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const isSantéAdmin = () => {
        return me.value?.GroupRole?.Role?.role_type === 'admin'
    }

    const isBusinessAdmin = () => {
        return !isSantéAdmin() && me.value?.business_id !== null && me.value?.outlet_id === null
    }

    const isOutletAdmin = () => {
        return !isSantéAdmin() && me.value?.outlet_id !== null
    }

    const checkPermission = (permission_name: string) => {
        const permission = myPermissions.value.find((p) => p.name === permission_name)
        return permission?.enabled
    }

    const getUsersWithOutletGroupRole = async (businessId: string) => {
        try {
            const { data } = await $fetch<{ data: Option[]}>(`/api/admin/user/get-with-outlet-group-role/${businessId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })  

            return data
        } catch (error) {
            throw error
        }
    }

    const generateVipCode = async (businessId: string) => {
        try {
            const res = await $fetch<{ code: string }>(`/api/admin/vip/generate-code`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { business_id: businessId }
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        me,
        myPermissions,
        getMe,
        getUsers,
        createUser,
        getUser,
        updateUser,
        deleteUser,
        isSantéAdmin,
        isBusinessAdmin,
        isOutletAdmin,
        checkPermission,
        getUsersWithOutletGroupRole,
        generateVipCode
    }
}
