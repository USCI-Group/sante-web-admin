<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref, watch } from 'vue'
import { useCommunication } from '~/composables/useCommunication'
import { useToast } from '~/components/ui/toast/use-toast'
import FileInput from '~/components/custom/fileinput/fileinput.vue'

const { toast } = useToast()
const { createFeedbackQuestion, updateFeedbackQuestion } = useCommunication()
import type { FeedbackQuestion } from '@/types/communication'

interface Props {
  isOpen: boolean
  isLoading: boolean
  businessId: string
  mode: 'create' | 'edit'
  feedbackQuestion: FeedbackQuestion
  sections: string[]
}

const props = defineProps<Props>()

const imageFiles = ref<File[]>([])

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'cancel': []
  'submit': []
}>()

const errorMessages = ref({
  question: '',
  section: '',
  image: ''
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessages.value = {
        question: '',
        section: '',
        image: ''
      }
    }
  }
)

const validateForm = () => {
  errorMessages.value = {
    question: '',
    section: '',
    image: ''
  }

  let hasError = false

  if (!props.feedbackQuestion.question) {
    errorMessages.value.question = 'Question is required'
    hasError = true
  }

  if (!props.feedbackQuestion.section) {
    errorMessages.value.section = 'Section is required'
    hasError = true
  }

  if (props.mode === 'create' && imageFiles.value.length === 0) {
    errorMessages.value.image = 'Image is required'
    hasError = true
  }

  return !hasError
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  if (props.mode === 'create') {
    await createFeedbackQuestionFunction()
  } else {
    await updateFeedbackQuestionFunction(props.feedbackQuestion)
  }
}

const createFeedbackQuestionFunction = async () => {
  try {
    await createFeedbackQuestion({
      business_id: props.businessId,
      question: props.feedbackQuestion.question.trim(),
      is_active: props.feedbackQuestion.is_active,
      section: props.feedbackQuestion.section.trim(),
      file: imageFiles.value[0]
    })

    emit('submit')
    emit('update:isOpen', false)
    toast({
      title: 'Success',
      description: 'Feedback question created successfully',
      variant: 'success'
    })
    imageFiles.value = []
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to create feedback question',
      variant: 'destructive'
    })
    imageFiles.value = []
    throw error
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

async function updateFeedbackQuestionFunction(feedbackQuestion: FeedbackQuestion) {
  try {
    const payload:any = {
      feedback_question_id: feedbackQuestion.id,
      question: feedbackQuestion.question.trim(),
      is_active: feedbackQuestion.is_active,
      section: feedbackQuestion.section.trim()
    }

    if (imageFiles.value.length > 0) {
      payload.file = imageFiles.value[0]
    }

    await updateFeedbackQuestion(payload)

    emit('update:isOpen', false)
    emit('submit')
    toast({
      title: 'Success',
      description: 'Feedback question updated successfully',
      variant: 'success'
    })
    imageFiles.value = []
  } catch (error: any) {
    emit('submit')
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to update feedback question',
      variant: 'destructive'
    })
    imageFiles.value = []
    throw error
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? 'Create Feedback Question' : 'Edit Feedback Question' }}
        </DialogTitle>
        <hr class="mt-1">
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Question <span class="text-red-500">*</span></Label>
          <textarea
            v-model="feedbackQuestion.question"
            placeholder="Enter feedback question"
            rows="3"
            class="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y"
            :class="{ 'border-red-500': errorMessages.question }"
          ></textarea>
          <span v-if="errorMessages.question" class="text-sm text-red-500">{{ errorMessages.question }}</span>
        </div>

        <div class="grid gap-2">
          <Label>Section <span class="text-red-500">*</span></Label>
          <input
            list="options"
            v-model="feedbackQuestion.section"
            class="border rounded p-2"
          />

          <datalist id="options">
            <option v-for="section in sections" :value="section"></option>
          </datalist>
          <span v-if="errorMessages.section" class="text-sm text-red-500">{{ errorMessages.section }}</span>
        </div>

        <div class="grid gap-2">
          <Label>Status <span class="text-red-500">*</span></Label>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                class="form-radio accent-primary"
                v-model="feedbackQuestion.is_active"
                :value="true"
              />
              <span class="text-sm font-medium">Active</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                class="form-radio accent-primary"
                v-model="feedbackQuestion.is_active"
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
              :previewUrls="feedbackQuestion.image_url"
              @selected-files="(files) => imageFiles = files"
          />
        </div>

      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel" class="w-full">Cancel</Button>
        <Button type="button" :disabled="isLoading" @click="handleSubmit" class="btn-primary w-full">
          <span v-if="mode === 'create'">
            {{ isLoading ? 'Saving...' : 'Submit' }}
          </span>
          <span v-else>
            {{ isLoading ? 'Updating...' : 'Update' }}
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
