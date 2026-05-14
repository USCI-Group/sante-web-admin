import type { Onboarding, Announcement, Delivery, FeedbackQuestion } from '@/types/communication';
import type { Meta } from '@/types/common';

export const useCommunication = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const queryOnboardingList = async (businessID: string) => {
        try {
            const { onboarding_list } = await $fetch<{ onboarding_list: Onboarding[] }>(`/api/admin/business/onboarding/get-all/${businessID}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return onboarding_list
        } catch (error) {
            throw error
        }
    }

    const queryOnboardingWithFilters = async (body: {
        business_id: string,
        search?: string,
    }) => {
        try {
            const { onboarding_list } = await $fetch<{ onboarding_list: Onboarding[] }>(`/api/admin/business/onboarding/get-with-filters`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })

            return onboarding_list
        } catch (error) {
            throw error
        }
    }   

    const createOnboarding = async (body: {
        business_id: string,
        title: string,
        description: string,
        is_active: boolean,
    }) => {
        try {
            const res = await $fetch<Onboarding>(`/api/admin/business/onboarding/create`, {
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

    const uploadOnboardingImage = async ({
        id,
        file,
        businessId
    }: {
        id: string,
        businessId: string
        file: File,
    }) => {
        try {
            const formData = new FormData()
            formData.append('onboarding_id', id)
            formData.append('business_id', businessId)
            formData.append('file', file)

            const res = await $fetch(`/api/admin/business/onboarding/upload-image`, {
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

    const updateOnboarding = async (onboarding: Onboarding) => {
        try {
            const res = await $fetch(`/api/admin/business/onboarding/update`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: onboarding
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const updateOnboardingMultiple = async (onboardings: Onboarding[]) => {
        try {
            const res = await $fetch(`/api/admin/business/onboarding/update-multiple`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: { 
                    onboarding_list: onboardings
                }
            })  
            return res
        } catch (error) {
            throw error
        }
    }

    const deleteOnboarding = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/business/onboarding/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryAnnouncementWithFilters = async (body: {
        business_id: string,
        search?: string,
        filter?: {
            is_active?: boolean,
        },
    }) => {
        try {
            const { announcement_list } = await $fetch<{ announcement_list: Announcement[] }>(`/api/admin/business/announcement/get-with-filters`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })

            return announcement_list
        } catch (error) {
            throw error
        }
    }  

    const createAnnouncement = async (body: {
        business_id: string,
        file: File,
        is_active: boolean,
        start_date: string,
        end_date: string,
        title: string,
        description: string,
    }) => {
        try {
            const formData = new FormData()
            formData.append('business_id', body.business_id)
            formData.append('file', body.file)
            formData.append('is_active', body.is_active.toString())
            formData.append('start_date', new Date(body.start_date).toISOString())
            formData.append('end_date', new Date(body.end_date).toISOString())
            formData.append('title', body.title)
            formData.append('description', body.description)

            const res = await $fetch(`/api/admin/business/announcement/create`, {
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

    const updateAnnouncement = async (body: {
        announcement_id: string,
        file?: File,
        is_active: boolean,
        start_date: string,
        end_date: string,
        title: string,
        description: string,
    }) => {
        try {
            const formData = new FormData()
            formData.append('id', body.announcement_id)
            if (body.file) {
                formData.append('file', body.file)
            }
            formData.append('is_active', body.is_active.toString())
            formData.append('start_date', new Date(body.start_date).toISOString())
            formData.append('end_date', new Date(body.end_date).toISOString())
            formData.append('title', body.title)
            formData.append('description', body.description)

            const res = await $fetch(`/api/admin/business/announcement/update`, {
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

    const deleteAnnouncement = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/business/announcement/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryDeliveryWithFilters = async (body: {
        business_id: string,
        search?: string,
        filter?: {
            delivery_type?: 'pickup' | 'delivery',
        },
    }) => {
        try {
            const { delivery_list } = await $fetch<{ delivery_list: Delivery[] }>(`/api/admin/business/delivery/get-with-filters`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })

            return delivery_list
        } catch (error) {
            throw error
        }
    }

    const createDelivery = async (body: {
        business_id: string,
        file: File,
        is_active: boolean,
        delivery_type: 'pickup' | 'delivery',
    }) => {
        try {
            const formData = new FormData()
            formData.append('business_id', body.business_id)
            formData.append('file', body.file)
            formData.append('is_active', body.is_active.toString())
            formData.append('delivery_type', body.delivery_type)

            const res = await $fetch<Delivery>(`/api/admin/business/delivery/create`, {
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

    const updateDelivery = async (body: {
        delivery_id: string,
        file?: File,
        is_active: boolean,
        delivery_type: 'pickup' | 'delivery',
    }) => {
        try {
            const formData = new FormData()
            formData.append('id', body.delivery_id)
            if (body.file) {
                formData.append('file', body.file)
            }
            formData.append('is_active', body.is_active.toString())
            formData.append('delivery_type', body.delivery_type)

            const res = await $fetch(`/api/admin/business/delivery/update`, {
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

    const deleteDelivery = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/business/delivery/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const queryFeedbackQuestionWithFilters = async (body: {
        business_id: string,
        search?: string,
    }) => {
        try {
            const { feedback_question_list, meta } = await $fetch<{ feedback_question_list: FeedbackQuestion[], meta: Meta }>(`/api/admin/business/feedback/question/get-with-filters`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: body
            })

            return {
                feedback_question_list,
                meta
            }
        } catch (error) {
            throw error
        }
    }  

    const createFeedbackQuestion = async (body: {
        business_id: string,
        file?: File,
        is_active: boolean,
        question: string,
        section: string,
    }) => {
        try {
            const formData = new FormData()
            formData.append('business_id', body.business_id)
            if (body.file) {
                formData.append('file', body.file)
            }
            formData.append('is_active', body.is_active.toString())
            formData.append('question', body.question)
            formData.append('section', body.section)

            const res = await $fetch(`/api/admin/business/feedback/question/create`, {
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

    const updateFeedbackQuestion = async (body: {
        feedback_question_id: string,
        file?: File,
        is_active: boolean,
        question: string,
        section: string,
    }) => {
        try {
            const formData = new FormData()
            formData.append('id', body.feedback_question_id)
            if (body.file) {
                formData.append('file', body.file)
            }
            formData.append('is_active', body.is_active.toString())
            formData.append('question', body.question)
            formData.append('section', body.section)

            const res = await $fetch(`/api/admin/business/feedback/question/update`, {
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

    const deleteFeedbackQuestion = async (id: string) => {
        try {
            const res = await $fetch(`/api/admin/business/feedback/question/delete/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'DELETE'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        // Onboarding
        queryOnboardingList,
        queryOnboardingWithFilters,
        createOnboarding,
        uploadOnboardingImage,
        updateOnboarding,
        updateOnboardingMultiple,
        deleteOnboarding,

        // Announcement
        queryAnnouncementWithFilters,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,

        // Delivery
        queryDeliveryWithFilters,
        createDelivery,
        updateDelivery,
        deleteDelivery,

        // Feedback Question
        queryFeedbackQuestionWithFilters,
        createFeedbackQuestion,
        updateFeedbackQuestion, 
        deleteFeedbackQuestion,
    }
}
