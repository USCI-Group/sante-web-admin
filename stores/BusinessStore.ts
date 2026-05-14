import { defineStore } from 'pinia'
import type { Business } from '@/types/business'
import type { Outlet } from '@/types/outlet'
export const useBusinessStore = defineStore('business', {
    state: () => {
        const savedBusiness = localStorage.getItem('selectedBusiness')
        return {
            selectedBusiness: savedBusiness ? JSON.parse(savedBusiness) as Business : null
        }
    },
    actions: {
        setSelectedBusiness(business: Business) {
            this.selectedBusiness = business
            localStorage.setItem('selectedBusiness', JSON.stringify(business))
        },
        clearSelectedUser() {
            this.selectedBusiness = null
            localStorage.removeItem('selectedBusiness')
        }
    }
})

export const useOutletStore = defineStore('outlet', {
    state: () => {
        const savedOutlet = localStorage.getItem('selectedOutlet')
        return {
            selectedOutlet: savedOutlet ? JSON.parse(savedOutlet) as Outlet : null
        }
    },
    actions: {
        setSelectedOutlet(outlet: Outlet) {
            this.selectedOutlet = outlet
            localStorage.setItem('selectedOutlet', JSON.stringify(outlet))
        }
    }
})