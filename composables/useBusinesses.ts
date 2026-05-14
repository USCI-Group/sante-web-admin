import type { Business, BusinessConfiguration } from '~/types/business'
import type { Meta, Option } from '~/types/common'

export const useBusinesses = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const getBusinessesOptions = async () => {
        try {
            const { data } = await $fetch<{ data: Option[] }>('/api/admin/business/options', {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return data
            
        } catch (error) {
            throw error
        }
    }

    const getBusinesses = async (body: { page: number, pageSize: number }) => {
        try {
            const res = await $fetch<{ data: Business[], meta: Meta }>('/api/admin/business/get-all', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: {
                    page: body.page,
                    page_size: body.pageSize,
                }
            })
            return res
        } catch (error) {
            // empty meta
            const meta: Meta = {
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 1
            }
            console.error('Error fetching users:', error)
            return { data: [], meta }
        }
    }
    
    const getBusiness = async (id: string) => {
        try {
            const res = await $fetch<Business>(`/api/admin/business/get/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
                query: { id }
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const createBusiness = async (business: Business) => {
        try {
            const res = await $fetch<Business>('/api/admin/business/create', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: business
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const updateBusiness = async (business: Business) => {
        try {
            const res = await $fetch<Business>('/api/admin/business/update', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: business
            })

            return res
        } catch (error) {
            throw error
        }
    }

    const deleteBusiness = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/business/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
        } catch (error) {
            throw error
        }
    }

    const uploadBusinessLogo = async (id: string, file: File) => {
        try {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('file', file)

            const res = await $fetch(`/api/admin/business/upload/logo`, {
                baseURL: baseUrl,
                headers: {
                    'Authorization': `${token.value}`,
                },
                method: 'POST', 
                body: formData
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getBusinessConfiguration = async (businessId: string) => {
        try {
            const res = await $fetch<BusinessConfiguration>(`/api/admin/business/configuration/get/${businessId}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const saveBusinessConfiguration = async (businessConfiguration: BusinessConfiguration) => {
        try {
            const res = await $fetch<BusinessConfiguration>(`/api/admin/business/configuration/save`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: businessConfiguration
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const saveTnC = async (body: { business_id: string, terms_of_service: string }) => {
        try {
            const res = await $fetch(`/api/admin/business/configuration/tnc/save`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const savePrivacyPolicy = async (body: { business_id: string, privacy_policy: string }) => {
        try {
            const res = await $fetch(`/api/admin/business/configuration/privacy-policy/save`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        getBusinesses,
        getBusinessesOptions,
        getBusiness,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        uploadBusinessLogo,
        getBusinessConfiguration,
        saveBusinessConfiguration,
        saveTnC,
        savePrivacyPolicy
    }
}