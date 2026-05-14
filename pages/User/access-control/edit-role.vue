<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoleStore } from '@/stores/RoleStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
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
import { usePermissions } from '@/composables/usePermissions'
import { useRoles } from '@/composables/useRoles'
import { useToast } from '@/components/ui/toast/use-toast'
import RoleDetailsForm from '@/components/custom/user/access-control/RoleDetailsForm.vue'
import type { Role } from '~/types/user'
const config = useRuntimeConfig();

useSeoMeta({
    title: config.public.appName + " | User - Edit Role",
    description: "Edit a role to manage user permissions",
});

const roleStore = useRoleStore()
const router = useRouter()

const isLoading = ref(false)
const showSuccessDialog = ref(false)

const { updateRole } = useRoles()

// Redirect if no role is selected
onMounted(() => {
    if (!roleStore.selectedRole) {
        router.push('/user/access-control')
    }
})

// Clear store on component unmount
onUnmounted(() => {
    roleStore.clearSelectedRole()
})

const cancel = () => {
    navigateTo('/user/access-control')
}

const { toast } = useToast()
const handleEditRole = async (data: any) => {
    const role: Role = { ...data }
    isLoading.value = true
    // Validate name
    if (!role.name.trim()) {
        toast({
            title: 'Error',
            description: 'Role name is required',
            variant: 'destructive',
        })
        isLoading.value = false
        return
    }


    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const result = await updateRole({
            id: roleStore.selectedRole?.id,
            name: role.name,
            description: role.description,
            business_id: role.business_id ?? null,
            permission_presets: role.permission_presets ?? null,
            role_type: role.role_type,
        })
        
        showSuccessDialog.value = true
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to update role',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
    }
}

const handleDialogClose = () => {
    showSuccessDialog.value = false
    navigateTo('/user/access-control')
}
</script>

<template>
    <div>
        <Dialog :open="showSuccessDialog" @update:open="showSuccessDialog = $event">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Success!</DialogTitle>
                    <DialogDescription>
                        Role {{ roleStore.selectedRole?.name }} has been updated successfully.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button class="btn-primary" @click="handleDialogClose">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <form @submit.prevent="handleEditRole" class="space-y-6">
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
                                    <NuxtLink to="/user/access-control">
                                        Access Control
                                    </NuxtLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Edit Role
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
                            <h1 class="text-2xl font-bold">Edit Role</h1>
                            <span class="text-sm text-gray-500">Edit a role to manage user permissions</span>
                        </span>
                    </div>
                </div>

                <RoleDetailsForm 
                    mode="edit"
                    :initial-data="roleStore.selectedRole"
                    :is-loading="isLoading"
                    @submit="handleEditRole"
                    @cancel="cancel"
                />
            </div>
        </form>
    </div>
    
</template> 