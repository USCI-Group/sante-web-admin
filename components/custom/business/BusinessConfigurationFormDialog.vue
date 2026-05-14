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
import type { BusinessConfiguration } from '@/types/business'
import Tooltip from '~/components/custom/Tooltip.vue'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()

interface Props {
  isOpen: boolean
  isLoading: boolean
  businessConfiguration: BusinessConfiguration
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [businessConfiguration: BusinessConfiguration]
  'cancel': []
}>()

const businessConfiguration = ref(props.businessConfiguration)

const applicationCodeError = ref('')
const secretKeyError = ref('')

watch(() => props.businessConfiguration, (newBusinessConfiguration) => {
  businessConfiguration.value = newBusinessConfiguration
}, { immediate: true })

const handleSubmit = () => {
  // if(!validateForm()){
  //   return
  // }

  emit('submit', { ...businessConfiguration.value })
}

const validateForm = () => {
  // Reset errors
  applicationCodeError.value = ''
  secretKeyError.value = ''

  if(!businessConfiguration.value.grab_client_id && !businessConfiguration.value.grab_client_secret){
    // applicationCodeError.value = 'Application code is required'
    toast({
      title: 'Error',
      description: 'At least one of the fields is required',
      variant: 'destructive',
    })
    return false
  }
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
            <DialogTitle>Business Configuration</DialogTitle>
            <DialogDescription>
            Update business configuration
            </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 pb-4">
          <Icon name="simple-icons:grab" class="w-12 h-12" />
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>GrabFood Client ID</Label>
                <Input
                v-model="businessConfiguration.grab_client_id"
                placeholder="Enter application code"
                :class="{ 'border-red-500': applicationCodeError }"
                />
                <span v-if="applicationCodeError" class="text-sm text-red-500">{{ applicationCodeError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>GrabFood Client Secret</Label>
                  <Tooltip text="Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <Input
                v-model="businessConfiguration.grab_client_secret"
                placeholder=""
                :class="{ 'border-red-500': secretKeyError }"
                />
                <span v-if="secretKeyError" class="text-sm text-red-500">{{ secretKeyError }}</span>
            </div>

            <div class="grid gap-2">
                <Label>GrabExpress Client ID</Label>
                <Input
                v-model="businessConfiguration.grab_express_client_id"
                placeholder="Enter GrabExpress Client ID"
                />
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>GrabExpress Client Secret</Label>
                  <Tooltip text="Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <Input
                v-model="businessConfiguration.grab_express_client_secret"
                placeholder=""
                />
            </div>
          </div>

          <hr>
          <Icon name="simple-icons:shopee" class="w-8 h-8" />
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
                <Label>ShopeeFood Client ID</Label>
                <Input
                v-model="businessConfiguration.shopee_client_id"
                placeholder="Enter application code"
                :class="{ 'border-red-500': applicationCodeError }"
                />
                <span v-if="applicationCodeError" class="text-sm text-red-500">{{ applicationCodeError }}</span>
            </div>

            <div class="grid gap-2">
                <div class="flex">
                  <Label>ShopeeFood Client Secret</Label>
                  <Tooltip text="Secret Key will be encrypted. input should only be the actual secret key. Otherwise, leave it blank." position="top">
                    <Icon name="mdi:information-outline" class="w-4 h-4 text-gray-500 cursor-help ml-1" />
                  </Tooltip>
                </div>
                <Input
                v-model="businessConfiguration.shopee_client_secret"
                placeholder=""
                :class="{ 'border-red-500': secretKeyError }"
                />
                <span v-if="secretKeyError" class="text-sm text-red-500">{{ secretKeyError }}</span>
            </div>
          </div>
            
        </div>

        <DialogFooter>
            <Button variant="outline" @click="handleCancel">Cancel</Button>
            <Button class="btn-primary" type="submit" :disabled="isLoading" @click="handleSubmit">
            {{ isLoading ? 'Saving...' : 'Save Changes' }}
            </Button>
        </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
