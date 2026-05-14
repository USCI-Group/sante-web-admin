import type { PushNotificationTemplate, PushNotificationTemplateListRequest, PushNotificationTemplateListResponse, PushNotificationTemplateRequest, PushNotificationTemplateResponse, SendNotificationRequest } from "~/types/campaign"

export const useCampaign = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const createTemplate = async (pushNotificationTemplateReq: PushNotificationTemplateRequest) => {
        try {
            const res = await $fetch<PushNotificationTemplateResponse>('/api/admin/business/campaign-push-notification/create-template', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: pushNotificationTemplateReq
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getTemplates = async (pushNotificationTemplateListReq: PushNotificationTemplateListRequest) => {
        try {
            const res = await $fetch<PushNotificationTemplateListResponse>('/api/admin/business/campaign-push-notification', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: pushNotificationTemplateListReq
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteTemplate = async (id: string) => {
        try {
            const res = await $fetch<PushNotificationTemplateResponse>(`/api/admin/business/campaign-push-notification/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getTemplateDetails = async (id: string) => {
        try {
            const res = await $fetch<PushNotificationTemplateResponse>(`/api/admin/business/campaign-push-notification/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateTemplate = async (id: string,data: PushNotificationTemplateRequest) => {
        try {
            const res = await $fetch<PushNotificationTemplateResponse>(`/api/admin/business/campaign-push-notification/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'PUT',
                body: data
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const sendNotification = async (data: SendNotificationRequest) => {
        try {
            const res = await $fetch<PushNotificationTemplateResponse>('/api/admin/business/campaign-push-notification/send-notification', {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: data
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        createTemplate,
        getTemplates,
        deleteTemplate,
        getTemplateDetails,
        updateTemplate,
        sendNotification,
    }
}