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
import BusinessDetailsForm from './BusinessDetailsForm.vue'
import type { Business } from '@/types/business'

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  business: Business,
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [business: Business]
  'cancel': []
}>()

const handleSubmit = (business: Business) => {
  emit('submit', business)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ mode === 'create' ? 'Create New Business' : 'Edit Business' }}</DialogTitle>
        <DialogDescription v-if="mode === 'create'">
          Create a new business profile
        </DialogDescription>
        <DialogDescription v-else>
          Edit business profile details
        </DialogDescription>
      </DialogHeader>

      <BusinessDetailsForm
        :business="props.business"
        :mode="mode"
        :is-loading="props.isLoading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </DialogContent>
  </Dialog>
</template>
