<script setup lang="ts">
import { Icon } from '@iconify/vue'
import UserDetailsForm from '~/components/custom/user/user-administrator/UserDetailsForm.vue'
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import type { User } from '@/types/user'
const config = useRuntimeConfig();

useSeoMeta({
    title: config.public.appName + " | User - Create Role",
    description: "Create a new role to manage user permissions",
});

const { updateUser } = useUsers()
const userStore = useUserStore()

const isLoading = ref(false)
const showSuccessDialog = ref(false)

const user = ref<User>({} as User)

onMounted(async () => {
    user.value = userStore.selectedUser as User
})

const cancel = () => {
    navigateTo('/user/user-administration')
}

const { toast } = useToast()

const handleEditUser = async (data: any) => {
    const userData: User = { ...data }
    const { role_id, password } = data
    
    isLoading.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const result = await updateUser(userData, role_id)
        
        showSuccessDialog.value = true
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to update user account',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
    }
}

const handleDialogClose = () => {
    showSuccessDialog.value = false
    navigateTo('/user/user-administration')
}
</script>
<template>
    <div class="p-6">
        <Dialog :open="showSuccessDialog" @update:open="showSuccessDialog = $event">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Success!</DialogTitle>
                    <DialogDescription>
                        User {{ user.first_name }} has been created successfully.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button class="btn-primary" @click="handleDialogClose">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <form @submit.prevent="handleEditUser" class="space-y-6">
            <div class="p-2 bg-white">
                <div class="p-6">
                    <Breadcrumb class="mb-6">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    <NuxtLink to="/user">
                                        User Management
                                    </NuxtLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink>
                                    <NuxtLink to="/user/user-administration">
                                        User Administration
                                    </NuxtLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Edit User
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div class="flex flex-row items-center my-8  gap-4">
                        <div
                            class="flex items-center border border-gray-300 rounded-md p-2 shadow-md hover:shadow-lg transition-shadow">
                            <Icon icon="heroicons:flag" class="w-6 h-6" />
                        </div>
                        <span class="flex flex-col">
                            <h1 class="text-2xl font-bold">Edit User</h1>
                            <span class="text-sm text-gray-500">update user details</span>
                        </span>
                    </div>
                </div>

                <UserDetailsForm 
                    mode="edit"
                    :is-loading="isLoading"
                    :user="user"
                    @submit="handleEditUser"
                    @cancel="cancel"
                />
            </div>
        </form>
    </div>
</template>