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
import { ref, watch } from 'vue'
import FileInput from '~/components/custom/fileinput/fileinput.vue'
import { useCommunication } from '~/composables/useCommunication'
import { useToast } from '~/components/ui/toast/use-toast'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { Icon } from '@iconify/vue'
import DynamicDialog from '../DynamicDialog.vue'

const { toast } = useToast()
const { createDelivery, updateDelivery } = useCommunication()
import type { Delivery } from '@/types/communication'

interface Props {
  isOpen: boolean
  isLoading: boolean
  businessId: string
  mode: 'create' | 'edit'
  delivery: Delivery
  anyActive: {
    pickup: boolean
    delivery: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'cancel': []
  'submit': []
}>()

const imageFiles = ref<File[]>([])
const errorMessages = ref({
  image: '',
  delivery_type: '',
})

const activeCardDialog = ref({
    isOpen: false,
    title: 'Activate Order Method',
    description: 'Do you want to activate this order method?',
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessages.value = {
        image: '',
        delivery_type: '',
      }
    }
  }
)

const validateForm = () => {
  errorMessages.value = {
    image: '',
    delivery_type: '',
  }
  let hasError = false
  if (imageFiles.value.length === 0 && props.mode === 'create') {
    errorMessages.value.image = 'Image is required'
    hasError = true
  }

  if (props.delivery.delivery_type !== 'pickup' && props.delivery.delivery_type !== 'delivery') {
    errorMessages.value.delivery_type = 'Delivery type is required and must be either pickup or delivery'
    hasError = true
  }

  return !hasError
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (props.mode === 'create') {
    await createDeliveryFunction()

    checkIfAnyActive()
  } else {
    await updateDeliveryFunction(props.delivery)
  }

}

const checkIfAnyActive = () => {
  let isAnyActive = false
  if (props.delivery.delivery_type === 'pickup') {
    isAnyActive = props.anyActive.pickup
  } else {
    isAnyActive = props.anyActive.delivery
  }

  if (isAnyActive) {
    activeCardDialog.value.isOpen = true;
    activeCardDialog.value.title = 'Activate this order method?';
    activeCardDialog.value.description = `Do you want to activate this ${props.delivery.delivery_type} method?`;
  }

  return isAnyActive
}

const createDeliveryFunction = async () => {
  try {
    const res = await createDelivery({
      business_id: props.businessId,
      is_active: false,
      delivery_type: props.delivery.delivery_type as 'pickup' | 'delivery',
      file: imageFiles.value[0]
    });
    props.delivery.id = res.id;

    emit('submit')
    emit('update:isOpen', false)
    toast({
      title: 'Success',
      description: `Order method created successfully`,
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || error?.data || `Failed to create order method`,
      variant: 'destructive'
    })
    throw error
  }
}

const activateCard = async () => {
    activeCardDialog.value.isOpen = false;
    props.delivery.is_active = true;
    await updateDeliveryFunction(props.delivery);
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

async function updateDeliveryFunction(delivery: Delivery) {
  try {
    const payload: any = {
      delivery_id: delivery.id,
      is_active: delivery.is_active,
      delivery_type: delivery.delivery_type as 'pickup' | 'delivery',
    }

    if (imageFiles.value.length > 0) {
      payload.file = imageFiles.value[0]
    }

    await updateDelivery(payload)

    emit('update:isOpen', false)
    emit('submit')
    toast({
      title: 'Success',
      description: `${delivery.delivery_type} updated successfully`,
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || error?.data || `Failed to update ${delivery.delivery_type}`,
      variant: 'destructive'
    })
    throw error
  }
}

</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? 'Create Pickup / Delivery' : 'Edit Pickup / Delivery' }}
        </DialogTitle>
        <!-- <DialogDescription>
          Add a new onboarding entry for your business.
        </DialogDescription> -->
        <hr class="mt-1">
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <Button
              type="button"
              class="w-full flex flex-col items-center justify-center py-12"
              :variant="delivery.delivery_type === 'delivery' ? 'default' : 'outline'"
              :class="delivery.delivery_type === 'delivery' ? 'color-primary-outline' : 'text-gray-400'"
              @click="delivery.delivery_type = 'delivery'"
            >
              <span class="mb-2 flex justify-center">
                <Icon icon="mdi:truck-delivery-outline" class="text-2xl" />
              </span>
              Delivery
            </Button>
            <span
              class="absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-white shadow"
              :class="delivery.delivery_type === 'delivery' ? 'bg-primary' : 'bg-gray-400'"
            ></span>
          </div>
          <div class="relative">
          <Button
            type="button"
            class="w-full flex flex-col items-center justify-center py-12"
            :variant="delivery.delivery_type === 'pickup' ? 'default' : 'outline'"
            :class="delivery.delivery_type === 'pickup' ? 'color-primary-outline' : 'text-gray-400'"
            @click="delivery.delivery_type = 'pickup'"
          >
            <span class="mb-2 flex justify-center">
              <Icon icon="mdi:storefront-outline" class="text-2xl" />
            </span>
              Pickup
            </Button>
            <span
              class="absolute top-2 right-2 h-3 w-3 rounded-full border-2 border-white shadow"
              :class="delivery.delivery_type === 'pickup' ? 'bg-primary' : 'bg-gray-400'"
            ></span>
          </div>
        </div>
        <span v-if="errorMessages.delivery_type" class="text-sm text-red-500">{{ errorMessages.delivery_type }}</span>

        <div class="w-full">
          <Label>Attachment <span class="text-red-500">*</span></Label>
          <div v-if="errorMessages.image" class="text-sm text-red-500">{{ errorMessages.image }}</div>
          <FileInput 
              :label="'Upload Image'"
              :maxFiles="1"
              :maxSize="1024 * 1024 *3"
              :multiple="true"
              :accept="'image/*'"
              :isSubmitButton="false"
              :previewUrls="delivery.image_url"
              @selected-files="(files) => imageFiles = files"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel" class="w-full">Cancel</Button>
        <Button type="button" :disabled="isLoading" @click="handleSubmit" class="btn-primary w-full">
          {{ isLoading ? 'Saving...' : 'Save' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <DynamicDialog
    :isOpen="activeCardDialog.isOpen"
    :title="activeCardDialog.title"
    :description="activeCardDialog.description"
    @cancel="activeCardDialog.isOpen = false"
    @confirm="activateCard()"
    :customConfirmButtonText="'Yes'"
    :customCancelButtonText="'No'"
  />
</template>
