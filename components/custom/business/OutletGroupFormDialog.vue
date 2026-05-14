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
import type { OutletGroup } from '@/types/outlet'

interface Props {
  isOpen: boolean
  mode: 'create' | 'edit'
  isLoading: boolean
  outletGroup: OutletGroup
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'submit': [outletGroup: OutletGroup]
  'cancel': []
}>()

const outletGroup = ref<OutletGroup>({ ...props.outletGroup })

const nameError = ref('')

watch(
  () => props.outletGroup,
  (newGroup) => {
    outletGroup.value = { ...newGroup }
  },
  { immediate: true }
)

const validateForm = () => {
  nameError.value = ''

  if (!outletGroup.value.name) {
    nameError.value = 'Group name is required'
    return false
  }
  return true
}

const handleSubmit = () => {
  if (!validateForm()) {
    return
  }
  emit('submit', { ...outletGroup.value })
}

const handleCancel = () => {
  emit('cancel')
  emit('update:isOpen', false)
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleCancel">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {{ mode === 'create' ? 'Add Outlet Group' : 'Edit Outlet Group' }}
        </DialogTitle>
        <DialogDescription v-if="mode === 'create'">
          Create a new outlet group for your business.
        </DialogDescription>
        <DialogDescription v-else>
          Edit outlet group details.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label>Group Name <span class="text-red-500">*</span></Label>
          <Input
            v-model="outletGroup.name"
            placeholder="Enter group name"
            :class="{ 'border-red-500': nameError }"
          />
          <span v-if="nameError" class="text-sm text-red-500">{{ nameError }}</span>
        </div>

        <div class="grid gap-2">
          <Label>Description</Label>
          <Input
            v-model="outletGroup.description"
            placeholder="Enter description (optional)"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button type="submit" :disabled="isLoading" @click="handleSubmit" class="btn-primary">
          {{ isLoading ? 'Saving...' : 'Save Changes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
