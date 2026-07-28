import type { Tax } from '@/types/tax'

export const useTax = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const getAllTaxes = async (businessID: string, page: number, pageSize: number) => {
        try {
            const response = await $fetch<{data: Tax[], meta: any}>(`/api/business/taxes/${businessID}?page=${page}&page_size=${pageSize}`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response
        } catch (error: any) {
            return {
                data: [],
                meta: {
                    page: 1,
                    page_size: 10,
                    total: 0,
                    total_pages: 0
                }
            }
        }
    }

    const getAllTaxesList = async (businessID: string) => {
        try {
            // Retrieve all without pagination for dropdowns
            const response = await $fetch<{data: Tax[]}>(`/api/business/taxes/${businessID}/all`, {
                method: 'GET',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response.data
        } catch (error: any) {
            return []
        }
    }

    const createTax = async (tax: Tax) => {
        try {
            const response = await $fetch<Tax>(`/api/business/taxes`, {
                method: 'POST',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body: tax
            })
            return response
        } catch (error) {
            throw error
        }
    }

    const updateTax = async (tax: Tax) => {
        try {
            const response = await $fetch<Tax>(`/api/business/taxes/${tax.id}`, {
                method: 'PUT',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                },
                body: tax
            })
            return response
        } catch (error) {
            throw error
        }
    }

    const deleteTax = async (id: string) => {
        try {
            const response = await $fetch(`/api/business/taxes/${id}`, {
                method: 'DELETE',
                baseURL: baseUrl,
                headers: {
                    Authorization: `Bearer ${token.value?.toString().trim().replace('Bearer ', '')}`
                }
            })
            return response
        } catch (error) {
            throw error
        }
    }

    return {
        getAllTaxes,
        getAllTaxesList,
        createTax,
        updateTax,
        deleteTax
    }
}
