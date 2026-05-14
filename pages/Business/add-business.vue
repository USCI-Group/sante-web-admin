<script setup lang="ts">
import { Icon } from '@iconify/vue'
import BusinessDetailsForm from '~/components/custom/business/BusinessDetailsForm.vue'
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
import { useToast } from '@/components/ui/toast/use-toast'
import type { Business } from '@/types/business'
const config = useRuntimeConfig();

useSeoMeta({
    title: config.public.appName + " | User - Create Role",
    description: "Create a new role to manage user permissions",
});

const { createBusiness, uploadBusinessLogo } = useBusinesses()
const isLoading = ref(false)
const showSuccessDialog = ref(false)

const business = ref<Business>({} as Business)

onMounted(async () => {
})

const navigateToBusiness = () => {
    navigateTo('/business')
}

const { toast } = useToast()

const handleCreateBusiness = async (data: any) => {
    const businessData: Business = { ...data }
    const logoFile = data.logo_file

    isLoading.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 500))

        const createdBusiness = await createBusiness(businessData)
        
        if (logoFile) {
            try {
                if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(logoFile.type)) {
                    throw new Error('Logo format is not supported')
                }
                await uploadBusinessLogo(createdBusiness.id as string, logoFile)
            } catch (uploadError: any) {
                console.error('Logo upload failed:', uploadError)
                toast({
                    title: 'Partial Success',
                    description: 'Business created, but logo upload failed (S3 configuration missing).',
                    variant: 'default',
                })
            }
        }
        
        showSuccessDialog.value = true
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to create business',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
    }
}

const handleDialogClose = () => {
    showSuccessDialog.value = false
    navigateToBusiness()
}
</script>
<template>
    <div class="p-6">
        <Dialog :open="showSuccessDialog" @update:open="showSuccessDialog = $event">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Success!</DialogTitle>
                    <DialogDescription>
                        Business has been created successfully.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button class="btn-primary" @click="handleDialogClose">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <form @submit.prevent="handleCreateBusiness" class="space-y-6">
            <div class="p-2 bg-white">
                <div class="">
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
                                    <NuxtLink to="/business">
                                        Business Management
                                    </NuxtLink>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Create Business
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
                            <h1 class="text-2xl font-bold">Create Business</h1>
                            <span class="text-sm text-gray-500">Create a new business</span>
                        </span>
                    </div>
                </div>

                <BusinessDetailsForm 
                    mode="create"
                    :is-loading="isLoading"
                    :business="business"
                    @submit="handleCreateBusiness"
                    @cancel="navigateToBusiness"
                />
            </div>
        </form>
    </div>
</template>