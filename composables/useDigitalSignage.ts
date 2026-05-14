import type { DigitalSignageContent, DigitalSignageSlide } from '@/types/digital_signage'
import type { Meta } from '@/types/common'

export const useDigitalSignage = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const createDigitalSignageContent = async (body: {
        business_id: string,
        file: File,
    }) => {
        const formData = new FormData()
        formData.append('business_id', body.business_id)
        formData.append('file', body.file)

        try {
            const res = await $fetch(`/api/digital-signage/add-content`, {
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

    const queryDigitalSignageContents = async (body: {
        business_id: string,
        content_type?: string,
        meta: Meta,
    }) => {
        const { digital_signage_contents, meta } = await $fetch<{ digital_signage_contents: DigitalSignageContent[], meta: Meta }>(`/api/digital-signage/get-content`, {
            baseURL: baseUrl,
            headers,
            method: 'POST',
            body: body
        })
        return { digital_signage_contents, meta }
    }

    const deleteDigitalSignageContent = async (contentId: string) => {
        try {
            await $fetch(`/api/digital-signage/delete-content/${contentId}`, {
            baseURL: baseUrl,
            headers,
            method: 'DELETE',
        })
        } catch (error) {
            throw error
        }
    }

    const queryDigitalSignageSlides = async (body: {
        business_id: string,
        search?: string,
    }) => {
        try {
            const { digital_signage_slides } = await $fetch<{ digital_signage_slides: DigitalSignageSlide[] }>(`/api/digital-signage/get-slides`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body
            })
            return digital_signage_slides
            
        } catch (error) {
            throw error
        }
    }

    const createDigitalSignageSlide = async (body: {
        business_id: string,
        title: string,
    }) => {
        try {
            const res = await $fetch(`/api/digital-signage/create-slide`, {
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

    const queryDigitalSignageSlide = async (slide_id: string) => {
        try {
            const digital_signage_slide = await $fetch<DigitalSignageSlide>(`/api/digital-signage/get-slide/${slide_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return digital_signage_slide
            
        } catch (error) {
            throw error
        }
    }

    const updateDigitalSignageSlide = async (body: DigitalSignageSlide) => {
        try {
            const res = await $fetch(`/api/digital-signage/update-slide`, {
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

    const deleteDigitalSignageSlideItem = async (slide_item_id: string) => {
        try {
            await $fetch(`/api/digital-signage/delete-slide-item/${slide_item_id}`, {
            baseURL: baseUrl,
            headers,
            method: 'DELETE',
        })
        } catch (error) {
            throw error
        }
    }

    const deleteDigitalSignageSlide = async (slide_id: string) => {
        try {
            await $fetch(`/api/digital-signage/delete-slide/${slide_id}`, {
            baseURL: baseUrl,
            headers,
            method: 'DELETE',
        })
        } catch (error) {
            throw error
        }
    }

    const loginDigitalSignage = async (body: {
        device_id: string,
        email: string,
        password: string,
    }) => {
        try {
            const res = await $fetch(`/api/digital-signage/login`, {
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
        createDigitalSignageContent,
        queryDigitalSignageContents,
        deleteDigitalSignageContent,
        queryDigitalSignageSlides,
        createDigitalSignageSlide,
        queryDigitalSignageSlide,
        updateDigitalSignageSlide,
        deleteDigitalSignageSlideItem,
        deleteDigitalSignageSlide,
        loginDigitalSignage,
    }
}