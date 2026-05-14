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
import { QuillEditor } from '@vueup/vue-quill'
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()
import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface Props {
  isOpen: boolean
  businessId: string
  terms: string
}

const props = defineProps<Props>()
const { saveTnC } = useBusinesses()
const isLoading = ref(false)

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [terms: string]
  'cancel': []
}>()

const terms = ref(props.terms)
const termsError = ref('')

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}

watch(() => props.terms, (newTerms) => {
  terms.value = newTerms
}, { immediate: true })

watch(() => props.isOpen, (newIsOpen) => {
  if (newIsOpen) {
    terms.value = props.terms
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  try {
    await saveTnC({ business_id: props.businessId, terms_of_service: terms.value })
    toast({
      title: 'Success',
      description: 'Terms and conditions saved successfully.',
      variant: 'success',
    })
    emit('submit', props.terms)

  } catch (error: any) {
    toast({
      title: 'Error',
      description: error?.data?.message || 'Failed to save terms and conditions.',
      variant: 'destructive',
    })
  }
  isLoading.value = false
}

const validateForm = () => {
    termsError.value = ''

    if (!terms.value || !terms.value.trim()) {
        termsError.value = 'Terms and Conditions cannot be empty.'
        return false
    }

    const doc = new DOMParser().parseFromString(terms.value, "text/html")
    const text = doc.body?.textContent?.trim()
    if (!text) {
        termsError.value = 'Terms and Conditions cannot be empty.'
        return false
    }

  return true
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[1000px] min-h-[90vh] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Edit Terms and Conditions</DialogTitle>
        <DialogDescription>
          Edit the Terms and Conditions for your business. These will be shown to users where applicable.
        </DialogDescription>
      </DialogHeader>
      <div class="px-4 min-h-[60vh] max-h-[60vh] mb-12">
        <QuillEditor toolbar="full" v-model:content="terms" content-type="html" />
        <span v-if="termsError" class="text-sm text-red-500">{{ termsError }}</span>
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
