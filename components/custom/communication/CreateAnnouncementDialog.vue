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

const { toast } = useToast()
const { createAnnouncement, updateAnnouncement } = useCommunication()
import type { Announcement } from '@/types/communication'

interface Props {
  isOpen: boolean
  isLoading: boolean
  businessId: string
  mode: 'create' | 'edit'
  announcement: Announcement
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
  description: '',
  image: '',
  start_date: '',
  end_date: '',
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessages.value = {
        title: '',
        description: '',
        image: '',
        start_date: '',
        end_date: ''
      }
    }
  }
)

const validateForm = () => {
  errorMessages.value = {
    title: '',
    description: '',
    image: '',
    start_date: '',
    end_date: '',
  }
  let hasError = false
  if (imageFiles.value.length === 0 && props.mode === 'create') {
    errorMessages.value.image = 'Image is required'
    hasError = true
  }

  if (!props.announcement.start_date) {
    errorMessages.value.start_date = 'Start date is required'
    hasError = true
  }
  if (!props.announcement.end_date) {
    errorMessages.value.end_date = 'End date is required'
    hasError = true
  }

  if (!props.announcement.title) {
    errorMessages.value.title = 'Title is required'
    hasError = true
  }
  if (!props.announcement.description) {
    errorMessages.value.description = 'Description is required'
    hasError = true
  }

  return !hasError
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (props.mode === 'create') {
    await createAnnouncementFunction()
  } else {
    await updateAnnouncementFunction(props.announcement)
  }

}

const createAnnouncementFunction = async () => {
  try {
    const res = await createAnnouncement({
      business_id: props.businessId,
      is_active: props.announcement.is_active,
      start_date: props.announcement.start_date || '',
      end_date: props.announcement.end_date || '',
      file: imageFiles.value[0],
      title: props.announcement.title,
      description: props.announcement.description,
    });

    emit('submit')
    emit('update:isOpen', false)
    toast({
      title: 'Success',
      description: 'Announcement created successfully',
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || error?.data || 'Failed to create announcement',
      variant: 'destructive'
    })
    throw error
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

async function updateAnnouncementFunction(announcement: Announcement) {
  try {
    const payload: any = {
      announcement_id: announcement.id,
      is_active: announcement.is_active,
      start_date: announcement.start_date || '',
      end_date: announcement.end_date || '',
      title: announcement.title,
      description: announcement.description,
    }

    if (imageFiles.value.length > 0) {
      payload.file = imageFiles.value[0]
    }

    await updateAnnouncement(payload)

    emit('update:isOpen', false)
    emit('submit')
    toast({
      title: 'Success',
      description: 'Announcement updated successfully',
      variant: 'success'
    })
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || error?.data || 'Failed to update announcement',
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
          {{ mode === 'create' ? 'Create Announcement' : 'Edit Announcement' }}
        </DialogTitle>
        <!-- <DialogDescription>
          Add a new onboarding entry for your business.
        </DialogDescription> -->
        <hr class="mt-1">
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label>Title <span class="text-red-500">*</span></Label>
            <Input
              v-model="announcement.title"
              placeholder="Enter announcement title"
              :class="{ 'border-red-500': errorMessages.title }"
            />
            <span v-if="errorMessages.title" class="text-sm text-red-500">{{ errorMessages.title }}</span>
          </div>
        </div>

        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label>Description <span class="text-red-500">*</span></Label>
            <textarea
              v-model="announcement.description"
              placeholder="Enter announcement description"
              class="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y"
              rows="4"
            ></textarea>
            <span v-if="errorMessages.description" class="text-sm text-red-500">{{ errorMessages.description }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>Start Date <span class="text-red-500">*</span></Label>
            <VueDatePicker 
              :enable-time-picker="false"
              v-model="announcement.start_date"
            />
            <div v-if="errorMessages.start_date" class="text-sm text-red-500">{{ errorMessages.start_date }}</div>
          </div>
          <div class="grid gap-2">
            <Label>End Date <span class="text-red-500">*</span></Label>
            <VueDatePicker 
              :enable-time-picker="false"
              v-model="announcement.end_date"
            />
            <div v-if="errorMessages.end_date" class="text-sm text-red-500">{{ errorMessages.end_date }}</div>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Status <span class="text-red-500">*</span></Label>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                class="form-radio accent-primary"
                v-model="announcement.is_active"
                :value="true"
              />
              <span class="text-sm font-medium">Active</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                class="form-radio accent-primary"
                v-model="announcement.is_active"
                :value="false"
              />
              <span class="text-sm font-medium">Inactive</span>
            </label>
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
              :previewUrls="announcement.image_url"
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
