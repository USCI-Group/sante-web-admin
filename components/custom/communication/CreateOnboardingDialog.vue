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

const { toast } = useToast()
const { createOnboarding, uploadOnboardingImage, updateOnboarding } = useCommunication()
import type { Onboarding } from '@/types/communication'

interface Props {
  isOpen: boolean
  isLoading: boolean
  businessId: string
  mode: 'create' | 'edit'
  onboarding: Onboarding
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'cancel': []
  'submit': []
}>()

const imageFiles = ref<File[]>([])
const errorMessages = ref({
  title: '',
  image: ''
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessages.value = {
        title: '',
        image: ''
      }
    }
  }
)

const validateForm = () => {
  errorMessages.value = {
    title: '',
    image: ''
  }
  if (!props.onboarding.title.trim()) {
    errorMessages.value.title = 'Title is required'
    return false
  }

  if (imageFiles.value.length === 0 && props.mode === 'create') {
    errorMessages.value.image = 'Image is required'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (props.mode === 'create') {
      await createOnboardingFunction()
  } else {
      await updateOnboardingFunction(props.onboarding)
  }

}

const createOnboardingFunction = async () => {
  try {
    const res = await createOnboarding({
      business_id: props.businessId,
      title: props.onboarding.title.trim(),
      description:  props?.onboarding?.description ? props?.onboarding?.description.trim() : '',
      is_active: props.onboarding.is_active
    });

    await uploadOnboardingImageFunction(res)

    emit('submit')
    emit('update:isOpen', false)
    toast({
      title: 'Success',
      description: 'Onboarding created successfully',
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to create onboarding',
      variant: 'destructive'
    })
    throw error
  }
}

const uploadOnboardingImageFunction = async (onboarding: Onboarding) => {
  try {
    await uploadOnboardingImage({
      id: onboarding.id,
      businessId: onboarding.business_id,
      file: imageFiles.value[0]
    })
  } catch (error: any) {
    throw error
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

async function updateOnboardingFunction(payload: Onboarding) {
  try {
    await updateOnboarding(payload)

    if (imageFiles.value.length > 0) {
      await uploadOnboardingImageFunction(payload)
    }

    emit('update:isOpen', false)
    emit('submit')
    toast({
      title: 'Success',
      description: 'Onboarding updated successfully',
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to update onboarding',
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
          {{ mode === 'create' ? 'Create Onboarding' : 'Edit Onboarding' }}
        </DialogTitle>
        <!-- <DialogDescription>
          Add a new onboarding entry for your business.
        </DialogDescription> -->
        <hr class="mt-1">
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Title <span class="text-red-500">*</span></Label>
          <Input
            v-model="onboarding.title"
            placeholder="Enter onboarding title"
            :class="{ 'border-red-500': errorMessages.title }"
          />
          <span v-if="errorMessages.title" class="text-sm text-red-500">{{ errorMessages.title }}</span>
        </div>

        <div class="grid gap-2">
          <Label>Description</Label>
          <textarea
            v-model="onboarding.description"
            placeholder="Enter description (optional)"
            rows="4"
            class="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y"
          ></textarea>
        </div>

        <div class="grid gap-2">
          <Label>Status</Label>
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span
                class="inline-block w-3 h-3 rounded-full"
                :class="onboarding.is_active ? 'bg-green-500' : 'bg-yellow-400'"
              ></span>
              <span :class="['text-sm font-medium', onboarding.is_active ? 'text-green-600' : 'text-yellow-600']">
                {{ onboarding.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <Switch 
              v-model="onboarding.is_active" 
              :checked="onboarding.is_active"
              @update:checked="onboarding.is_active = !onboarding.is_active"                  
            />
          </div>
        </div>

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
              :previewUrls="onboarding.image_url"
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
</template>
