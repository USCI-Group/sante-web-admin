<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'
import type { MerchantSecret } from '@/types/outlet'
import Tooltip from '~/components/custom/Tooltip.vue'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()

interface Props {
  isOpen: boolean
  isLoading: boolean
  merchantSecret: MerchantSecret
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [user: any]
  'cancel': []
}>()

const merchantSecret = ref(props.merchantSecret)

const showCloudErcAccountPassword = ref(false)
const showSecretKey = ref(false)
const showOfflineSecretKey = ref(false)
const showCloudErcSecretKey = ref(false)

const verifyKeyError = ref('')
const applicationCodeError = ref('')
const secretKeyError = ref('')
const offlineSecretKeyError = ref('')
const merchantIdError = ref('')
const cloudErcAccountIdError = ref('')
const cloudErcAccountPasswordError = ref('')
const cloudErcSecretKeyError = ref('')

watch(() => props.merchantSecret, (newMerchantSecret) => {
  merchantSecret.value = newMerchantSecret
}, { immediate: true })

const handleSubmit = () => {
  if(!validateForm()){
    return
  }

  emit('submit', { ...merchantSecret.value })
}

const validateForm = () => {
  // Reset errors
  verifyKeyError.value = ''
  applicationCodeError.value = ''
  secretKeyError.value = ''
  merchantIdError.value = ''
  cloudErcAccountIdError.value = ''
  cloudErcAccountPasswordError.value = ''
  offlineSecretKeyError.value = ''
  cloudErcSecretKeyError.value = ''
  
  if(!merchantSecret.value.fiuu_application_code && !merchantSecret.value.fiuu_verify_key && !merchantSecret.value.fiuu_merchant_id && !merchantSecret.value.fiuu_cloud_erc_account_id && !merchantSecret.value.fiuu_cloud_erc_account_password && !merchantSecret.value.grab_store_id){
    // applicationCodeError.value = 'Application code is required'
    toast({
      title: 'Error',
      description: 'At least one of the fields is required',
      variant: 'destructive',
    })
    return false
  }
  // if(!merchantSecret.value.fiuu_secret_key){
  //   secretKeyError.value = 'Secret key is required'
  //   return false
  // }
  return true
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
            <DialogTitle>Merchant Secrets</DialogTitle>
            <DialogDescription>
            Update merchant secrets
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <h3 class="text-lg font-medium underline">FIUU Online Payment API Keys</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>Verify Key</Label>
                <Input
                v-model="merchantSecret.fiuu_verify_key"
                placeholder="Enter verify key"
                :class="{ 'border-red-500': verifyKeyError }"
                />
                <span v-if="verifyKeyError" class="text-sm text-red-500">{{ verifyKeyError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>FIUU Secret Key</Label>
                  <Tooltip text="Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <div class="relative">
                  <Input
                    :type="showSecretKey ? 'input' : 'password'"
                    v-model="merchantSecret.fiuu_secret_key"
                    placeholder=""
                    :class="{ 'border-red-500': secretKeyError }"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center focus:outline-none"
                    tabindex="-1"
                    @click="showSecretKey = !showSecretKey"
                  >
                    <Icon :name="showSecretKey ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <span v-if="secretKeyError" class="text-sm text-red-500">{{ secretKeyError }}</span>
            </div>
          </div>

          <hr>

          <h3 class="text-lg font-medium underline">FIUU Offline Payment API Keys</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>FIUU Application Code</Label>
                <Input
                v-model="merchantSecret.fiuu_application_code"
                placeholder="Enter application code"
                :class="{ 'border-red-500': applicationCodeError }"
                />
                <span v-if="applicationCodeError" class="text-sm text-red-500">{{ applicationCodeError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>FIUU Secret Key</Label>
                  <Tooltip text="Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <div class="relative">
                  <Input
                    :type="showOfflineSecretKey ? 'input' : 'password'"
                    v-model="merchantSecret.fiuu_offline_secret_key"
                    placeholder=""
                    :class="{ 'border-red-500': offlineSecretKeyError }"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center focus:outline-none"
                    tabindex="-1"
                    @click="showOfflineSecretKey = !showOfflineSecretKey"
                  >
                    <Icon :name="showOfflineSecretKey ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <span v-if="offlineSecretKeyError" class="text-sm text-red-500">{{ offlineSecretKeyError }}</span>
            </div>
          </div>

          <hr>

          <h3 class="text-lg font-medium underline">FIUU Cloud ECR API Keys</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>FIUU Merchant ID</Label>
                <Input
                v-model="merchantSecret.fiuu_merchant_id"
                placeholder="Enter merchant id"
                :class="{ 'border-red-500': merchantIdError }"
                />
                <span v-if="merchantIdError" class="text-sm text-red-500">{{ merchantIdError }}</span>
            </div>

            <div class="grid gap-2">
                <Label>FIUU Cloud ECR Account ID</Label>
                <Input
                v-model="merchantSecret.fiuu_cloud_erc_account_id"
                placeholder="Enter application code"
                :class="{ 'border-red-500': cloudErcAccountIdError }"
                />
                <span v-if="cloudErcAccountIdError" class="text-sm text-red-500">{{ cloudErcAccountIdError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>FIUU Cloud ECR Account Password</Label>
                  <Tooltip text="Cloud ECR Account Password will be encrypted. input should only be the actual password. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <div class="relative">
                  <Input
                    :type="showCloudErcAccountPassword ? 'input' : 'password'"
                    v-model="merchantSecret.fiuu_cloud_erc_account_password"
                    placeholder=""
                    :class="{ 'border-red-500': cloudErcAccountPasswordError }"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center focus:outline-none"
                    tabindex="-1"
                    @click="showCloudErcAccountPassword = !showCloudErcAccountPassword"
                  >
                    <Icon :name="showCloudErcAccountPassword ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <span v-if="cloudErcAccountPasswordError" class="text-sm text-red-500">{{ cloudErcAccountPasswordError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>FIUU Cloud ECR Secret Key</Label>
                  <Tooltip text="Cloud ECR Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <div class="relative">
                  <Input
                    :type="showCloudErcSecretKey ? 'input' : 'password'"
                    v-model="merchantSecret.fiuu_cloud_erc_secret_key"
                    placeholder=""
                    :class="{ 'border-red-500': cloudErcSecretKeyError }"
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-2 flex items-center focus:outline-none"
                    tabindex="-1"
                    @click="showCloudErcSecretKey = !showCloudErcSecretKey"
                  >
                    <Icon :name="showCloudErcSecretKey ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <span v-if="cloudErcSecretKeyError" class="text-sm text-red-500">{{ cloudErcSecretKeyError }}</span>
            </div>

            <!-- <div class="grid gap-2">
                <Label>GrabFood Store ID</Label>
                <Input
                v-model="merchantSecret.grab_store_id"
                disabled
                placeholder="Enter store id"
                />
            </div> -->
          </div>
            
        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button type="submit" :disabled="isLoading" @click="handleSubmit">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
