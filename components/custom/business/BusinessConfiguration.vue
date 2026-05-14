<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { BusinessConfiguration } from '@/types/business'
import BusinessConfigurationFormDialog from './BusinessConfigurationFormDialog.vue'
import { useToast } from '@/components/ui/toast/use-toast'
import TnCFormDialog from './TnCFormDialog.vue'
import PrivacyPolicyFormDialog from './PrivacyPolicyFormDialog.vue'
import type { Input } from '~/components/ui/input'
import type { Button } from '~/components/ui/button'
import type { MerchantSecret } from '@/types/outlet'

const { myProfile, isSantéAdmin } = useMyProfileStore()
const { getBusinessConfiguration, saveBusinessConfiguration } = useBusinesses()
const businessStore = useBusinessStore()
const { toast } = useToast()

const handleOpenBusinessConfigurationDialog = () => {
    businessConfiguration.value.grab_client_secret = ''
    businessConfiguration.value.grab_express_client_secret = ''
    businessConfiguration.value.shopee_client_secret = ''
    businessConfigurationFormDialogData.value.isOpen = true
}

const businessConfiguration = ref<BusinessConfiguration>({} as BusinessConfiguration)
const showGrabClientId = ref(false)
const showGrabExpressClientId = ref(false)
const showShopeeClientId = ref(false)
const businessConfigurationFormDialogData = ref({
    isOpen: false,
    isLoading: false
})

const tncFormDialogData = ref({
    isOpen: false,
    terms: '',
    business_id: ''
})

const privacyPolicyFormDialogData = ref({
    isOpen: false,
    privacyPolicy: '',
    business_id: ''
})

const handleOpenTnCFormDialog = () => {
    tncFormDialogData.value.isOpen = true
    tncFormDialogData.value.terms = businessConfiguration.value.terms_of_service as string
    tncFormDialogData.value.business_id = businessConfiguration.value.business_id as string
}

const handleOpenPrivacyPolicyFormDialog = () => {
    privacyPolicyFormDialogData.value.isOpen = true
    privacyPolicyFormDialogData.value.privacyPolicy = businessConfiguration.value.privacy_policy as string
    privacyPolicyFormDialogData.value.business_id = businessConfiguration.value.business_id as string
}

onMounted(async () => {
    await fetchBusinessConfiguration()
})

const fetchBusinessConfiguration = async () => {
    let businessId = myProfile?.business_id as string
    if(isSantéAdmin()){
        const selectedBusiness = businessStore.selectedBusiness
        businessId = selectedBusiness?.id as string
        businessConfiguration.value.business_id = businessId as string
    }
    try {
        const res = await getBusinessConfiguration(businessId as string)
        businessConfiguration.value = res
    } catch (error) {
    }
}

const handleSaveBusinessConfiguration = async (data: BusinessConfiguration) => {

    businessConfigurationFormDialogData.value.isLoading = true
    try {
        await saveBusinessConfiguration(data)
        toast({
            title: 'Success',
            description: 'Business configuration saved successfully',
            variant: 'success',
        })
        await fetchBusinessConfiguration()
        businessConfigurationFormDialogData.value.isOpen = false
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Failed to save business configuration',
            variant: 'destructive',
        })
    }
    businessConfigurationFormDialogData.value.isLoading = false
}

</script>

