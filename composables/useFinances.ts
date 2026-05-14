import type { Meta } from "~/types/common"
import type { FinanceTransaction, ExpensesOutlet, GetFullReportResponse, FinanceSummary, OverviewPerformance } from "~/types/finance"
import type { PaymentMethodType } from "~/constants/payment"
export const useFinances = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()
    

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }
    
    const getTransactions = async (body: { page: number, page_size: number, payment_methods: PaymentMethodType[], search?: string }) => {
        try {
            const res = await $fetch<{ data: FinanceTransaction[], meta: Meta }>(`/api/admin/finances/transactions`, {
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

    const getTransactionDetails = async (id: string) => {
        try {
            const res = await $fetch<FinanceTransaction>(`/api/admin/finances/transaction-details/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            return null
        }
    }

    const voidReceipt = async (id: string) => {
        try {
            const res = await $fetch<FinanceTransaction>(`/api/admin/finances/void-receipt/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getPayoutReports = async (body: any) => {
        try {
            const res = await $fetch<{ data: ExpensesOutlet[], meta: Meta }>(`/api/admin/finances/payout-reports`, {
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

    const getPayoutReportDetails = async (id: string) => {
        try {
            const res = await $fetch<ExpensesOutlet>(`/api/admin/finances/payout-details/${id}`, {
                baseURL: baseUrl,
                headers,
                method: 'GET',
            })
            return res
        } catch (error) {
            return null
        }
    }

    const getFullReports = async (body: any) => {
        try {
            const res = await $fetch<GetFullReportResponse>(`/api/admin/finances/full-reports`, {
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

    const getFullReportSummaryDetails = async (outlet_id: string, start_date: string, end_date: string) => {
        try {
            const res = await $fetch<FinanceSummary>(`/api/admin/finances/summary`, {
                baseURL: baseUrl,
                headers,
                method: 'POST',
                body: {
                    outlet_id,
                    start_date,
                    end_date
                }
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getOverviewPerformance = async (body: any) => {
        try {
            const res = await $fetch<OverviewPerformance>(`/api/admin/finances/overview-performance`, {
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
        getTransactions,
        getTransactionDetails,
        getPayoutReports,
        getPayoutReportDetails,
        getFullReports,
        getFullReportSummaryDetails,
        getOverviewPerformance,
        voidReceipt
    }
}