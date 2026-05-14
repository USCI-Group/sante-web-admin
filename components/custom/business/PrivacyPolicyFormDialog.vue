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
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()
import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface Props {
  isOpen: boolean
  businessId: string
  privacyPolicy: string
}

const props = defineProps<Props>()
const { savePrivacyPolicy } = useBusinesses()
const isLoading = ref(false)

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [privacyPolicy: string]
  'cancel': []
}>()

const privacyPolicy = ref(props.privacyPolicy)
const privacyPolicyError = ref('')

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

watch(() => props.privacyPolicy, (newPolicy) => {
  privacyPolicy.value = newPolicy
}, { immediate: true })

watch(() => props.isOpen, (newIsOpen) => {
  if (newIsOpen) {
    privacyPolicy.value = props.privacyPolicy
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  try {
    await savePrivacyPolicy({ business_id: props.businessId, privacy_policy: privacyPolicy.value })
    toast({
      title: 'Success',
      description: 'Privacy policy saved successfully.',
      variant: 'success',
    })
    emit('submit', privacyPolicy.value)

  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to save privacy policy.',
      variant: 'destructive',
    })
  }
  isLoading.value = false
}

const validateForm = () => {
    privacyPolicyError.value = ''

    if (!privacyPolicy.value || !privacyPolicy.value.trim()) {
        privacyPolicyError.value = 'Privacy Policy cannot be empty.'
        return false
    }

    const doc = new DOMParser().parseFromString(privacyPolicy.value, "text/html")
    const text = doc.body?.textContent?.trim()
    if (!text) {
        privacyPolicyError.value = 'Privacy Policy cannot be empty.'
        return false
    }

  return true
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[1000px] min-h-[90vh] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Edit Privacy Policy</DialogTitle>
        <DialogDescription>
          Edit the Privacy Policy for your business. This will be shown to users where applicable.
        </DialogDescription>
      </DialogHeader>
      <div class="px-4 min-h-[60vh] max-h-[60vh] mb-12">
        <QuillEditor toolbar="full" v-model:content="privacyPolicy" content-type="html" />
        <span v-if="privacyPolicyError" class="text-sm text-red-500">{{ privacyPolicyError }}</span>
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
