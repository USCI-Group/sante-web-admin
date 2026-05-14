import type { OutletOperationSchedule, OutletOperationTimeSlot } from '~/types/outlet'


export const useOutletOperation = () => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiUrl
    const { token } = useAuth()

    const headers = {
        'Authorization': `${token.value}`,
        'Content-Type': 'application/json'
    }

    const getOutletOperationSchedule = async (outletId: string) => {
        const res = await $fetch<{ data: OutletOperationSchedule[] }>(`/api/pos/outlet/operation/schedule/${outletId}`, {
            baseURL: baseUrl,
            headers,
            method: 'GET',
        })
        return res
    }

    const updateOutletOperationSchedule = async (outletId: string, schedules: OutletOperationSchedule[]) => {
        const res = await $fetch(`/api/pos/outlet/operation/schedule/${outletId}`, {
            baseURL: baseUrl,
            headers,
            method: 'PUT',
            body: {
                operation_schedules: schedules,
            },
        })
        return res
    }

    const updateAllOutletOperationSchedule = async (body: { business_id: string, operation_schedules: OutletOperationSchedule[] }) => {
        const res = await $fetch(`/api/pos/outlet/operation/schedule/update-all`, {
            baseURL: baseUrl,
            headers,
            method: 'POST',
            body: body,
        })
        return res
    }

    const getOutletPickupTimeSlot = async (outletId: string) => {
        const res = await $fetch<{ data: OutletOperationTimeSlot[] }>(`/api/pos/outlet/pickup/time-slot/${outletId}`, {
            baseURL: baseUrl,
            headers,
            method: 'GET',
        })
        return res
    }

    const getPickupTimeSlot = async (body: {  outlet_id?: string, business_id?: string }) => {
        var newBody: any = {}
        if (body.outlet_id) {
            newBody.outlet_id = body.outlet_id
        }
        if (body.business_id) {
            newBody.business_id = body.business_id
        }

        const res = await $fetch<{data: Map<string, OutletOperationTimeSlot[]> }>(`/api/pos/pickup/time-slot/get`, {
            baseURL: baseUrl,
            headers,
            method: 'POST',  
            body: body,
        })
        return res
    }

    const toggleSlotAvailability = async (slotId: string) => {
        const res = await $fetch(`/api/pos/outlet/pickup/timeslot/availability/toggle/${slotId}`, {
            baseURL: baseUrl,
            headers,
            method: 'POST',
        })
        return res
    }

    return {
        getOutletOperationSchedule,
        updateOutletOperationSchedule,
        updateAllOutletOperationSchedule,
        getOutletPickupTimeSlot,
        getPickupTimeSlot,
        toggleSlotAvailability,
    }
}