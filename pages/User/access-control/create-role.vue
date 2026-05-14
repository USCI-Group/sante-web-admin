<script setup lang="ts">
import { Icon } from '@iconify/vue'
import RoleDetailsForm from '~/components/custom/user/access-control/RoleDetailsForm.vue'
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
import { ref, reactive } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import { useRoles } from '@/composables/useRoles'
import { useToast } from '@/components/ui/toast/use-toast'
import type { PermissionPresetType, Role } from '@/types/user'
const config = useRuntimeConfig();

useSeoMeta({
    title: config.public.appName + " | User - Create Role",
    description: "Create a new role to manage user permissions",
});

const { createRole } = useRoles()
const { getPermissionPresets } = usePermissions()
const { me, getMe } = useUsers()
const permissionPresets = ref<PermissionPresetType[]>([])
const name = ref('')
const nameError = ref('')
const isLoading = ref(false)
const showSuccessDialog = ref(false)

onMounted(async () => {
    const presets = await getPermissionPresets()
    if (presets) {
        permissionPresets.value = presets as unknown as PermissionPresetType[]
    }
    await getMe()
})

const cancel = () => {
    navigateTo('/user/access-control')
}

const { toast } = useToast()

const handleCreateRole = async (data: any) => {
    const roleData: Role = { ...data }
    let selectedRole:string = data.role_type
    
    isLoading.value = true
    nameError.value = ''
    name.value = roleData.name

    // Validate
    if (!name.value) {
        isLoading.value = false
        return
    }
    if(me.value?.GroupRole?.Role?.role_type !== 'admin'){
        selectedRole = 'business'
        roleData.business_id = me.value?.business_id ?? null
        roleData.role_type = selectedRole
    }
    if(!selectedRole){
        isLoading.value = false
        return
    }
    if(selectedRole === 'business' && !roleData.business_id){
        isLoading.value = false
        return
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const result = await createRole(roleData)
        
        showSuccessDialog.value = true
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to create role',
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
                        Role {{ name }} has been created successfully.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button class="btn-primary" @click="handleDialogClose">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <form @submit.prevent="handleCreateRole" class="space-y-6">
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
                                    Create Role
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
                            <h1 class="text-2xl font-bold">Create Role</h1>
                            <span class="text-sm text-gray-500">Create a new role to manage user permissions</span>
                        </span>
                    </div>
                </div>

                <RoleDetailsForm 
                    v-if="permissionPresets.length > 0"
                    mode="create"
                    :is-loading="isLoading"
                    :initial-data="{
                        name: '',
                        description: '',
                        permission_presets: permissionPresets,
                        role_type: ''
                    }"
                    @submit="handleCreateRole"
                    @cancel="cancel"
                />
            </div>
        </form>
    </div>
</template>