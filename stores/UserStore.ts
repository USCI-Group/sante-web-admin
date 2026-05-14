import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', {
    state: () => {
        const savedUser = localStorage.getItem('selectedUser')
        return {
            selectedUser: savedUser ? JSON.parse(savedUser) as User : null
        }
    },
    actions: {
        setSelectedUser(user: User) {
            this.selectedUser = user
            localStorage.setItem('selectedUser', JSON.stringify(user))
        },
        clearSelectedUser() {
            this.selectedUser = null
            localStorage.removeItem('selectedUser')
        }
    }
})

export const useMyProfileStore = defineStore('myProfile', {
    state: () => ({
        myProfile: {} as User
    }),
    actions: {
        setMyProfile(user: User) {
            this.myProfile = user
        },
        clearMyProfile() {
            this.myProfile = {} as User
        },
        isSantéAdmin(): boolean {
            return this.myProfile?.GroupRole?.Role?.role_type === 'admin'
        },
        checkPermission(permission_name: string): boolean {
            const permissions = this.myProfile?.GroupRole?.permissions
            const permission = permissions.find((p) => p.name === permission_name)
            return permission?.enabled ?? false
        }
    }
})