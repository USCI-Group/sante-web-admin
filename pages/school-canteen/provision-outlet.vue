<script setup lang="ts">
import { Icon } from '@iconify/vue'
import BusinessDetailsForm from '~/components/custom/business/BusinessDetailsForm.vue'
import {
    Breadcrumb,
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
} from '@/components/ui/dialog'
import { ref } from 'vue'
import { useToast } from '@/components/ui/toast/use-toast'
import type { Business } from '@/types/business'

const config = useRuntimeConfig();

useSeoMeta({
    title: "Santé | Provision School Outlet",
    description: "Register and configure a new school-based outlet entity",
});

const { createBusiness, uploadBusinessLogo } = useBusinesses()
const isLoading = ref(false)
const showSuccessDialog = ref(false)

const outletData = ref<Business>({} as Business)

const navigateToSchoolOutlets = () => {
    navigateTo('/school-canteen')
}

const { toast } = useToast()

const handleProvisionOutlet = async (data: any) => {
    const businessData: Business = { ...data }
    const logoFile = data.logo_file

    isLoading.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 500))

        // We use the same business creation logic but for a school-based entity
        const createdEntity = await createBusiness(businessData)

        if (logoFile) {
            if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(logoFile.type)) {
                throw new Error('Logo format is not supported')
            }
            await uploadBusinessLogo(createdEntity.id as string, logoFile)
        }
        
        showSuccessDialog.value = true
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.data?.message ?? 'Failed to provision school outlet',
            variant: 'destructive',
        })
    } finally {
        isLoading.value = false
    }
}

const handleDialogClose = () => {
    showSuccessDialog.value = false
    navigateToSchoolOutlets()
}
</script>

<template>
    <div class="p-8 max-w-5xl mx-auto">
        <Dialog :open="showSuccessDialog" @update:open="showSuccessDialog = $event">
            <DialogContent class="rounded-[2rem] border-none shadow-2xl">
                <DialogHeader class="items-center text-center pt-6">
                    <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <Icon icon="heroicons:check-badge" class="w-12 h-12 text-primary" />
                    </div>
                    <DialogTitle class="text-2xl font-black text-slate-900">Success!</DialogTitle>
                    <DialogDescription class="text-slate-500 font-medium">
                        School-based Outlet has been provisioned successfully.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter class="sm:justify-center pb-6">
                    <Button class="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl font-bold transition-all active:scale-95" @click="handleDialogClose">
                        Return to Dashboard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div class="space-y-8">
            <!-- Breadcrumb Navigation -->
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink @click="navigateTo('/')" class="cursor-pointer">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink @click="navigateToSchoolOutlets" class="cursor-pointer">School-based Outlets</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Provision Outlet</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <!-- Header -->
            <div class="flex items-center gap-6 border-b border-slate-100 pb-8">
                <div class="flex items-center justify-center w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <Icon icon="heroicons:academic-cap" class="w-8 h-8 text-slate-400" />
                </div>
                <div>
                    <h1 class="text-3xl font-black text-slate-900 tracking-tight">Provision School Outlet</h1>
                    <p class="text-slate-500 font-medium">Register a new educational catering or retail entity into the Santé network.</p>
                </div>
            </div>

            <!-- Form following Business pattern -->
            <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-2 overflow-hidden">
                <BusinessDetailsForm 
                    mode="create"
                    :is-loading="isLoading"
                    :business="outletData"
                    @submit="handleProvisionOutlet"
                    @cancel="navigateToSchoolOutlets"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Ensuring consistency with the Santé design system */
:deep(.form-input) {
  @apply rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20;
}
</style>