<template>
    <div class="mt-10">
        <div class="flex items-center justify-between">
            <div>
            <h2 class="text-xl font-semibold">Business Configuration</h2>
            <p class="text-sm text-gray-500">
                The following details are used to configure the business.
            </p>
            </div>
            <Button v-if="isSantéAdmin()" class="btn-primary" @click="handleOpenBusinessConfigurationDialog">
                <Icon icon="heroicons:pencil-square" class="w-5 h-5 mr-2" />
                Edit
            </Button>
        </div>

        <div class="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex items-start">
            <Icon icon="heroicons:information-circle" class="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <p class="text-sm text-blue-700">
                Please contact admin if you wish to integrate with GrabFood or ShopeeFood.
            </p>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 mt-2">
            <div class="bg-white rounded-lg shadow-sm border p-4">

                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-medium">Terms of Service</h3>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <Button
                                    size="sm"
                                    class="btn-primary-outline"
                                    @click="handleOpenTnCFormDialog"
                                >
                                    Terms of Service
                                </Button>
                            </div>
                            <div class="mx-2">
                                <Icon 
                                    v-if="businessConfiguration?.terms_of_service" 
                                    icon="heroicons:check-circle-solid" 
                                    class="w-7 h-7 text-green-600" 
                                />
                                <Icon 
                                    v-else 
                                    icon="heroicons:x-circle-solid" 
                                    class="w-7 h-7 text-red-600" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <br>

                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-medium">Privacy Policy</h3>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                                <Button
                                    size="sm"
                                    class="btn-primary-outline"
                                    @click="handleOpenPrivacyPolicyFormDialog"
                                >
                                    Privacy Policy
                                </Button>
                            </div>
                            <div class="mx-2">
                                <Icon 
                                    v-if="businessConfiguration?.privacy_policy" 
                                    icon="heroicons:check-circle-solid" 
                                    class="w-7 h-7 text-green-600" 
                                />
                                <Icon 
                                    v-else 
                                    icon="heroicons:x-circle-solid" 
                                    class="w-7 h-7 text-red-600" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="my-4">

                <!-- GrabFood Client API Keys -->
                <div>
                    <Icon icon="simple-icons:grab" class="w-12 h-12" />
                    <div class="flex justify-between items-center mb-4">
                    <h3 class="font-medium">GrabFood Client API Keys</h3>
                    <span v-if="businessConfiguration?.grab_client_id && businessConfiguration?.grab_client_secret" class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <Icon icon="heroicons:check-circle" class="w-3 h-3 mr-1" />
                        Active
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Inactive
                    </span>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                            <p class="text-sm font-medium">GrabFood Client ID</p>
                            <div v-if="businessConfiguration?.grab_client_secret" class="flex items-center mt-1">
                                <p v-if="showGrabClientId" class="text-sm text-gray-500">{{ businessConfiguration?.grab_client_id }}</p>
                                <p v-else class="text-sm text-gray-500">••••••••••••••••</p>
                            </div>
                            <div v-else>
                                <p class="text-sm text-gray-500">No application code found <span class="text-red-500">(Please contact admin to activate)</span></p>
                            </div>
                            </div>
                            <Button variant="ghost" size="sm" class="ml-2" @click="showGrabClientId = !showGrabClientId">
                                <Icon :icon="showGrabClientId ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                            </Button>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                            <p class="text-sm font-medium">GrabFood Client Secret <span class="text-gray-500">(encrypted)</span></p>
                            <div class="flex items-center mt-1">
                                <p v-if="businessConfiguration?.grab_client_secret" class="text-sm text-gray-500">{{ businessConfiguration?.grab_client_secret ? businessConfiguration.grab_client_secret.substring(0, 5) + '******' : '' }}</p>
                                <p v-else class="text-sm text-gray-500">No secret found <span class="text-red-500">(Please contact admin to activate)</span></p>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>

                <br>
                
                <!-- GrabExpress Client API Keys -->
                <div>
                    <div class="flex justify-between items-center mb-4">
                    <h3 class="font-medium">GrabExpress Client API Keys</h3>
                    <span v-if="businessConfiguration?.grab_express_client_id && businessConfiguration?.grab_express_client_secret" class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <Icon icon="heroicons:check-circle" class="w-3 h-3 mr-1" />
                        Active
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Inactive
                    </span>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                            <p class="text-sm font-medium">GrabExpress Client ID</p>
                            <div v-if="businessConfiguration?.grab_express_client_secret" class="flex items-center mt-1">
                                <p v-if="showGrabClientId" class="text-sm text-gray-500">{{ businessConfiguration?.grab_express_client_id }}</p>
                                <p v-else class="text-sm text-gray-500">••••••••••••••••</p>
                            </div>
                            <div v-else>
                                <p class="text-sm text-gray-500">No application code found <span class="text-red-500">(Please contact admin to activate)</span></p>
                            </div>
                            </div>
                            <Button variant="ghost" size="sm" class="ml-2" @click="showGrabExpressClientId = !showGrabExpressClientId">
                                <Icon :icon="showGrabClientId ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                            </Button>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                            <p class="text-sm font-medium">GrabExpress Client Secret <span class="text-gray-500">(encrypted)</span></p>
                            <div class="flex items-center mt-1">
                                <p v-if="businessConfiguration?.grab_express_client_secret" class="text-sm text-gray-500">{{ businessConfiguration?.grab_express_client_secret ? businessConfiguration.grab_express_client_secret.substring(0, 5) + '******' : '' }}</p>
                                <p v-else class="text-sm text-gray-500">No secret found <span class="text-red-500">(Please contact admin to activate)</span></p>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr class="my-4">

                <!-- ShopeeFood Client API Keys -->
                <div>
                    <Icon icon="simple-icons:shopee" class="w-8 h-8 mb-3 mt-7" />
                    <div class="flex justify-between items-center mb-4">
                    <h3 class="font-medium">ShopeeFood Client API Keys</h3>
                    <span v-if="businessConfiguration?.shopee_client_id && businessConfiguration?.shopee_client_secret" class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <Icon icon="heroicons:check-circle" class="w-3 h-3 mr-1" />
                        Active
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Inactive
                    </span>
                    </div>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div>
                            <p class="text-sm font-medium">ShopeeFood Client ID</p>
                            <div v-if="businessConfiguration?.shopee_client_secret" class="flex items-center mt-1">
                                <p v-if="showShopeeClientId" class="text-sm text-gray-500">{{ businessConfiguration?.shopee_client_id }}</p>
                                <p v-else class="text-sm text-gray-500">••••••••••••••••</p>
                            </div>
                            <div v-else>
                                <p class="text-sm text-gray-500">No application code found <span class="text-red-500">(Please contact admin to activate)</span></p>
                            </div>
                            </div>
                            <Button variant="ghost" size="sm" class="ml-2" @click="showShopeeClientId = !showShopeeClientId">
                                <Icon :icon="showShopeeClientId ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                            </Button>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium">ShopeeFood Client Secret <span class="text-gray-500">(encrypted)</span></p>
                                <div class="flex items-center mt-1">
                                    <p v-if="businessConfiguration?.shopee_client_secret" class="text-sm text-gray-500">{{ businessConfiguration?.shopee_client_secret ? businessConfiguration.shopee_client_secret.substring(0, 5) + '******' : '' }}</p>
                                    <p v-else class="text-sm text-gray-500">No secret found <span class="text-red-500">(Please contact admin to activate)</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>

    <BusinessConfigurationFormDialog
        :is-open="businessConfigurationFormDialogData.isOpen"
        :business-configuration="businessConfiguration"
        :is-loading="businessConfigurationFormDialogData.isLoading"
        @submit="handleSaveBusinessConfiguration"
        @cancel="async () => {
            await fetchBusinessConfiguration()
            businessConfigurationFormDialogData.isOpen = false
        }"
    />

    <TnCFormDialog
        :is-open="tncFormDialogData.isOpen"
        :business-id="tncFormDialogData.business_id"
        :terms="tncFormDialogData.terms"
        @cancel="() => { tncFormDialogData.isOpen = false }"
        @submit="() => { tncFormDialogData.isOpen = false, fetchBusinessConfiguration() }"
    />

    <PrivacyPolicyFormDialog
        :is-open="privacyPolicyFormDialogData.isOpen"
        :business-id="privacyPolicyFormDialogData.business_id"
        :privacy-policy="privacyPolicyFormDialogData.privacyPolicy"
        @cancel="() => { privacyPolicyFormDialogData.isOpen = false }"
        @submit="() => { privacyPolicyFormDialogData.isOpen = false, fetchBusinessConfiguration() }"
    />
</template>