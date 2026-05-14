import { defineStore } from 'pinia'
import type { Role } from '@/types/user'

export const useRoleStore = defineStore('role', {
    state: () => ({
        selectedRole: null as Role | null
    }),
    actions: {
        setSelectedRole(role: Role) {
            this.selectedRole = role
        },
        clearSelectedRole() {
            this.selectedRole = null
        }
    }
}) 