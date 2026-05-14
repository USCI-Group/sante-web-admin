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
import { Icon } from '@iconify/vue'
interface Props {
  isOpen: boolean
  title: string
  description?: string
  confirmationText?: string
  showConfirmationInput?: boolean
  customConfirmButtonText?: string
  customCancelButtonText?: string
  isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'confirm': [confirmation?: string]
  'cancel': []
}>()

const confirmation = ref('')

const handleConfirm = () => {
  emit('confirm', confirmation.value)
  confirmation.value = ''
}

const handleCancel = () => {
  emit('cancel')
  confirmation.value = ''
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">
          {{ description }}
          <template v-if="confirmationText">
            <br>
            <span class="font-bold text-red-500">{{ confirmationText }}</span>
          </template>
        </DialogDescription>
        <Input
          class="mt-2"
          v-if="showConfirmationInput"
          v-model="confirmation"
          placeholder="Enter text to confirm"
        />
      </DialogHeader>
      <DialogFooter>
        <Button v-if="customConfirmButtonText" class="btn-primary" @click="handleConfirm">
          {{ customConfirmButtonText }}
        </Button>
        <Button v-if="customConfirmButtonText" class="btn-secondary" @click="handleCancel">
          {{ customCancelButtonText }}
        </Button>
        <Button v-if="!customConfirmButtonText" :disabled="props.isLoading" class="btn-primary" @click="handleConfirm">
          {{ props.isLoading ? 'Confirming...' : 'Confirm' }} <Icon icon="mdi:loading" v-if="props.isLoading" class="animate-spin" />
        </Button>
        <Button v-if="!customConfirmButtonText" :disabled="props.isLoading" class="btn-secondary" @click="handleCancel">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
