import type { Meta } from '@/types/common'
import type { ActivityLog } from '@/types/activity_log'

export const useActivityLogs = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`, 
    }

    const getActivityLogs = async (
        body: { 
            page: number, 
            page_size: number, 
            filter?: {
                from_date?: string,
                to_date?: string,
                action_by?: string,
                status?: string
            }
        }
    ) => {
        try {
            const res = await $fetch<{ data: ActivityLog[], meta: Meta }>(`/api/admin/activity-log/get-all`, {
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


    return {
        getActivityLogs
    }
}
