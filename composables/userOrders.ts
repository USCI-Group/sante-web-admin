import type { Order, SubmitEInvoiceByOrderRequest } from '@/types/orders'

export const useUserOrders = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }
    
    const submitEInvoiceByOrder = async (body: SubmitEInvoiceByOrderRequest) => {
        try {
            const res = await $fetch(`/api/e-invoice/submit-e-invoice-by-order`, {
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

//encore:api public method=GET path=/api/customers/order/:order_id
    const getOrderById = async (order_id: string) => {
        try {
            const res = await $fetch<Order>(`/api/customers/order/${order_id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET'
            })
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        submitEInvoiceByOrder,
        getOrderById
    }
}