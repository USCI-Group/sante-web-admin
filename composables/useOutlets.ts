import type { Option, Meta } from '~/types/common'
import type { Outlet, MerchantSecret, OutletGroup } from '~/types/outlet'

export const useOutlets = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
        'Content-Type': 'application/json'
    }
    
    const getOutletsOptions = async (businessId: string) => {
        try {
            const { data } = await $fetch<{ data: Option[] }>(`/api/admin/outlet/options/${businessId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return data
            
        } catch (error) {
            throw error
        }
    }

    const createOutlet = async (outlet: Outlet) => {
        try {
            const res = await $fetch<Outlet>(`/api/admin/outlet/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST', 
                body: outlet
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateOutlet = async (outlet: Outlet) => {
        try {
            await $fetch<{ data: Outlet }>(`/api/admin/outlet/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',  
                body: outlet
            })
        } catch (error) {
            throw error
        }
    }

    const getOutlets = async (body: { page: number, page_size: number, business_id: string, filter?: { search?: string } }) => {
        try {
            const res = await $fetch<{ data: Outlet[], meta: Meta }>(`/api/admin/outlet/get-all`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })
            return res
        } catch (error) {
            return { data: [], meta: { total: 0, page: 1, page_size: 10, total_pages: 1 } }
        }
    }

    const deleteOutlet = async (outletId: string) => {
        try {
            await $fetch(`/api/admin/outlet/delete/${outletId}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
        } catch (error) {
            throw error
        }
    }

    const getOutlet = async (outletId: string) => {
        try {
            const res = await $fetch<Outlet>(`/api/admin/outlet/get/${outletId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const uploadOutletImage = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/admin/outlet/upload/image`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const uploadOutletDuitnowQr = async (id: string, file: File) => {
        try{
            const formData = new FormData()
            formData.append('outlet_id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/admin/outlet/upload-static-qr`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getOutletSecrets = async (outletId: string) => {
        try {
            const res = await $fetch<MerchantSecret>(`/api/admin/outlet/merchant-secrets/${outletId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'   
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateOutletSecrets = async (secrets: MerchantSecret) => {
        try {
            await $fetch<MerchantSecret>(`/api/admin/outlet/merchant-secrets/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: secrets
            })
        } catch (error) {
            throw error
        }
    }

    const getSelfServeJourneyURL = async (outletId: string) => {
        try {
            const res = await $fetch<{ activationUrl: string }>(`/api/internal-grabfood/self-serve-journey/${outletId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res.activationUrl

        } catch (error) {
            throw error
        }
    }

    const createOutletGroup = async (outletGroup: OutletGroup) => {
        try {
            await $fetch<OutletGroup>(`/api/admin/outlet/outlet-group/create`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: outletGroup
            })
        } catch (error) {
            throw error
        }
    }

    const getOutletGroups = async (businessId: string) => {
        try {
            const res = await $fetch<{ outlet_groups: OutletGroup[] }>(`/api/admin/outlet/outlet-group/get/${businessId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getOutletGroupsByUserId = async (user_id: string) => {
        try {
            const res = await $fetch<{ outlet_groups: OutletGroup[], outlet_options: Option[] }>(`/api/admin/outlet/outlet-group/get-by-user/${user_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateOutletGroup = async (outletGroup: OutletGroup) => {
        try {
            await $fetch<OutletGroup>(`/api/admin/outlet/outlet-group/update`, {
                baseURL: baseUrl,
                headers,
                method: 'PUT',
                body: outletGroup
            })
        } catch (error) {
            throw error
        }
    }

    const assignOutletToGroup = async (outletGroupId: string, outletId: string) => {
        try {
            await $fetch(`/api/admin/outlet/outlet-group/assign-outlet`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { outlet_group_id: outletGroupId, outlet_id: outletId }
            })
        } catch (error) {
            throw error
        }
    }

    const unassignOutletFromGroup = async (outletGroupId: string, outletId: string) => {
        try {
            await $fetch(`/api/admin/outlet/outlet-group/unassign-outlet`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { outlet_group_id: outletGroupId, outlet_id: outletId }
            })
        } catch (error) {
            throw error
        }
    }

    const assignUserToOutletGroup = async (outletGroupId: string, userId: string) => {
        try {
            await $fetch(`/api/admin/outlet/outlet-group/assign-user`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { outlet_group_id: outletGroupId, user_id: userId }
            })
        } catch (error) {
            throw error
        }
    }

    const unassignUserFromOutletGroup = async (outletGroupId: string, userId: string) => {
        try {
            await $fetch(`/api/admin/outlet/outlet-group/unassign-user`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { outlet_group_id: outletGroupId, user_id: userId }
            })
        } catch (error) {
            throw error
        }
    }

    const deleteOutletGroup = async (outletGroupId: string) => {
        try {
            await $fetch(`/api/admin/outlet/outlet-group/delete/${outletGroupId}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
        } catch (error) {
            throw error
        }
    }

    const updateOutletStoreId = async (merchantSecret: MerchantSecret) => {
        try {
            const res = await $fetch<MerchantSecret>(`/api/admin/outlet/merchant-secrets/bind-platform-id`, {
                baseURL: baseUrl,
                headers,
                method: 'PUT',
                body: merchantSecret
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        getOutletsOptions,
        createOutlet,
        updateOutlet,
        getOutlets,
        deleteOutlet,
        getOutlet,
        uploadOutletImage,
        getOutletSecrets,
        updateOutletSecrets,
        uploadOutletDuitnowQr,
        getSelfServeJourneyURL,
        createOutletGroup,
        getOutletGroups,
        updateOutletGroup,
        assignOutletToGroup,
        unassignOutletFromGroup,
        assignUserToOutletGroup,
        unassignUserFromOutletGroup,
        getOutletGroupsByUserId,
        deleteOutletGroup,
        updateOutletStoreId
    }
}